#!/bin/bash

# Cost-Optimized AWS Deployment Script for SplitBuddy Backend
# This script deploys the NestJS application to AWS with cost optimization

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY_NAME="splitbuddy-backend"
ECR_REPOSITORY_URI=""
CLUSTER_NAME="splitbuddy-cluster"
SERVICE_NAME="splitbuddy-backend-service"
TASK_DEFINITION_NAME="splitbuddy-backend-task"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Cost-Optimized AWS deployment for SplitBuddy Backend${NC}"
echo -e "${BLUE}💰 Estimated monthly cost: $45-65${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Function to log messages
log() {
    echo -e "${GREEN}✅ $1${NC}"
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Build the production Docker image (optimized)
log "Building optimized production Docker image..."
docker build -t splitbuddy-backend:latest .

# Step 2: Get AWS Account ID
log "Getting AWS Account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME"

# Step 3: Create ECR repository if it doesn't exist
log "Checking ECR repository..."
if ! aws ecr describe-repositories --repository-names $ECR_REPOSITORY_NAME --region $AWS_REGION &> /dev/null; then
    log "Creating ECR repository..."
    aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION
else
    log "ECR repository already exists"
fi

# Step 4: Login to ECR
log "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_URI

# Step 5: Tag and push the image
log "Tagging Docker image..."
docker tag splitbuddy-backend:latest $ECR_REPOSITORY_URI:latest

log "Pushing Docker image to ECR..."
docker push $ECR_REPOSITORY_URI:latest

# Step 6: Create or update ECS cluster (cost-optimized)
log "Checking ECS cluster..."
if ! aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION --query 'clusters[0].status' --output text &> /dev/null || [ "$(aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION --query 'clusters[0].status' --output text)" = "None" ]; then
    log "Creating cost-optimized ECS cluster..."
    aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION --settings name=containerInsights,value=disabled
else
    log "ECS cluster already exists"
fi

# Step 7: Create cost-optimized task definition
log "Creating cost-optimized ECS task definition..."
cat > task-definition-cost-optimized.json << EOF
{
    "family": "$TASK_DEFINITION_NAME",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "executionRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "splitbuddy-backend",
            "image": "$ECR_REPOSITORY_URI:latest",
            "portMappings": [
                {
                    "containerPort": 5900,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {"name": "NODE_ENV", "value": "production"},
                {"name": "DB_HOST", "value": "\${DB_HOST}"},
                {"name": "DB_PORT", "value": "\${DB_PORT}"},
                {"name": "DB_USERNAME", "value": "\${DB_USERNAME}"},
                {"name": "DB_PASSWORD", "value": "\${DB_PASSWORD}"},
                {"name": "DB_DATABASE", "value": "\${DB_DATABASE}"},
                {"name": "JWT_SECRET", "value": "\${JWT_SECRET}"},
                {"name": "SMTP_HOST", "value": "\${SMTP_HOST}"},
                {"name": "SMTP_PORT", "value": "\${SMTP_PORT}"},
                {"name": "SMTP_USER", "value": "\${SMTP_USER}"},
                {"name": "SMTP_PASS", "value": "\${SMTP_PASS}"},
                {"name": "SMTP_FROM", "value": "\${SMTP_FROM}"},
                {"name": "REDIS_HOST", "value": "\${REDIS_HOST}"},
                {"name": "REDIS_PORT", "value": "\${REDIS_PORT}"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/$TASK_DEFINITION_NAME",
                    "awslogs-region": "$AWS_REGION",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "healthCheck": {
                "command": ["CMD-SHELL", "curl -f http://localhost:5900/health || exit 1"],
                "interval": 60,
                "timeout": 10,
                "retries": 2,
                "startPeriod": 120
            }
        }
    ]
}
EOF

aws ecs register-task-definition --cli-input-json file://task-definition-cost-optimized.json --region $AWS_REGION

# Step 8: Create or update ECS service
log "Checking ECS service..."
if ! aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION --query 'services[0].status' --output text &> /dev/null || [ "$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION --query 'services[0].status' --output text)" = "None" ]; then
    warn "ECS service doesn't exist. You'll need to create it manually with proper VPC, subnets, and security groups."
    warn "Use the following command to create the service:"
    echo "aws ecs create-service --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --task-definition $TASK_DEFINITION_NAME --desired-count 1 --launch-type FARGATE --network-configuration \"awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}\" --region $AWS_REGION"
else
    log "Updating ECS service..."
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $TASK_DEFINITION_NAME --region $AWS_REGION
fi

# Cleanup
rm -f task-definition-cost-optimized.json

log "Cost-optimized deployment completed successfully!"
log "ECR Repository: $ECR_REPOSITORY_URI"
log "ECS Cluster: $CLUSTER_NAME"
log "ECS Service: $SERVICE_NAME"

echo -e "${GREEN}🎉 Cost-optimized deployment to AWS completed!${NC}"
echo -e "${BLUE}💰 Estimated monthly cost breakdown:${NC}"
echo -e "${BLUE}   • RDS db.t3.micro: ~$15-20/month${NC}"
echo -e "${BLUE}   • ElastiCache cache.t3.micro: ~$15-20/month${NC}"
echo -e "${BLUE}   • ECS Fargate (256 CPU, 512 MB): ~$10-15/month${NC}"
echo -e "${BLUE}   • Data transfer: ~$5-10/month${NC}"
echo -e "${BLUE}   • Total: ~$45-65/month${NC}"

echo -e "${YELLOW}💡 Cost optimization tips:${NC}"
echo -e "${YELLOW}   • Use AWS Free Tier for first 12 months${NC}"
echo -e "${YELLOW}   • Consider stopping services when not in use${NC}"
echo -e "${YELLOW}   • Monitor usage with AWS Cost Explorer${NC}"
echo -e "${YELLOW}   • Set up billing alerts to avoid surprises${NC}"