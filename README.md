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

## **Quick Start**

### **Local Development**

```bash
# Clone the repository
git clone <repository-url>
cd splitbuddy-backend

# Install dependencies
npm install

# Start local development environment
./deploy.sh local-start

# The application will be available at:
# - API: http://localhost:5900
# - Documentation: http://localhost:5900/api/docs
# - Health Check: http://localhost:5900/api/v1/db-test
```

### **Production Deployment**

```bash
# Deploy to production (uses local Docker)
./deploy.sh production

# Deploy with GitHub secrets (recommended for production)
./deploy.sh production -g

# Fast deployment (skip dependency installation)
./deploy.sh production -s

# Combined: Fast deployment with GitHub secrets
./deploy.sh production -s -g
```

---

## **Deployment Options**

### **1. Local Docker Deployment (Default)**

Uses Docker Compose with local PostgreSQL and Redis containers:

```bash
./deploy.sh production
```

### **2. GitHub Secrets Integration (Recommended)**

Store environment variables securely in GitHub repository secrets:

```bash
# Setup GitHub secrets
./scripts/setup-github-secrets.sh

# Deploy with GitHub secrets
export GITHUB_TOKEN="your-personal-access-token"
export GITHUB_REPO="your-username/splitbuddy-backend"
./deploy.sh production -g
```

### **3. Manual Environment Setup**

Create your own `.env.production` file:

```bash
# Copy and edit environment template
cp env.production.example .env.production

# Deploy with custom environment
./deploy.sh production
```

---

## **Deployment Script Commands**

```bash
# Local Development
./deploy.sh local-start    # Start local development
./deploy.sh local-stop     # Stop local development
./deploy.sh local          # Alias for local-start

# Production Deployment
./deploy.sh production     # Deploy to production
./deploy.sh deploy         # Alias for production
./deploy.sh prod           # Alias for production

# Options
./deploy.sh production -s  # Skip dependency installation
./deploy.sh production -g  # Use GitHub secrets
./deploy.sh production -s -g  # Both options

# Management
./deploy.sh restart        # Restart production
./deploy.sh status         # Check application status
./deploy.sh help           # Show help
```

---

## **Environment Variables**

### **Required for Production**

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_prod
DB_PASSWORD=your-secure-password
DB_DATABASE=splitbuddy_prod

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret

# SMTP (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App
APP_PORT=5900
NODE_ENV=production
```

---

## **Security Features**

- **JWT Authentication** for all protected endpoints
- **GitHub Secrets Integration** for secure environment variable management
- **Docker Containerization** for isolated deployment
- **Database Migrations** for schema versioning
- **Input Validation** with class-validator
- **CORS Configuration** for web client security

---

## **API Documentation**

Once the application is running, visit:

- **Swagger UI**: http://localhost:5900/api/docs
- **Health Check**: http://localhost:5900/api/v1/db-test

---

## **Development**

### **Available Scripts**

```bash
npm run start:dev      # Start development server
npm run build          # Build for production
npm run test           # Run tests
npm run migration:run  # Run database migrations
npm run docker:dev     # Start Docker development environment
npm run docker:down    # Stop Docker development environment
```

### **Database Migrations**

```bash
# Run migrations
npm run migration:run

# Create new migration
npm run migration:generate -- -n MigrationName

# Revert last migration
npm run migration:revert
```

---

## **Troubleshooting**

### **Common Issues**

1. **Port already in use**: Stop existing containers with `./deploy.sh local-stop`
2. **Database connection failed**: Check if PostgreSQL container is running
3. **GitHub secrets not working**: Ensure `GITHUB_TOKEN` and `GITHUB_REPO` are set
4. **Migration errors**: Run `docker-compose down -v` to reset database

### **Logs**

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f app
```

---

## **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**SplitBuddy Backend is your all-in-one platform for collaborative and personal finance management, ready for real-world use and future growth.**
