# SplitBuddy Backend

A robust, scalable, and extensible backend for collaborative and personal finance management, built with NestJS, TypeORM, and PostgreSQL.

---

## 🚀 **Quick Start (5 minutes)**

### **Prerequisites**
```bash
# Install dependencies
npm install

# Install Doppler CLI (required for environment management)
curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
doppler login
```

### **Setup & Deploy**
```bash
# 1. Set up Doppler environments
./scripts/setup-doppler-environments.sh --project splitbuddy-backend

# 2. Configure OAuth settings
./scripts/update-oauth-configs.sh --env dev

# 3. Deploy to development
./scripts/deploy-with-doppler.sh --env dev
```

### **Access Your Application**
- **API**: http://localhost:5900
- **Documentation**: http://localhost:5900/api/docs
- **Health Check**: http://localhost:5900/api/v1/db-test

---

## 🎯 **Key Features**

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

## 🌍 **Environment Management**

This project uses **Doppler** for secure environment variable management across all environments:

- **Development** (`dev`) - Local development and testing
- **Testing** (`test`) - Automated testing and staging
- **Production** (`prod`) - Live production deployment

### **Environment Commands**
```bash
# Deploy to different environments
./scripts/deploy-with-doppler.sh --env dev    # Development
./scripts/deploy-with-doppler.sh --env test   # Testing  
./scripts/deploy-with-doppler.sh --env prod   # Production

# Simple deployment (uses production)
./simple-deploy.sh deploy
```

---

## 🔧 **Tech Stack**

- **NestJS** (Node.js, TypeScript)
- **TypeORM** (PostgreSQL)
- **Bull/Redis** (queue-based notifications)
- **class-validator** (validation)
- **Docker Compose** (containerization)
- **Doppler** (environment management)

---

## 📚 **Documentation**

- **[SETUP.md](SETUP.md)** - Complete setup guide for all environments
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment and operations guide
- **API Documentation**: http://localhost:5900/api/docs (when running)

---

## 🚨 **Important Notes**

- **No local `.env` files** - All environment variables managed through Doppler
- **Docker-based deployment** - PostgreSQL and Redis run in containers
- **Platform-specific OAuth** - Separate client IDs for web, Android, iOS
- **Secure by default** - No sensitive data in version control

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**SplitBuddy Backend is your all-in-one platform for collaborative and personal finance management, ready for real-world use and future growth.**
