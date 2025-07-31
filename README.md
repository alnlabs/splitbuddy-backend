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

## **How to Run**

```bash
# Install dependencies
npm install

# Start Postgres and Redis
npm run db:up:local

# Run migrations
npm run migration:run

# Start the app (with hot reload)
npm run start:dev
```

---

## **Ready for Web & Mobile**

- All endpoints are RESTful and ready for consumption by web and mobile clients.
- User settings and notifications are designed for cross-platform use.

---

## **Extensible for the Future**

- Add new transaction types, reports, or settings with minimal changes.
- Integrate with external services (bank sync, SMS, etc.) as needed.

---

**SplitBuddy Backend is your all-in-one platform for collaborative and personal finance management, ready for real-world use and future growth.**
