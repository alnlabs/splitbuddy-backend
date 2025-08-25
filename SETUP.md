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

All environment variables are managed through Doppler. Here's the complete list of environment variables used in the project:

### **📊 Database Configuration**
```bash
DB_HOST=postgres                    # Database host (Docker service name)
DB_PORT=5432                        # Database port (internal)
DB_USERNAME=splitbuddy_user_dev     # Database username
DB_PASSWORD=your_secure_password    # Database password
DB_DATABASE=splitbuddy_dev          # Database name
DB_NAME=splitbuddy_dev              # Alternative database name (legacy)
```

### **⚡ Redis Configuration**
```bash
REDIS_HOST=redis                    # Redis host (Docker service name)
REDIS_PORT=6379                     # Redis port (internal)
```

### **🔐 JWT Configuration**
```bash
JWT_SECRET=your-jwt-secret          # JWT signing secret (generate secure random string)
```

### **📧 SMTP Configuration (Email Notifications)**
```bash
SMTP_HOST=smtp.gmail.com            # SMTP server host
SMTP_PORT=587                       # SMTP server port
SMTP_USER=your-email@gmail.com      # SMTP username/email
SMTP_PASS=your-app-password         # SMTP password/app password
SMTP_FROM=your-email@gmail.com      # From email address
```

### **🔑 Google OAuth Configuration**

#### **Platform-Specific Client IDs**
```bash
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

#### **Platform-Specific Callback URLs**
```bash
GOOGLE_WEB_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback
GOOGLE_ANDROID_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect
GOOGLE_IOS_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect
```

#### **Shared OAuth Configuration**
```bash
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### **Backward Compatibility (Legacy)**
```bash
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com    # Same as GOOGLE_WEB_CLIENT_ID
GOOGLE_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback  # Same as GOOGLE_WEB_CALLBACK_URL
```

### **🌐 App Configuration**
```bash
APP_PORT=5900                       # Application port
PORT=5900                           # Alternative port variable
NODE_ENV=development                # Environment: development, test, production
CORS_ORIGIN=http://localhost:3001   # CORS allowed origin
```

### **📨 Queue Configuration (Bull/Redis)**
```bash
EMAIL_QUEUE_NAME=email-queue-dev           # Email processing queue name
NOTIFICATION_QUEUE_NAME=notification-queue-dev  # Notification processing queue name
```

### **🗄️ PostgreSQL Container Variables (Docker)**
```bash
POSTGRES_DB=splitbuddy_dev          # PostgreSQL database name
POSTGRES_USER=splitbuddy_user_dev   # PostgreSQL username
POSTGRES_PASSWORD=your_password     # PostgreSQL password
```

### **🔧 Environment-Specific Values**

#### **Development Environment**
```bash
NODE_ENV=development
APP_PORT=5900
DB_DATABASE=splitbuddy_dev
DB_USERNAME=splitbuddy_user_dev
EMAIL_QUEUE_NAME=email-queue-dev
NOTIFICATION_QUEUE_NAME=notification-queue-dev
GOOGLE_WEB_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback
```

#### **Testing Environment**
```bash
NODE_ENV=test
APP_PORT=5901
DB_DATABASE=splitbuddy_test
DB_USERNAME=splitbuddy_user_test
EMAIL_QUEUE_NAME=email-queue-test
NOTIFICATION_QUEUE_NAME=notification-queue-test
GOOGLE_WEB_CALLBACK_URL=http://localhost:5901/api/v1/auth/google/callback
```

#### **Production Environment**
```bash
NODE_ENV=production
APP_PORT=5900
DB_DATABASE=splitbuddy_prod
DB_USERNAME=splitbuddy_user_prod
EMAIL_QUEUE_NAME=email-queue-prod
NOTIFICATION_QUEUE_NAME=notification-queue-prod
GOOGLE_WEB_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback
```

### **🔒 Security Notes**
- **JWT_SECRET**: Generate a secure random string (32+ characters)
- **DB_PASSWORD**: Use strong, unique passwords for each environment
- **SMTP_PASS**: Use app-specific passwords, not your main email password
- **GOOGLE_CLIENT_SECRET**: Keep this secret and secure
- **All sensitive data**: Stored securely in Doppler, not in version control

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
