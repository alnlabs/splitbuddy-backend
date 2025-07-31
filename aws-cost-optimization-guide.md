# AWS Cost Optimization Guide for SplitBuddy Backend

This guide provides comprehensive strategies to minimize AWS costs while maintaining performance and reliability for the SplitBuddy backend deployment.

## 🎯 Cost Optimization Overview

### **Target Monthly Cost: $45-65**

- **RDS PostgreSQL**: $15-20/month
- **ElastiCache Redis**: $15-20/month
- **ECS Fargate**: $10-15/month
- **Data Transfer**: $5-10/month

## 🚀 Immediate Cost Savings

### **1. Use AWS Free Tier (First 12 Months)**

```bash
# Free tier includes:
# - 750 hours/month of t2.micro or t3.micro instances
# - 20GB of storage
# - 1GB of data transfer
# - 25GB of CloudWatch logs
```

### **2. Right-Size Instances**

```bash
# Current optimized configuration:
# - RDS: db.t3.micro (1 vCPU, 1GB RAM)
# - ElastiCache: cache.t3.micro (1 vCPU, 0.5GB RAM)
# - ECS Fargate: 256 CPU units, 512MB RAM
```

### **3. Disable Unnecessary Features**

- ❌ Container Insights (saves ~$5/month)
- ❌ ECR Image Scanning (saves ~$1/month)
- ❌ Storage Encryption (saves ~$2/month)
- ❌ Backup Retention > 3 days (saves ~$3/month)

## 📊 Cost Breakdown Analysis

### **Database (RDS PostgreSQL)**

```bash
# db.t3.micro: $15-20/month
# Optimizations:
# - Single AZ deployment (saves ~$15/month vs Multi-AZ)
# - Reduced backup retention (3 days vs 7 days)
# - Disabled storage encryption
# - Disabled auto minor version upgrades
```

### **Caching (ElastiCache Redis)**

```bash
# cache.t3.micro: $15-20/month
# Optimizations:
# - Single node (no replication)
# - Disabled encryption
# - Minimal storage allocation
```

### **Application (ECS Fargate)**

```bash
# 256 CPU units + 512MB RAM: $10-15/month
# Optimizations:
# - Minimal resource allocation
# - Reduced health check frequency
# - Single task deployment
```

## 🔧 Advanced Cost Optimization

### **1. Auto Scaling Strategies**

```bash
# Scale to zero during off-hours
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/splitbuddy-cluster/splitbuddy-backend-service \
    --min-capacity 0 \
    --max-capacity 2

# Scale based on CPU utilization
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --scalable-dimension ecs:service:DesiredCount \
    --resource-id service/splitbuddy-cluster/splitbuddy-backend-service \
    --policy-name cpu-target-tracking \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration '{"TargetValue": 80.0, "PredefinedMetricSpecification": {"PredefinedMetricType": "ECSServiceAverageCPUUtilization"}}'
```

### **2. Spot Instances (Alternative)**

```bash
# For non-critical workloads, consider EC2 with Spot instances
# Can save 60-90% compared to On-Demand pricing
# Requires application to handle interruptions gracefully
```

### **3. Reserved Instances**

```bash
# For predictable workloads, consider Reserved Instances
# 1-year term: 30-40% savings
# 3-year term: 60-70% savings
```

## 🛠️ Implementation Steps

### **Step 1: Deploy Cost-Optimized Infrastructure**

```bash
# Use the cost-optimized Terraform configuration
cp aws-infrastructure-cost-optimized.tf aws-infrastructure.tf
terraform init
terraform plan
terraform apply
```

### **Step 2: Deploy Application**

```bash
# Use the cost-optimized deployment script
chmod +x aws-deploy-cost-optimized.sh
./aws-deploy-cost-optimized.sh
```

### **Step 3: Set Up Monitoring**

```bash
# Create CloudWatch billing alarms
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

## 📈 Performance vs Cost Trade-offs

### **Acceptable Trade-offs for Cost Savings**

- ✅ **Single AZ deployment** (99.95% vs 99.99% availability)
- ✅ **Reduced backup retention** (3 days vs 7 days)
- ✅ **Minimal resource allocation** (adequate for small-medium load)
- ✅ **Reduced health check frequency** (60s vs 30s intervals)

### **Not Recommended for Production**

- ❌ **No backups** (data loss risk)
- ❌ **No monitoring** (difficult troubleshooting)
- ❌ **No security groups** (security risk)
- ❌ **No logging** (compliance issues)

## 💡 Cost Monitoring and Alerts

### **Set Up Billing Alerts**

```bash
# Create SNS topic for billing alerts
aws sns create-topic --name "SplitBuddy-Billing-Alerts"

# Subscribe to billing alerts
aws sns subscribe \
    --topic-arn "arn:aws:sns:us-east-1:ACCOUNT:SplitBuddy-Billing-Alerts" \
    --protocol email \
    --notification-endpoint "your-email@example.com"
```

### **Monitor Usage with AWS Cost Explorer**

```bash
# Enable Cost Explorer
aws ce get-cost-and-usage \
    --time-period Start=2024-01-01,End=2024-01-31 \
    --granularity MONTHLY \
    --metrics BlendedCost \
    --group-by Type=DIMENSION,Key=SERVICE
```

## 🔄 Scaling Strategies

### **Development Environment**

```bash
# Scale down during development
aws ecs update-service \
    --cluster splitbuddy-cluster \
    --service splitbuddy-backend-service \
    --desired-count 0
```

### **Production Environment**

```bash
# Scale up for production
aws ecs update-service \
    --cluster splitbuddy-cluster \
    --service splitbuddy-backend-service \
    --desired-count 1
```

## 🚨 Emergency Cost Control

### **Stop All Services**

```bash
# Emergency stop script
#!/bin/bash
echo "Stopping all SplitBuddy services..."

# Stop ECS service
aws ecs update-service \
    --cluster splitbuddy-cluster \
    --service splitbuddy-backend-service \
    --desired-count 0

# Stop RDS (if needed)
aws rds stop-db-instance --db-instance-identifier splitbuddy-db

# Stop ElastiCache (if needed)
aws elasticache delete-cache-cluster --cache-cluster-id splitbuddy-redis

echo "All services stopped. Remember to restart when needed."
```

### **Restart Services**

```bash
# Restart script
#!/bin/bash
echo "Restarting SplitBuddy services..."

# Start RDS
aws rds start-db-instance --db-instance-identifier splitbuddy-db

# Wait for RDS to be available
aws rds wait db-instance-available --db-instance-identifier splitbuddy-db

# Start ElastiCache
aws elasticache create-cache-cluster \
    --cache-cluster-id splitbuddy-redis \
    --engine redis \
    --node-type cache.t3.micro \
    --num-cache-nodes 1

# Start ECS service
aws ecs update-service \
    --cluster splitbuddy-cluster \
    --service splitbuddy-backend-service \
    --desired-count 1

echo "All services restarted."
```

## 📋 Monthly Cost Checklist

### **Week 1: Review and Optimize**

- [ ] Check AWS Cost Explorer for unexpected charges
- [ ] Review CloudWatch logs retention (7 days max)
- [ ] Verify auto-scaling is working correctly
- [ ] Check for unused resources

### **Week 2: Monitor Performance**

- [ ] Monitor application response times
- [ ] Check database connection pool usage
- [ ] Review Redis cache hit rates
- [ ] Analyze error rates and logs

### **Week 3: Plan Scaling**

- [ ] Review traffic patterns
- [ ] Plan for peak usage periods
- [ ] Consider reserved instances if usage is consistent
- [ ] Update cost estimates

### **Week 4: Maintenance**

- [ ] Update application and dependencies
- [ ] Review security groups and access
- [ ] Backup and test recovery procedures
- [ ] Document any cost changes

## 🎯 Cost Optimization Tips

### **Always On**

- ✅ Use smallest instance types that meet requirements
- ✅ Disable unnecessary AWS features
- ✅ Set up billing alerts
- ✅ Monitor usage regularly

### **Development**

- ✅ Stop services when not in use
- ✅ Use AWS Free Tier effectively
- ✅ Consider local development with Docker

### **Production**

- ✅ Use auto-scaling for variable loads
- ✅ Consider reserved instances for consistent usage
- ✅ Implement proper monitoring and alerting
- ✅ Regular cost reviews and optimization

## 📞 Support and Resources

### **AWS Cost Optimization Resources**

- [AWS Cost Optimization Best Practices](https://aws.amazon.com/cost-optimization/)
- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Cost Explorer](https://console.aws.amazon.com/cost-explorer/)
- [AWS Trusted Advisor](https://console.aws.amazon.com/trustedadvisor/)

### **Monitoring Tools**

- AWS Cost Explorer
- AWS Budgets
- CloudWatch Billing Alarms
- AWS Trusted Advisor

This cost optimization strategy ensures your SplitBuddy backend runs efficiently while keeping costs under control. Regular monitoring and adjustments will help maintain optimal performance and cost balance.
