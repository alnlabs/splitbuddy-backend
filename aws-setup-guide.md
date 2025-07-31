# SplitBuddy Backend AWS Setup Guide

This guide will help you deploy the SplitBuddy backend to AWS with your own credentials.

## 🚀 Quick Start

### **Step 1: Install Prerequisites**

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Docker (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Terraform (optional, for infrastructure as code)
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs)"
sudo apt-get update && sudo apt-get install terraform
```

### **Step 2: Configure AWS Credentials**

You have two options:

#### **Option A: Using AWS CLI (Recommended)**

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
# Enter your output format (json)
```

#### **Option B: Using Environment Variables**

```bash
export AWS_ACCESS_KEY_ID=your_access_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_key_here
export AWS_DEFAULT_REGION=us-east-1
```

### **Step 3: Deploy Infrastructure (Optional)**

If you want to use Terraform for infrastructure:

```bash
# Use the cost-optimized configuration
cp aws-infrastructure-cost-optimized.tf aws-infrastructure.tf

# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply
```

### **Step 4: Deploy Application**

```bash
# Make the deployment script executable
chmod +x aws-deploy-splitbuddy.sh

# Run the deployment
./aws-deploy-splitbuddy.sh
```

## 🔧 Manual Infrastructure Setup

If you prefer to set up infrastructure manually:

### **1. Create VPC and Subnets**

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=splitbuddy-vpc}]'

# Create public subnet
aws ec2 create-subnet --vpc-id vpc-xxxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=splitbuddy-public-subnet}]'

# Create private subnet
aws ec2 create-subnet --vpc-id vpc-xxxxx --cidr-block 10.0.10.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=splitbuddy-private-subnet}]'
```

### **2. Create Security Groups**

```bash
# Create app security group
aws ec2 create-security-group --group-name splitbuddy-app-sg --description "Security group for SplitBuddy app" --vpc-id vpc-xxxxx

# Create database security group
aws ec2 create-security-group --group-name splitbuddy-db-sg --description "Security group for SplitBuddy database" --vpc-id vpc-xxxxx

# Add rules to app security group
aws ec2 authorize-security-group-ingress --group-id sg-xxxxx --protocol tcp --port 5900 --cidr 0.0.0.0/0

# Add rules to database security group
aws ec2 authorize-security-group-ingress --group-id sg-yyyyy --protocol tcp --port 5432 --source-group sg-xxxxx
```

### **3. Create RDS Database**

```bash
# Create DB subnet group
aws rds create-db-subnet-group --db-subnet-group-name splitbuddy-db-subnet-group --db-subnet-group-description "Subnet group for SplitBuddy database" --subnet-ids subnet-xxxxx subnet-yyyyy

# Create RDS instance
aws rds create-db-instance \
    --db-instance-identifier splitbuddy-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username splitbuddy_user \
    --master-user-password your_secure_password \
    --allocated-storage 20 \
    --db-subnet-group-name splitbuddy-db-subnet-group \
    --vpc-security-group-ids sg-yyyyy \
    --backup-retention-period 3 \
    --storage-encrypted false
```

### **4. Create ElastiCache Redis**

```bash
# Create Redis subnet group
aws elasticache create-cache-subnet-group --cache-subnet-group-name splitbuddy-redis-subnet-group --cache-subnet-group-description "Subnet group for SplitBuddy Redis" --subnet-ids subnet-xxxxx subnet-yyyyy

# Create Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id splitbuddy-redis \
    --engine redis \
    --node-type cache.t3.micro \
    --num-cache-nodes 1 \
    --cache-subnet-group-name splitbuddy-redis-subnet-group \
    --security-group-ids sg-xxxxx
```

## 📋 Environment Variables

Create a `.env.production` file with your configuration:

```env
# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=5432
DB_USERNAME=splitbuddy_user
DB_PASSWORD=your_secure_password
DB_DATABASE=splitbuddy

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

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

## 🔍 Verification Steps

### **1. Check ECS Service Status**

```bash
aws ecs describe-services --cluster splitbuddy-cluster --services splitbuddy-backend-service
```

### **2. Check Application Logs**

```bash
aws logs describe-log-groups --log-group-name-prefix "/ecs/splitbuddy-backend"
```

### **3. Test Application Health**

```bash
# Get the public IP of your ECS task
aws ecs describe-tasks --cluster splitbuddy-cluster --tasks task-id

# Test the health endpoint
curl http://your-public-ip:5900/health
```

## 💰 Cost Monitoring

### **Set Up Billing Alerts**

```bash
# Create SNS topic
aws sns create-topic --name "SplitBuddy-Billing-Alerts"

# Subscribe to alerts
aws sns subscribe \
    --topic-arn "arn:aws:sns:us-east-1:ACCOUNT:SplitBuddy-Billing-Alerts" \
    --protocol email \
    --notification-endpoint "your-email@example.com"

# Create CloudWatch alarm
aws cloudwatch put-metric-alarm \
    --alarm-name "SplitBuddy-Billing-Alert" \
    --alarm-description "Alert when estimated charges exceed $50" \
    --metric-name "EstimatedCharges" \
    --namespace "AWS/Billing" \
    --statistic "Maximum" \
    --period 86400 \
    --threshold 50 \
    --comparison-operator "GreaterThanThreshold" \
    --evaluation-periods 1
```

## 🛠️ Troubleshooting

### **Common Issues**

1. **AWS Credentials Not Found**

   ```bash
   # Verify credentials
   aws sts get-caller-identity
   ```

2. **ECR Login Failed**

   ```bash
   # Re-login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **ECS Service Won't Start**

   ```bash
   # Check service events
   aws ecs describe-services --cluster splitbuddy-cluster --services splitbuddy-backend-service --query 'services[0].events'
   ```

4. **Database Connection Issues**
   ```bash
   # Check RDS status
   aws rds describe-db-instances --db-instance-identifier splitbuddy-db
   ```

## 📞 Support

If you encounter issues:

1. Check AWS CloudWatch logs
2. Verify security group rules
3. Ensure all environment variables are set
4. Check AWS Cost Explorer for unexpected charges
5. Review the troubleshooting section above

## 🎯 Next Steps

After successful deployment:

1. **Test the API endpoints**
2. **Set up monitoring and alerting**
3. **Configure auto-scaling if needed**
4. **Set up CI/CD pipeline**
5. **Implement backup strategies**
6. **Monitor costs regularly**

This setup provides a cost-effective, scalable solution for your SplitBuddy backend with estimated monthly costs of $45-65.
