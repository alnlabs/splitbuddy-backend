# SplitBuddy Backend Documentation

Welcome to the SplitBuddy Backend documentation! This repository contains a comprehensive expense splitting and financial management API built with NestJS, TypeORM, and PostgreSQL.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Overview](#project-overview)
- [API Documentation](#api-documentation)
- [Setup & Deployment](#setup--deployment)
- [Development](#development)
- [Database Schema](#database-schema)
- [Security](#security)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Local Development

```bash
# Clone the repository
git clone <repository-url>
cd splitbuddy-backend

# Start with Docker (Recommended)
./deploy.sh local-start

# Or manually
npm install
npm run docker:dev
npm run migration:run
npm run create-default-data
npm run start:dev
```

### Test the Application

```bash
# Test database connection
curl http://localhost:5900/api/v1/db-test

# View API documentation
open http://localhost:5900/api/docs
```

## 📊 Project Overview

### 🎯 Features

- **User Management**: Registration, authentication, profile management
- **Expense Tracking**: Create, manage, and split expenses
- **Group Management**: Create groups for shared expenses
- **Payment Methods**: Track different payment methods
- **Categories**: Organize expenses by categories
- **Notifications**: Email and in-app notifications
- **Google OAuth**: Social login integration
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
- `PUT /api/v1/auth/profile` - Update user profile
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/request-password-reset` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/google-signup` - Google OAuth signup
- `POST /api/v1/auth/google-login` - Google OAuth login

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

## 🔐 Security

### 🔒 Authentication

- JWT-based authentication
- Password hashing with bcrypt
- Google OAuth integration
- Password reset functionality
- Email verification

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
