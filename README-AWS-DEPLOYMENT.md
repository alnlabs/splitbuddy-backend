# AWS Deployment Guide for SplitBuddy Backend

This guide provides step-by-step instructions for deploying the SplitBuddy NestJS backend to AWS using ECS Fargate, RDS PostgreSQL, and ElastiCache Redis.

## Prerequisites

1. **AWS CLI** installed and configured
2. **Docker** installed
3. **Terraform** installed (optional, for infrastructure as code)
4. **AWS Account** with appropriate permissions

## Deployment Options

### Option 1: Quick Deployment with Script

1. **Configure AWS CLI**

   ```bash
   aws configure
   ```

2. **Make the deployment script executable**

   ```bash
   chmod +x aws-deploy.sh
   ```

3. **Run the deployment script**
   ```bash
   ./aws-deploy.sh
   ```

### Option 2: Infrastructure as Code with Terraform

1. **Initialize Terraform**

   ```bash
   terraform init
   ```

2. **Create terraform.tfvars file**

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

3. **Plan the deployment**

   ```bash
   terraform plan
   ```

4. **Apply the infrastructure**

   ```bash
   terraform apply
   ```

5. **Deploy the application**
   ```bash
   ./aws-deploy.sh
   ```

## Manual Deployment Steps

### 1. Build and Push Docker Image

```bash
# Build the image
docker build -t splitbuddy-backend:latest .

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
ECR_REPOSITORY_NAME="splitbuddy-backend"
ECR_REPOSITORY_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME"

# Create ECR repository
aws ecr create-repository --repository-name $ECR_REPOSITORY_NAME --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_URI

# Tag and push
docker tag splitbuddy-backend:latest $ECR_REPOSITORY_URI:latest
docker push $ECR_REPOSITORY_URI:latest
```

### 2. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name splitbuddy-cluster --region us-east-1
```

### 3. Create Task Definition

Create a file named `task-definition.json`:

```json
{
  "family": "splitbuddy-backend-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "splitbuddy-backend",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/splitbuddy-backend:latest",
      "portMappings": [
        {
          "containerPort": 5900,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "DB_HOST", "value": "YOUR_RDS_ENDPOINT" },
        { "name": "DB_PORT", "value": "5432" },
        { "name": "DB_USERNAME", "value": "splitbuddy_user" },
        { "name": "DB_PASSWORD", "value": "YOUR_DB_PASSWORD" },
        { "name": "DB_DATABASE", "value": "splitbuddy" },
        { "name": "JWT_SECRET", "value": "YOUR_JWT_SECRET" },
        { "name": "REDIS_HOST", "value": "YOUR_REDIS_ENDPOINT" },
        { "name": "REDIS_PORT", "value": "6379" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/splitbuddy-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register the task definition:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json --region us-east-1
```

### 4. Create ECS Service

```bash
aws ecs create-service \
    --cluster splitbuddy-cluster \
    --service-name splitbuddy-backend-service \
    --task-definition splitbuddy-backend-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
    --region us-east-1
```

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USERNAME=splitbuddy_user
DB_PASSWORD=your-secure-password
DB_DATABASE=splitbuddy

# JWT
JWT_SECRET=your-super-secret-jwt-key

# SMTP (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Redis
REDIS_HOST=your-redis-endpoint.amazonaws.com
REDIS_PORT=6379

# Environment
NODE_ENV=production
```

## AWS Services Used

### 1. **Amazon ECS (Elastic Container Service)**

- Manages containerized applications
- Uses Fargate for serverless container execution
- Handles scaling and load balancing

### 2. **Amazon ECR (Elastic Container Registry)**

- Stores Docker images
- Integrates with ECS for seamless deployment

### 3. **Amazon RDS (Relational Database Service)**

- PostgreSQL database
- Automated backups and maintenance
- High availability with Multi-AZ

### 4. **Amazon ElastiCache**

- Redis for caching and session storage
- Improves application performance

### 5. **Application Load Balancer (ALB)**

- Distributes incoming traffic
- Health checks and SSL termination
- Auto-scaling integration

### 6. **CloudWatch**

- Monitoring and logging
- Application metrics and alarms

## Security Considerations

1. **IAM Roles**: Use least privilege principle
2. **Security Groups**: Restrict access to necessary ports only
3. **VPC**: Use private subnets for databases
4. **Secrets Management**: Use AWS Secrets Manager for sensitive data
5. **SSL/TLS**: Enable HTTPS for all external communications

## Monitoring and Logging

### CloudWatch Logs

```bash
# View application logs
aws logs describe-log-groups --log-group-name-prefix "/ecs/splitbuddy-backend"

# Get log events
aws logs get-log-events --log-group-name "/ecs/splitbuddy-backend" --log-stream-name "ecs/splitbuddy-backend/container-id"
```

### ECS Service Status

```bash
# Check service status
aws ecs describe-services --cluster splitbuddy-cluster --services splitbuddy-backend-service

# Check task status
aws ecs list-tasks --cluster splitbuddy-cluster --service-name splitbuddy-backend-service
```

## Scaling

### Auto Scaling

```bash
# Create auto scaling target
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/splitbuddy-cluster/splitbuddy-backend-service \
    --min-capacity 1 \
    --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/splitbuddy-cluster/splitbuddy-backend-service \
    --policy-name cpu-target-tracking \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration '{"TargetValue": 70.0, "PredefinedMetricSpecification": {"PredefinedMetricType": "ECSServiceAverageCPUUtilization"}}'
```

## Cost Optimization

1. **Use Spot Instances** for non-critical workloads
2. **Right-size instances** based on actual usage
3. **Enable auto-scaling** to scale down during low usage
4. **Use reserved instances** for predictable workloads
5. **Monitor costs** with AWS Cost Explorer

## Troubleshooting

### Common Issues

1. **Task fails to start**
   - Check task definition and container logs
   - Verify environment variables
   - Check security group rules

2. **Database connection issues**
   - Verify RDS endpoint and credentials
   - Check security group allows ECS to RDS
   - Ensure database is accessible from VPC

3. **High latency**
   - Check if services are in same region
   - Monitor CloudWatch metrics
   - Consider using connection pooling

### Useful Commands

```bash
# Get task logs
aws logs tail /ecs/splitbuddy-backend --follow

# Describe task
aws ecs describe-tasks --cluster splitbuddy-cluster --tasks task-id

# Update service
aws ecs update-service --cluster splitbuddy-cluster --service splitbuddy-backend-service --task-definition splitbuddy-backend-task:revision
```

## Cleanup

To remove all resources:

```bash
# If using Terraform
terraform destroy

# If using manual deployment
aws ecs update-service --cluster splitbuddy-cluster --service splitbuddy-backend-service --desired-count 0
aws ecs delete-service --cluster splitbuddy-cluster --service splitbuddy-backend-service
aws ecs delete-cluster --cluster splitbuddy-cluster
aws ecr delete-repository --repository-name splitbuddy-backend --force
```

## Support

For issues and questions:

1. Check AWS documentation
2. Review CloudWatch logs
3. Check ECS service events
4. Verify security group configurations
