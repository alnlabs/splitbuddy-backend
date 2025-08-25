# 🚀 Deployment & Operations Guide - SplitBuddy Backend

Complete deployment and operations guide for all environments.

---

## 🎯 **Deployment Strategies**

### **1. Doppler-Based Deployment (Recommended)**
Uses Doppler for environment variable management across all environments.

### **2. Simple Deployment**
Quick deployment using the simple deploy script.

### **3. Manual Deployment**
Direct Docker Compose deployment for advanced users.

---

## 🔐 **Doppler-Based Deployment**

### **Prerequisites**
```bash
# Install Doppler CLI
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
doppler login

# Set up environments
./scripts/setup-doppler-environments.sh --project splitbuddy-backend
```

### **Environment-Specific Deployment**

#### **Development Environment**
```bash
# Deploy to development
./scripts/deploy-with-doppler.sh --env dev

# Access points
# API: http://localhost:5900
# Docs: http://localhost:5900/api/docs
```

#### **Testing Environment**
```bash
# Deploy to testing
./scripts/deploy-with-doppler.sh --env test

# Access points
# API: http://localhost:5901
# Docs: http://localhost:5901/api/docs
```

#### **Production Environment**
```bash
# Deploy to production
./scripts/deploy-with-doppler.sh --env prod

# Access points
# API: http://localhost:5900
# Docs: http://localhost:5900/api/docs
```

---

## ⚡ **Simple Deployment**

### **Quick Deploy (Production)**
```bash
# Deploy to production
./simple-deploy.sh deploy

# Check status
./simple-deploy.sh status

# View logs
./simple-deploy.sh logs
```

### **Simple Deployment Commands**
```bash
./simple-deploy.sh deploy     # Deploy application
./simple-deploy.sh status     # Check application status
./simple-deploy.sh logs       # View application logs
./simple-deploy.sh restart    # Restart application
./simple-deploy.sh stop       # Stop application
```

---

## 🐳 **Manual Docker Deployment**

### **Development Environment**
```bash
# Start development server
doppler run --project=splitbuddy-backend --config=dev -- npm run start:dev
```

### **Testing Environment**
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up --build -d

# Run migrations
doppler run --project=splitbuddy-backend --config=test -- npm run migration:run

# Create default data
doppler run --project=splitbuddy-backend --config=test -- npm run create-default-data
```

### **Production Environment**
```bash
# Start production environment
doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml up --build -d

# Run migrations
doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run

# Create default data
doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run create-default-data
```

---

## 🔧 **Operations & Management**

### **Application Management**

#### **Check Status**
```bash
# Check all containers
docker-compose -f docker-compose.prod.yml ps

# Check specific environment
docker-compose -f docker-compose.test.yml ps
```

#### **View Logs**
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis
```

#### **Restart Services**
```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

#### **Stop Services**
```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (DANGER - loses data)
docker-compose -f docker-compose.prod.yml down -v
```

### **Database Management**

#### **Run Migrations**
```bash
# Development
doppler run --project=splitbuddy-backend --config=dev -- npm run migration:run

# Testing
doppler run --project=splitbuddy-backend --config=test -- npm run migration:run

# Production
doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run
```

#### **Create Default Data**
```bash
# Development
doppler run --project=splitbuddy-backend --config=dev -- npm run create-default-data

# Testing
doppler run --project=splitbuddy-backend --config=test -- npm run create-default-data

# Production
doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run create-default-data
```

#### **Database Backup**
```bash
# Backup production database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U splitbuddy_user_prod splitbuddy_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup test database
docker-compose -f docker-compose.test.yml exec postgres pg_dump -U splitbuddy_user_test splitbuddy_test > backup_test_$(date +%Y%m%d_%H%M%S).sql
```

#### **Database Restore**
```bash
# Restore production database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U splitbuddy_user_prod splitbuddy_prod < backup_file.sql

# Restore test database
docker-compose -f docker-compose.test.yml exec -T postgres psql -U splitbuddy_user_test splitbuddy_test < backup_file.sql
```

---

## 🔍 **Monitoring & Health Checks**

### **Health Check Endpoints**
```bash
# Production
curl http://localhost:5900/api/v1/db-test

# Testing
curl http://localhost:5901/api/test/db-test

# Development
curl http://localhost:5900/api/v1/db-test
```

### **Container Health Status**
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check specific container
docker inspect splitbuddy_backend_prod --format='{{.State.Health.Status}}'
```

### **Resource Usage**
```bash
# Check resource usage
docker stats

# Check disk usage
docker system df
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check if ports are in use
lsof -i :5900
lsof -i :5434

# Restart everything
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

#### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U splitbuddy_user_prod
```

#### **Migration Errors**
```bash
# Check migration status
docker-compose -f docker-compose.prod.yml exec backend npm run migration:show

# Reset database (DANGER - loses data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up --build -d
```

#### **Redis Connection Issues**
```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### **Performance Issues**

#### **High Memory Usage**
```bash
# Check memory usage
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### **Slow Database Queries**
```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod splitbuddy_prod

# Check slow queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

---

## 🔄 **Updates & Maintenance**

### **Application Updates**
```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
./scripts/deploy-with-doppler.sh --env prod
```

### **Dependency Updates**
```bash
# Update dependencies
npm update

# Rebuild application
npm run build

# Deploy updated version
./scripts/deploy-with-doppler.sh --env prod
```

### **Database Schema Updates**
```bash
# Generate new migration
npm run migration:generate -- -n MigrationName

# Run migrations
doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run
```

---

## 📊 **Scaling & Performance**

### **Horizontal Scaling**
```bash
# Scale backend service
docker-compose -f docker-compose.prod.yml up --scale backend=3 -d

# Scale with load balancer
# (Requires additional nginx configuration)
```

### **Resource Limits**
```bash
# Set memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### **Monitoring Setup**
```bash
# Add monitoring containers
# (Prometheus, Grafana, etc.)
```

---

## 🔒 **Security**

### **SSL/TLS Setup**
```bash
# Add SSL certificates
# (Requires nginx reverse proxy configuration)
```

### **Firewall Configuration**
```bash
# Allow only necessary ports
sudo ufw allow 5900/tcp  # Application
sudo ufw allow 5434/tcp  # Database (if external access needed)
```

### **Regular Security Updates**
```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull

# Rebuild with updated images
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 📚 **Best Practices**

1. **Always backup before major changes**
2. **Test in development/testing environments first**
3. **Monitor logs and performance regularly**
4. **Keep dependencies updated**
5. **Use environment-specific configurations**
6. **Implement proper logging and monitoring**
7. **Regular security audits and updates**

---

**Your SplitBuddy backend is now ready for production deployment! 🚀**
