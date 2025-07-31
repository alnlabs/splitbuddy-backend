# SplitBuddy Backend Setup Process

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Prerequisites

### Required Software

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **OS**: macOS, Linux, or Windows

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd splitbuddy-backend

# Install dependencies
npm install
```

### 2. Start with Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, Backend)
npm run docker:dev

# Check if services are running
docker ps
```

### 3. Run Database Migrations

```bash
# Run all migrations
npm run migration:run
```

### 4. Create Default Data

```bash
# Create default categories and payment methods
npm run create-default-data
```

### 5. Test the Application

```bash
# Test database connection
curl http://localhost:5900/api/v1/db-test

# Check API documentation
open http://localhost:5900/api/docs
```

## 🔧 Detailed Setup

### Local Development Setup

#### Option 1: Docker Compose (Recommended)

**Start Services:**

```bash
# Start PostgreSQL and Redis
npm run docker:dev

# Check logs
docker logs splitbuddy_backend
```

**Stop Services:**

```bash
# Stop all services
npm run docker:down
```

#### Option 2: Manual Setup

**1. Install PostgreSQL:**

```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**2. Create Database:**

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE splitbuddy_db_local;
CREATE USER splitbuddy_user_local WITH PASSWORD 'ngSystems@2019';
GRANT ALL PRIVILEGES ON DATABASE splitbuddy_db_local TO splitbuddy_user_local;
\q
```

**3. Install Redis:**

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Environment Configuration

#### Local Environment Variables

Create `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=splitbuddy_user_local
DB_PASSWORD=ngSystems@2019
DB_NAME=splitbuddy_db_local

# JWT Configuration
JWT_SECRET=iv570SrW+9fhKVvRrgW2cjiPXg7e+vR9dJ5xbJ1W4Ww=

# Email Configuration (Gmail)
SMTP_USER=alnlabs1@gmail.com
SMTP_PASS=mszo jwpz srgu uhwh
SMTP_FROM=alnlabs1@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Google OAuth
GOOGLE_CLIENT_ID=1039447696099-ftbfa65lep53cm928a862bl6m2e9gaq9.apps.googleusercontent.com

# Application Configuration
APP_PORT=5900
NODE_ENV=local

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Production Environment Variables

For production, use different values:

```env
# Database Configuration
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-production-user
DB_PASSWORD=your-secure-password
DB_NAME=splitbuddy_db_prod

# JWT Configuration (Generate a secure secret)
JWT_SECRET=your-secure-jwt-secret

# Email Configuration
SMTP_USER=your-production-email
SMTP_PASS=your-production-email-password
SMTP_FROM=your-production-email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Google OAuth
GOOGLE_CLIENT_ID=your-production-google-client-id

# Application Configuration
APP_PORT=3000
NODE_ENV=production

# Redis Configuration
REDIS_HOST=your-production-redis-host
REDIS_PORT=6379
```

## 🗄️ Database Setup

### Running Migrations

**Check current migration status:**

```bash
npm run typeorm -- migration:show
```

**Run all migrations:**

```bash
npm run migration:run
```

**Generate new migration:**

```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

**Revert last migration:**

```bash
npm run migration:revert
```

### Current Migration Files

The project has the following migrations:

1. `1753260075994-InitialMigration.ts` - Initial database schema
2. `1753273597583-AddTransactionTable.ts` - Transaction table
3. `1753274000000-AddNotificationsTable.ts` - Notifications table
4. `1753275000000-CreateDefaultDataForExistingUsers.ts` - Default data
5. `1753276000000-AddIsSharedToUserGroups.ts` - Group sharing
6. `1753277000000-UpdateIsSharedDefault.ts` - Default sharing settings
7. `1753278000000-AddDescriptionToUserGroups.ts` - Group descriptions

### Database Schema

**Key Tables:**

- `users` - User accounts and profiles
- `expenses` - Expense records
- `expense_splits` - Expense splitting logic
- `groups` - Expense groups
- `user_groups` - Group memberships
- `categories` - Expense categories
- `payment_methods` - Payment methods
- `transactions` - Financial transactions
- `notifications` - User notifications

## 🚀 Running the Application

### Development Mode

```bash
# Start in development mode with hot reload
npm run start:dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Docker Mode

```bash
# Start with Docker Compose
npm run docker:dev

# View logs
docker logs -f splitbuddy_backend
```

## 🧪 Testing

### API Testing

```bash
# Test database connection
curl http://localhost:5900/api/v1/db-test

# Test health check
curl http://localhost:5900/api/v1/

# Test Swagger documentation
open http://localhost:5900/api/docs
```

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### E2E Tests

```bash
# Run end-to-end tests
npm run test:e2e
```

## 🔧 Available Scripts

### Development Scripts

```bash
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run build          # Build the application
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
```

### Database Scripts

```bash
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run migration:generate # Generate new migration
```

### Docker Scripts

```bash
npm run docker:dev    # Start with Docker Compose
npm run docker:down   # Stop Docker services
```

### Data Scripts

```bash
npm run create-default-data           # Create default categories/payment methods
npm run create-default-data-for-user # Create default data for specific user
```

### API Documentation

```bash
npm run export:postman # Export API to Postman collection
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Failed**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check database credentials
psql -h localhost -U splitbuddy_user_local -d splitbuddy_db_local
```

**2. Port Already in Use**

```bash
# Check what's using port 5900
lsof -i :5900

# Kill the process
kill -9 <PID>
```

**3. Docker Issues**

```bash
# Check Docker status
docker ps

# Restart Docker services
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up --build -d
```

**4. Migration Errors**

```bash
# Check migration status
npm run typeorm -- migration:show

# Reset database (WARNING: This will delete all data)
dropdb splitbuddy_db_local
createdb splitbuddy_db_local
npm run migration:run
```

**5. Redis Connection Issues**

```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

### Logs and Debugging

**View Application Logs:**

```bash
# Development mode
npm run start:dev

# Docker mode
docker logs -f splitbuddy_backend
```

**Enable Debug Logging:**

```bash
# Set debug environment
NODE_ENV=development npm run start:dev
```

## 📊 What Gets Created

### Database Tables

- **users** - User accounts and profiles
- **expenses** - Expense records
- **expense_splits** - Expense splitting
- **groups** - Expense groups
- **user_groups** - Group memberships
- **categories** - Expense categories
- **payment_methods** - Payment methods
- **transactions** - Financial transactions
- **notifications** - User notifications
- **user_settings** - User preferences
- **plans** - User plans
- **chit_funds** - Chit fund records

### Default Data

- **Categories**: Food, Transportation, Entertainment, Shopping, etc.
- **Payment Methods**: Cash, Credit Card, Debit Card, UPI, etc.
- **User Settings**: Default preferences for new users

### API Endpoints

- **Authentication**: Register, Login, Profile, Password Reset
- **Expenses**: CRUD operations, splitting, balances
- **Groups**: Group management and memberships
- **Categories**: Category management
- **Payment Methods**: Payment method management
- **Notifications**: Email and in-app notifications
- **User Settings**: User preferences
- **Transactions**: Financial transaction management

## 🔐 Security Notes

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secret**: Use a strong, unique secret in production
3. **Database Passwords**: Use strong passwords for production databases
4. **Email Credentials**: Use app-specific passwords for Gmail
5. **Google OAuth**: Configure proper redirect URIs for production

## 📝 Next Steps

After successful setup:

1. Test all API endpoints using Swagger documentation
2. Create a test user account
3. Test expense creation and splitting
4. Verify email notifications work
5. Test Google OAuth integration
6. Set up monitoring and logging for production
