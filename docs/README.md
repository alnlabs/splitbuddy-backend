# SplitBuddy Backend Documentation

Welcome to the SplitBuddy Backend documentation! This repository contains a comprehensive expense splitting and financial management API built with NestJS, TypeORM, and PostgreSQL.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [API Documentation](#api-documentation)
- [Authentication Setup](#authentication-setup)
- [Development Commands](#development-commands)
- [Setup & Deployment](#setup--deployment)
- [Development](#development)
- [Database Schema](#database-schema)
- [Security](#security)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### 🐳 Docker-Based Development (Recommended)

#### **Full Stack Start**

```bash
# Clone the repository
git clone <repository-url>
cd splitbuddy-backend

# Start complete environment (Backend + Database + Redis)
./deploy.sh local-start
# or
./docker-manager.sh local up
```

#### **Partial Stack Start**

```bash
# Start only database and Redis (for local development)
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Start only backend (if DB/Redis already running)
docker-compose -f docker-compose.dev.yml up backend -d

# Start only specific services
docker-compose -f docker-compose.dev.yml up postgres -d    # Database only
docker-compose -f docker-compose.dev.yml up redis -d       # Redis only
```

#### **Stop Services**

```bash
# Stop all services
./deploy.sh local-stop
# or
./docker-manager.sh local down

# Stop specific services
docker-compose -f docker-compose.dev.yml stop backend
docker-compose -f docker-compose.dev.yml stop postgres redis
```

#### **Clean Environment**

```bash
# Clean everything (stop + remove volumes)
./docker-manager.sh local clean

# Remove specific containers
docker-compose -f docker-compose.dev.yml down -v postgres
docker-compose -f docker-compose.dev.yml down -v redis

# Clean Docker system
docker system prune -f
docker volume prune -f
```

### 🔧 Local Development (Without Docker)

#### **Full Setup**

```bash
# Install dependencies
npm install

# Start database and Redis (requires local PostgreSQL/Redis)
npm run migration:run
npm run create-default-data
npm run start:dev
```

#### **Partial Setup**

```bash
# Install only
npm install

# Run only migrations
npm run migration:run

# Create only default data
npm run create-default-data

# Start only backend (requires external DB/Redis)
npm run start:dev
```

### 🧪 Testing

#### **Test Application**

```bash
# Test database connection
curl http://localhost:5900/api/v1/db-test

# Test environment configuration
curl http://localhost:5900/api/v1/env-test

# View API documentation
open http://localhost:5900/api/docs
```

#### **Run Tests**

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## 📊 Project Overview

### 🎯 Features

- **User Management**: Registration, authentication, profile management
- **Expense Tracking**: Create, manage, and split expenses
- **Group Management**: Create groups for shared expenses
- **Payment Methods**: Track different payment methods
- **Categories**: Organize expenses by categories
- **Notifications**: Email and in-app notifications
- **Google OAuth & Firebase**: Social login integration with Firebase Authentication support
- **Transaction Management**: Track various financial transactions
- **User Settings**: Personalized preferences

### 🏗️ Architecture

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Queue System**: Bull with Redis
- **Email**: Nodemailer with Gmail SMTP
- **Containerization**: Docker & Docker Compose

### 🔧 Technology Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL, TypeORM
- **Cache/Queue**: Redis, Bull
- **Authentication**: JWT, Passport
- **Documentation**: Swagger/OpenAPI
- **Email**: Nodemailer
- **Testing**: Jest
- **Deployment**: Docker, PM2, Nginx

## 📚 API Documentation

### 🔐 Authentication Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PATCH /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/request-email-verification` - Request email verification
- `GET /api/v1/auth/verify-email` - Verify email with token
- `POST /api/v1/auth/google/signup` - Google OAuth/Firebase signup
- `POST /api/v1/auth/google/login` - Google OAuth/Firebase login
- `POST /api/v1/auth/google/verify` - Verify Google/Firebase token
- `POST /api/v1/auth/logout` - User logout

### 💰 Expense Endpoints

- `GET /api/v1/expense` - List expenses
- `POST /api/v1/expense` - Create expense
- `GET /api/v1/expense/:id` - Get expense details
- `PUT /api/v1/expense/:id` - Update expense
- `DELETE /api/v1/expense/:id` - Delete expense
- `POST /api/v1/expense/:id/split` - Split expense
- `GET /api/v1/expense/splits` - Get expense splits
- `GET /api/v1/expense/balances` - Get user balances
- `GET /api/v1/expense/group-balances` - Get group balances

### 👥 Group Endpoints

- `GET /api/v1/group` - List groups
- `POST /api/v1/group` - Create group
- `GET /api/v1/group/:id` - Get group details
- `PUT /api/v1/group/:id` - Update group
- `DELETE /api/v1/group/:id` - Delete group

### 📂 Category Endpoints

- `GET /api/v1/category` - List categories
- `POST /api/v1/category` - Create category
- `GET /api/v1/category/:id` - Get category details
- `PUT /api/v1/category/:id` - Update category
- `DELETE /api/v1/category/:id` - Delete category

### 💳 Payment Method Endpoints

- `GET /api/v1/payment-method` - List payment methods
- `POST /api/v1/payment-method` - Create payment method
- `GET /api/v1/payment-method/:id` - Get payment method details
- `PUT /api/v1/payment-method/:id` - Update payment method
- `DELETE /api/v1/payment-method/:id` - Delete payment method
- `POST /api/v1/payment-method/:id/record-payment` - Record payment

### 🔔 Notification Endpoints

- `GET /api/v1/notification` - List notifications
- `POST /api/v1/notification/mark-read` - Mark notification as read
- `POST /api/v1/notification/send-email` - Send email notification
- `POST /api/v1/notification/send-inapp` - Send in-app notification

### ⚙️ User Settings Endpoints

- `GET /api/v1/user-settings` - Get user settings
- `PUT /api/v1/user-settings` - Update user settings

### 💸 Transaction Endpoints

- `GET /api/v1/transaction` - List transactions
- `POST /api/v1/transaction` - Create transaction
- `GET /api/v1/transaction/:id` - Get transaction details
- `PUT /api/v1/transaction/:id` - Update transaction
- `DELETE /api/v1/transaction/:id` - Delete transaction

### 📋 Plan Endpoints

- `GET /api/v1/plans` - List plans
- `POST /api/v1/plans` - Create plan
- `GET /api/v1/plans/:id` - Get plan details
- `PUT /api/v1/plans/:id` - Update plan
- `DELETE /api/v1/plans/:id` - Delete plan

### 🏦 Chit Fund Endpoints

- `GET /api/v1/chit-fund` - List chit funds
- `POST /api/v1/chit-fund` - Create chit fund
- `GET /api/v1/chit-fund/:id` - Get chit fund details
- `PUT /api/v1/chit-fund/:id` - Update chit fund
- `DELETE /api/v1/chit-fund/:id` - Delete chit fund

### 👥 Group Member Endpoints

- `GET /api/v1/group-member` - List group members
- `POST /api/v1/group-member` - Add group member
- `GET /api/v1/group-member/:id` - Get group member details
- `PUT /api/v1/group-member/:id` - Update group member
- `DELETE /api/v1/group-member/:id` - Remove group member

## 🔐 Authentication Setup

For detailed authentication setup instructions, see [Authentication Setup Guide](AUTHENTICATION_SETUP.md).

### Quick Authentication Setup

1. **Email/Password**: Configure SMTP settings for email verification
2. **Google OAuth**: Set up Google Cloud Console credentials
3. **Firebase**: Configure Firebase project and use same Google OAuth credentials

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-secure-jwt-secret

# Google OAuth & Firebase
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id  # Optional

# SMTP (for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## 🛠️ Development Commands

### 🐳 Docker Commands

#### **Environment Management**

```bash
# Start environments
./docker-manager.sh local up          # Development environment
./docker-manager.sh test up           # Test environment
./docker-manager.sh prod up           # Production environment
./docker-manager.sh both up           # Both test and production

# Stop environments
./docker-manager.sh local down        # Stop development
./docker-manager.sh test down         # Stop test
./docker-manager.sh prod down         # Stop production
./docker-manager.sh both down         # Stop both

# Restart environments
./docker-manager.sh local restart     # Restart development
./docker-manager.sh test restart      # Restart test
./docker-manager.sh prod restart      # Restart production

# Clean environments
./docker-manager.sh local clean       # Clean development (stop + remove volumes)
./docker-manager.sh test clean        # Clean test environment
./docker-manager.sh prod clean        # Clean production environment
```

#### **Direct Docker Compose Commands**

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d              # Start all
docker-compose -f docker-compose.dev.yml up backend -d      # Start only backend
docker-compose -f docker-compose.dev.yml up postgres redis -d # Start DB + Redis
docker-compose -f docker-compose.dev.yml down               # Stop all
docker-compose -f docker-compose.dev.yml down -v            # Stop + remove volumes
docker-compose -f docker-compose.dev.yml logs backend       # View backend logs
docker-compose -f docker-compose.dev.yml logs -f backend    # Follow backend logs

# Test environment
docker-compose -f docker-compose.test.yml up -d
docker-compose -f docker-compose.test.yml down

# Production environment
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
```

### 📦 NPM Scripts

#### **Development**

```bash
npm run start:dev              # Start in development mode with watch
npm run start:debug            # Start in debug mode
npm run start:prod             # Start in production mode
npm run build                  # Build the application
npm run lint                   # Run ESLint
npm run format                 # Format code with Prettier
```

#### **Database Management**

```bash
npm run migration:generate     # Generate new migration
npm run migration:run          # Run pending migrations
npm run migration:revert       # Revert last migration
npm run create-default-data    # Create default categories and payment methods
npm run create-default-data-for-user # Create data for specific user
```

#### **Testing**

```bash
npm test                       # Run all tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Run tests with coverage
npm run test:e2e               # Run end-to-end tests
npm run test:unit              # Run unit tests only
npm run test:unit:watch        # Run unit tests in watch mode
npm run test:unit:cov          # Run unit tests with coverage
npm run test:setup             # Setup test database
```

#### **Docker Integration**

```bash
npm run docker:dev             # Start development with Docker
npm run docker:down            # Stop Docker containers
npm run docker:doppler:dev     # Start with Doppler (dev environment)
npm run docker:doppler:prod    # Start with Doppler (prod environment)
```

#### **Doppler Integration**

```bash
npm run start:doppler          # Start with Doppler
npm run start:doppler:dev      # Start with Doppler (dev environment)
npm run start:doppler:test     # Start with Doppler (test environment)
npm run start:doppler:prod     # Start with Doppler (prod environment)
```

#### **Utilities**

```bash
npm run export:postman         # Export API to Postman collection
npm run typeorm                # Run TypeORM CLI
```

### 🔧 Manual Commands

#### **Database Operations**

```bash
# Connect to database
psql -h localhost -U splitbuddy_user_dev -d splitbuddy_dev

# Run SQL scripts
psql -h localhost -U splitbuddy_user_dev -d splitbuddy_dev -f setup_db.sql
psql -h localhost -U splitbuddy_user_dev -d splitbuddy_dev -f fix-user-settings.sql

# Debug database
./debug-db.sh
```

#### **Environment Management**

```bash
# Update environment variables
./scripts/update-env.sh

# Sync environment configurations
./scripts/sync-common-configs.sh

# Setup Doppler environments
./scripts/setup-doppler-environments.sh

# Setup GitHub secrets
./scripts/setup-github-secrets.sh
```

#### **Deployment Scripts**

```bash
# Main deployment script
./deploy.sh local-start        # Start local development
./deploy.sh local-stop         # Stop local development
./deploy.sh build              # Build production
./deploy.sh deploy             # Deploy to production
./deploy.sh restart            # Restart production

# Simple deployment
./simple-deploy.sh

# Test deployment
./test-deploy.sh

# Database manager
./db-manager.sh

# Docker manager
./docker-manager.sh local up
```

### 🧹 Cleaning Commands

#### **Docker Cleanup**

```bash
# Remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.prod.yml down -v

# Remove images
docker rmi splitbuddy-backend_backend
docker rmi postgres:15
docker rmi redis:7-alpine

# Clean Docker system
docker system prune -f          # Remove unused containers, networks, images
docker volume prune -f          # Remove unused volumes
docker image prune -f           # Remove unused images
docker container prune -f       # Remove stopped containers
```

#### **Node.js Cleanup**

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Remove build artifacts
rm -rf dist/
rm -rf coverage/
```

#### **Database Cleanup**

```bash
# Drop and recreate database
dropdb -h localhost -U postgres splitbuddy_dev
createdb -h localhost -U postgres splitbuddy_dev

# Reset migrations
npm run migration:revert        # Revert last migration
# Repeat until all migrations are reverted
npm run migration:run          # Run migrations again
```

## 🛠️ Setup & Deployment

### 📖 Setup Process

For detailed setup instructions, see: [SETUP_PROCESS.md](SETUP_PROCESS.md)

### 🚀 Quick Commands

```bash
# Local development
./deploy.sh local-start
./deploy.sh local-stop
./deploy.sh local-restart

# Production deployment
./deploy.sh production

# Database operations
./deploy.sh migrate
./deploy.sh default-data

# Testing
./deploy.sh test
```

### 🐳 Docker Commands

```bash
# Start services
npm run docker:dev

# Stop services
npm run docker:down

# View logs
docker logs -f splitbuddy_backend
```

### 📝 Environment Variables

Create `.env` file for local development:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=splitbuddy_user_local
DB_PASSWORD=ngSystems@2019
DB_NAME=splitbuddy_db_local

# JWT
JWT_SECRET=your-secret-key

# Email (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Application
APP_PORT=5900
NODE_ENV=local

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 💻 Development

### 📁 Project Structure

```
src/
├── auth/              # Authentication module
├── category/          # Category management
├── expense/           # Expense management
├── group/             # Group management
├── notification/      # Notification system
├── payment-method/    # Payment method management
├── transaction/       # Transaction management
├── user-settings/     # User preferences
├── plans/             # Plan management
├── chit-fund/         # Chit fund management
├── group-member/      # Group member management
├── entities/          # Database entities
├── migrations/        # Database migrations
├── services/          # Shared services
└── scripts/           # Utility scripts
```

### 🔧 Available Scripts

```bash
# Development
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run build          # Build the application
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Database
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run migration:generate # Generate new migration

# Docker
npm run docker:dev    # Start with Docker Compose
npm run docker:down   # Stop Docker services

# Data
npm run create-default-data           # Create default data
npm run create-default-data-for-user # Create data for specific user

# Testing
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:e2e      # Run end-to-end tests

# Documentation
npm run export:postman # Export API to Postman
```

### 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e

# Test API endpoints
curl http://localhost:5900/api/v1/db-test
curl http://localhost:5900/api/v1/
```

## 🗄️ Database Schema

### 📊 Key Tables

- **users** - User accounts and profiles
- **expenses** - Expense records
- **expense_splits** - Expense splitting logic
- **groups** - Expense groups
- **user_groups** - Group memberships
- **categories** - Expense categories
- **payment_methods** - Payment methods
- **transactions** - Financial transactions
- **notifications** - User notifications
- **user_settings** - User preferences
- **plans** - User plans
- **chit_funds** - Chit fund records

### 🔄 Migrations

The project uses TypeORM migrations for database schema management:

- `1753260075994-InitialMigration.ts` - Initial schema
- `1753273597583-AddTransactionTable.ts` - Transaction table
- `1753274000000-AddNotificationsTable.ts` - Notifications table
- `1753275000000-CreateDefaultDataForExistingUsers.ts` - Default data
- `1753276000000-AddIsSharedToUserGroups.ts` - Group sharing
- `1753277000000-UpdateIsSharedDefault.ts` - Default sharing settings
- `1753278000000-AddDescriptionToUserGroups.ts` - Group descriptions

## 🔐 Authentication

### 🔑 Authentication Methods

The SplitBuddy backend supports multiple authentication methods:

#### **1. Traditional Email/Password Authentication**

- User registration with email verification
- Secure password hashing with bcrypt
- JWT token-based sessions
- Password reset functionality

#### **2. Google OAuth & Firebase Authentication**

- **Google OAuth**: Direct Google Sign-In integration
- **Firebase Authentication**: Support for Firebase ID tokens
- **Dual Token Support**: Backend automatically detects and validates both Google OAuth tokens and Firebase tokens
- **Seamless Integration**: Works with both traditional Google OAuth and Firebase Authentication flows

### 🔄 Authentication Flow

#### **Google OAuth/Firebase Login:**

1. Frontend authenticates with Google/Firebase
2. Frontend sends ID token to `POST /api/v1/auth/google/login`
3. Backend validates token (tries Google OAuth first, then Firebase)
4. Backend creates/updates user profile
5. Backend returns JWT token for subsequent API calls

#### **Email/Password Login:**

1. Frontend sends credentials to `POST /api/v1/auth/login`
2. Backend validates credentials and returns JWT token
3. Frontend uses JWT token for authenticated requests

### 🔒 Security Features

- JWT-based authentication with configurable expiration
- Password hashing with bcrypt
- Email verification for new accounts
- Password reset functionality
- CORS configuration for secure cross-origin requests
- Input validation with class-validator
- SQL injection prevention with TypeORM

## 🔐 Security

### 🛡️ Security Features

- Input validation with class-validator
- SQL injection prevention with TypeORM
- CORS configuration
- Rate limiting (can be added)
- Environment variable protection

### 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, unique secrets
3. **Database Passwords**: Use strong passwords
4. **Email Credentials**: Use app-specific passwords
5. **HTTPS**: Always use HTTPS in production
6. **Input Validation**: Validate all inputs
7. **Error Handling**: Don't expose sensitive information

## 📞 Support

### 🐛 Troubleshooting

For common issues and solutions, see the setup process documentation.

### 📧 Contact

For support or questions, please refer to the project maintainers.

---

**Note**: This documentation is maintained alongside the codebase. For the most up-to-date information, always refer to the latest version in the repository.
