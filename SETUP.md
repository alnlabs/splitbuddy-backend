# 🛠️ Setup Guide - SplitBuddy Backend

Complete setup guide for all environments (development, testing, production).

---

## 📋 **Prerequisites**

### **System Requirements**
```bash
# Required software
- Node.js 20.x or higher
- Docker & Docker Compose
- Git
- PostgreSQL 15+ (for local development)
- Redis 7+ (for local development)
```

### **Install Dependencies**
```bash
# Install Node.js dependencies
npm install

# Install Doppler CLI (required for environment management)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh

# Verify installation
doppler --version
```

---

## 🔐 **Doppler Setup (Required)**

### **1. Create Doppler Account**
- Go to [Doppler Dashboard](https://dashboard.doppler.com/)
- Sign up for a free account

### **2. Login to Doppler CLI**
```bash
doppler login
```

### **3. Create Project in Doppler**
- Create project: `splitbuddy-backend`
- Add environments: `dev`, `test`, `prod`

### **4. Set Up Environment Variables**
```bash
# Configure OAuth settings for each environment
./scripts/update-oauth-configs.sh --env dev
./scripts/update-oauth-configs.sh --env test
./scripts/update-oauth-configs.sh --env prod

# Set up all environments
./scripts/setup-doppler-environments.sh --project splitbuddy-backend
```

---

## 🚀 **Environment-Specific Setup**

### **Development Environment**

#### **Quick Setup**
```bash
# Deploy to development
./scripts/deploy-with-doppler.sh --env dev
```

#### **Manual Setup**
```bash
# Start development environment
doppler run --project=splitbuddy-backend --config=dev -- npm run start:dev
```

#### **Access Points**
- **API**: http://localhost:5900
- **Documentation**: http://localhost:5900/api/docs
- **Health Check**: http://localhost:5900/api/v1/db-test

### **Testing Environment**

#### **Quick Setup**
```bash
# Deploy to testing
./scripts/deploy-with-doppler.sh --env test
```

#### **Manual Setup**
```bash
# Start test environment with Docker
docker-compose -f docker-compose.test.yml up --build -d

# Run migrations
doppler run --project=splitbuddy-backend --config=test -- npm run migration:run

# Create default data
doppler run --project=splitbuddy-backend --config=test -- npm run create-default-data
```

#### **Access Points**
- **API**: http://localhost:5901
- **Documentation**: http://localhost:5901/api/docs
- **Health Check**: http://localhost:5901/api/test/db-test

### **Production Environment**

#### **Quick Setup**
```bash
# Deploy to production
./scripts/deploy-with-doppler.sh --env prod
```

#### **Manual Setup**
```bash
# Deploy with simple script
./simple-deploy.sh deploy

# Or manually
doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml up --build -d
```

#### **Access Points**
- **API**: http://localhost:5900
- **Documentation**: http://localhost:5900/api/docs
- **Health Check**: http://localhost:5900/api/v1/db-test

---

## 🗄️ **Database Setup**

### **Docker-Based (Recommended)**
The project uses Docker-based PostgreSQL and Redis by default:

```bash
# Database services are automatically started with deployment
# PostgreSQL: Available on ports 5434 (prod), 5435 (test)
# Redis: Available on ports 6379 (prod), 6381 (test)
```

### **Local Database (Alternative)**
If you prefer local PostgreSQL:

```bash
# Install PostgreSQL locally
# Create database: splitbuddy_dev
# Create user: splitbuddy_user_dev
# Update environment variables in Doppler
```

---

## 🔧 **Environment Variables**

All environment variables are managed through Doppler. Here's what you need to configure:

### **Database Configuration**
```bash
DB_HOST=postgres          # Docker service name
DB_PORT=5432              # Internal port
DB_USERNAME=splitbuddy_user_dev
DB_PASSWORD=your_password
DB_DATABASE=splitbuddy_dev
```

### **Redis Configuration**
```bash
REDIS_HOST=redis          # Docker service name
REDIS_PORT=6379           # Internal port
```

### **JWT Configuration**
```bash
JWT_SECRET=your-jwt-secret
```

### **SMTP Configuration**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### **Google OAuth Configuration**
```bash
# Platform-specific client IDs
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com

# Callback URLs
GOOGLE_WEB_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback
GOOGLE_ANDROID_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect
GOOGLE_IOS_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Shared secret
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **App Configuration**
```bash
APP_PORT=5900
NODE_ENV=development      # or test, production
CORS_ORIGIN=http://localhost:3001
```

### **Queue Configuration**
```bash
EMAIL_QUEUE_NAME=email-queue-dev
NOTIFICATION_QUEUE_NAME=notification-queue-dev
```

---

## 🛠️ **Available Scripts**

### **Environment Management**
```bash
./scripts/setup-doppler-environments.sh    # Set up all environments
./scripts/update-oauth-configs.sh         # Update OAuth configurations
./scripts/sync-common-configs.sh          # Sync common configurations
```

### **Deployment**
```bash
./scripts/deploy-with-doppler.sh          # Deploy with environment selection
./simple-deploy.sh                        # Simple deployment (production)
```

### **Development**
```bash
npm run start:dev                         # Start development server
npm run build                             # Build for production
npm run test                              # Run tests
npm run migration:run                     # Run database migrations
npm run create-default-data               # Create default data
```

---

## 🔍 **Verification & Testing**

### **Health Checks**
```bash
# Test database connection
curl http://localhost:5900/api/v1/db-test

# Test API documentation
curl http://localhost:5900/api/docs
```

### **Common Tests**
```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:e2e
npm run test:unit
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Doppler Not Found**
```bash
# Install Doppler CLI
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
doppler login
```

#### **Port Conflicts**
```bash
# Check what's using the port
lsof -i :5900

# Stop conflicting services
docker-compose down
```

#### **Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database services
docker-compose restart postgres redis
```

#### **Migration Errors**
```bash
# Reset database (DANGER - loses data)
docker-compose down -v
./scripts/deploy-with-doppler.sh --env dev
```

### **Logs**
```bash
# View application logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres

# View Redis logs
docker-compose logs -f redis
```

---

## 📚 **Next Steps**

1. **Configure OAuth** - Set up Google OAuth client IDs
2. **Customize Settings** - Update environment variables for your needs
3. **Connect Frontend** - Point your frontend to the API
4. **Set Up Monitoring** - Configure logging and monitoring
5. **Deploy to Production** - Follow production deployment guide

---

**Your SplitBuddy backend is now ready for development! 🎉**
