# SplitBuddy Backend

A robust, scalable, and extensible backend for collaborative and personal finance management, built with NestJS, TypeORM, and PostgreSQL.

---

## **Key Features**

### **1. User Management & Authentication**

- Secure registration, login, JWT authentication
- Email verification, password reset, 2FA support
- User profile management and permissions

### **2. Group & Family Management**

- Create and manage groups (shared, personal, family)
- Invite and manage group members
- Permissions: Only group members can add/view group transactions

### **3. Unified Transaction System**

- **Transaction entity** supports:
  - Expenses (personal, family, group)
  - Incomes (salary, gifts, etc.)
  - Loans (given/taken, with/without interest)
  - Chit fund (chitti) investments
  - Gold purchases and asset loans
- CRUD endpoints for all transaction types
- Business rules and validation for each type

### **4. Expense Splitting & Settlement**

- Split expenses among group members
- Track who owes whom, settle splits, and record payments
- Bulk operations: Add/update/delete multiple expenses at once

### **5. Notification System**

- In-app and email notifications for:
  - Expense creation, update, deletion
  - Split assignment and settlement
  - Payment recorded
  - Reminders for unsettled splits
- Queue-based delivery (Bull/Redis) for scalability
- Notification history and audit

### **6. Reporting & Insights**

- Endpoints for:
  - Income/expense summaries and net cash flow
  - Outstanding loans (given/taken)
  - Chit fund status and returns
  - Gold/investment holdings
  - Group/family vs. personal summaries

### **7. User Settings**

- User preferences for theme, language, currency, notifications, defaults, security, and more
- Endpoints to get and update settings (web and mobile ready)

### **8. Advanced Features**

- Permissions: Only owners can update/delete their transactions
- Validation: DTOs and service checks for all business rules
- Modular design: Easy to extend for new features (recurring, tags, etc.)

---

## **API Overview**

- `/api/v1/auth/*` — Authentication and user management
- `/api/v1/expense/*` — Expense CRUD, splitting, settlement, bulk, reminders
- `/api/v1/transaction/*` — Unified transaction CRUD and reporting
- `/api/v1/notification/*` — Notification management and history
- `/api/v1/user-settings/*` — User settings CRUD
- `/api/v1/category`, `/api/v1/payment-method`, `/api/v1/group`, `/api/v1/group-member` — Related entity CRUD

---

## **Tech Stack**

- **NestJS** (Node.js, TypeScript)
- **TypeORM** (PostgreSQL)
- **Bull/Redis** (queue-based notifications)
- **class-validator** (validation)
- **Docker Compose** (for local dev: Postgres, Redis)

---

## **🚀 Quick Start (5 Minutes)**

### **Prerequisites**
```bash
# Install Node.js dependencies
npm install

# Install Doppler CLI (required for environment management)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh

# Login to Doppler
doppler login
```

### **Setup & Deploy**

#### **Option 1: Test Environment (Recommended for first-time setup)**
```bash
# Deploy test environment locally
docker-compose -f docker-compose.test.yml up --build -d

# Test the API
curl http://localhost:5901/api/test/db-test
```

#### **Option 2: Production Environment**
```bash
# Deploy production environment
./simple-deploy.sh deploy

# Test the API
curl http://localhost:5900/api/v1/db-test
```

### **Access Your Application**
- **Test Environment**: http://localhost:5901
- **Production Environment**: http://localhost:5900
- **API Documentation**: http://localhost:5900/api/docs (or :5901 for test)

---

## **🌍 Environment Management**

### **Current Setup: Docker-Based Services**

The project uses **Docker containers** for all services:
- **PostgreSQL**: Docker container (ports 5434/5435)
- **Redis**: Docker container (ports 6379/6381)
- **Backend**: Docker container (ports 5900/5901)

### **Environment Options**

#### **Test Environment** (Recommended for development)
- Port: `5901`
- Database: `splitbuddy_test`
- API Prefix: `/api/test`
- Configuration: Built into `docker-compose.test.yml`

#### **Production Environment**
- Port: `5900`
- Database: `splitbuddy_prod`
- API Prefix: `/api/v1`
- Configuration: Uses Doppler environment variables

### **Doppler Integration (Advanced)**

For production deployments with secure environment management:

```bash
# Set up Doppler project and environments
./scripts/setup-doppler-environments.sh --project splitbuddy-backend

# Configure OAuth settings
./scripts/update-oauth-configs.sh --env prod

# Deploy with Doppler
./scripts/deploy-with-doppler.sh --env prod
```

---

## **🔧 Management Commands**

### **Test Environment**
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up --build -d

# Stop test environment
docker-compose -f docker-compose.test.yml down

# View logs
docker-compose -f docker-compose.test.yml logs -f

# Check status
docker-compose -f docker-compose.test.yml ps
```

### **Production Environment**
```bash
# Deploy production
./simple-deploy.sh deploy

# Stop production
./simple-deploy.sh stop

# Restart production
./simple-deploy.sh restart

# View logs
./simple-deploy.sh logs

# Check status
./simple-deploy.sh status
```

---

## **🔐 Environment Variables**

### **Test Environment** (Built into docker-compose.test.yml)
All environment variables are pre-configured in the test environment:
- Database: `splitbuddy_test`
- Redis: `redis:6379`
- JWT: Test secret
- SMTP: Test configuration
- OAuth: Test client IDs

### **Production Environment** (Managed by Doppler)
Environment variables are managed through Doppler for security:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_prod
DB_PASSWORD=your-secure-password
DB_DATABASE=splitbuddy_prod

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-jwt-secret

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Google OAuth Configuration
GOOGLE_WEB_CLIENT_ID=your-web-client-id
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
GOOGLE_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# App Configuration
APP_PORT=5900
NODE_ENV=production
```

---

## **🔒 Security Features**

- **JWT Authentication** for all protected endpoints
- **Doppler Integration** for secure environment variable management
- **Docker Containerization** for isolated deployment
- **Database Migrations** for schema versioning
- **Input Validation** with class-validator
- **CORS Configuration** for web client security
- **Platform-Specific OAuth** for web, Android, and iOS

---

## **API Documentation**

Once the application is running, visit:

- **Swagger UI**: http://localhost:5900/api/docs
- **Health Check**: http://localhost:5900/api/v1/db-test

---

## **🛠️ Development**

### **Available Scripts**

```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run test           # Run tests
npm run migration:run  # Run database migrations
npm run create-default-data  # Create default data
```

### **Database Management**

```bash
# Run migrations
npm run migration:run

# Create new migration
npm run migration:generate -- -n MigrationName

# Revert last migration
npm run migration:revert

# Create default data
npm run create-default-data
```

### **Testing**

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

---

## **🔧 Troubleshooting**

### **Common Issues**

1. **Port already in use**: 
   ```bash
   # Check what's using the port
   lsof -i :5900
   lsof -i :5901
   
   # Stop existing containers
   docker-compose -f docker-compose.test.yml down
   docker-compose -f docker-compose.prod.yml down
   ```

2. **Database connection failed**: 
   ```bash
   # Check if containers are running
   docker-compose -f docker-compose.test.yml ps
   
   # Restart containers
   docker-compose -f docker-compose.test.yml restart
   ```

3. **Migration errors**: 
   ```bash
   # Reset database (WARNING: This will delete all data)
   docker-compose -f docker-compose.test.yml down -v
   docker-compose -f docker-compose.test.yml up --build -d
   ```

4. **Doppler not working**: 
   ```bash
   # Check Doppler installation
   doppler --version
   
   # Login to Doppler
   doppler login
   ```

### **Logs**

```bash
# Test environment logs
docker-compose -f docker-compose.test.yml logs -f

# Production environment logs
./simple-deploy.sh logs

# Specific service logs
docker-compose -f docker-compose.test.yml logs -f backend
```

---

## **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## **📁 Project Structure**

```
splitbuddy-backend/
├── src/                    # Source code
│   ├── auth/              # Authentication module
│   ├── expense/           # Expense management
│   ├── group/             # Group management
│   ├── notification/      # Notification system
│   ├── user-settings/     # User preferences
│   └── entities/          # Database entities
├── test/                  # Test files
├── scripts/               # Deployment and setup scripts
├── docker-compose.test.yml    # Test environment
├── docker-compose.prod.yml    # Production environment
├── simple-deploy.sh       # Simple deployment script
└── README.md              # This file
```

## **📚 Additional Documentation**

- **Doppler Setup**: `DOPPLER_SETUP.md` - Detailed Doppler configuration
- **Testing Guide**: `TESTING_SETUP.md` - Comprehensive testing documentation
- **API Testing**: `API_TEST_README.md` - API testing guide
- **Database Guide**: `DATABASE_AND_DATA_GUIDE.md` - Database management

---

**SplitBuddy Backend is your all-in-one platform for collaborative and personal finance management, ready for real-world use and future growth.**
