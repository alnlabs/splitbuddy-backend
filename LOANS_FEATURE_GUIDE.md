# 💰 Loans Feature Guide

## 🎯 **Overview**

The SplitBuddy Loans feature provides comprehensive loan management capabilities, allowing users to track loans they've given or received, manage payments, calculate interest, and monitor loan status.

---

## ✨ **Key Features**

### **Loan Management**
- ✅ **Create Loans** - Track loans given or taken
- ✅ **Interest Calculation** - Simple, compound, or no interest
- ✅ **Payment Tracking** - Record and manage loan payments
- ✅ **Status Management** - Active, repaid, overdue, defaulted, cancelled
- ✅ **Reminders** - Automatic overdue notifications
- ✅ **Collateral Tracking** - Document loan collateral
- ✅ **Recurring Payments** - Set up recurring payment schedules

### **Advanced Features**
- ✅ **Multiple Payment Types** - Principal, interest, late fees, partial payments
- ✅ **Late Fee Calculation** - Automatic late fee tracking
- ✅ **Document Management** - Attach documents to loans
- ✅ **Tagging System** - Organize loans with tags
- ✅ **Group Integration** - Link loans to expense groups
- ✅ **Comprehensive Reporting** - Loan summaries and statistics

---

## 🏗️ **Database Schema**

### **Loans Table**
```sql
CREATE TABLE "loans" (
  "id" uuid PRIMARY KEY,
  "loan_type" enum('given', 'taken'),
  "lender_id" uuid REFERENCES users(id),
  "borrower_id" uuid REFERENCES users(id),
  "principal_amount" decimal(12,2),
  "interest_amount" decimal(12,2),
  "total_amount" decimal(12,2),
  "paid_amount" decimal(12,2),
  "remaining_amount" decimal(12,2),
  "interest_rate" decimal(5,2),
  "interest_type" enum('simple', 'compound', 'none'),
  "start_date" date,
  "due_date" date,
  "repaid_date" date,
  "status" enum('active', 'repaid', 'overdue', 'defaulted', 'cancelled'),
  "description" text,
  "notes" text,
  "group_id" uuid REFERENCES user_groups(id),
  "payment_method_id" uuid REFERENCES payment_methods(id),
  "category_id" uuid REFERENCES categories(id),
  "author_id" uuid REFERENCES users(id),
  "is_recurring" boolean,
  "recurring_frequency" varchar,
  "recurring_amount" decimal(12,2),
  "next_payment_date" date,
  "reminder_enabled" boolean,
  "reminder_days" integer,
  "collateral_description" text,
  "collateral_value" decimal(12,2),
  "late_fee_rate" decimal(5,2),
  "late_fee_amount" decimal(12,2),
  "documents" text[],
  "tags" text[],
  "created_at" timestamp,
  "updated_at" timestamp
);
```

### **Loan Payments Table**
```sql
CREATE TABLE "loan_payments" (
  "id" uuid PRIMARY KEY,
  "loan_id" uuid REFERENCES loans(id),
  "payer_id" uuid REFERENCES users(id),
  "payee_id" uuid REFERENCES users(id),
  "amount" decimal(12,2),
  "payment_type" enum('principal', 'interest', 'late_fee', 'partial'),
  "principal_amount" decimal(12,2),
  "interest_amount" decimal(12,2),
  "late_fee_amount" decimal(12,2),
  "payment_date" date,
  "payment_method_id" uuid REFERENCES payment_methods(id),
  "description" text,
  "notes" text,
  "reference_number" varchar,
  "transaction_id" varchar,
  "author_id" uuid REFERENCES users(id),
  "created_at" timestamp,
  "updated_at" timestamp
);
```

---

## 🚀 **API Endpoints**

### **Loan Management**

#### **Create Loan**
```http
POST /api/v1/loans
Content-Type: application/json
Authorization: Bearer <token>

{
  "loanType": "given",
  "lenderId": "user-uuid",
  "borrowerId": "user-uuid",
  "principalAmount": 1000.00,
  "interestRate": 5.5,
  "interestType": "simple",
  "startDate": "2024-01-01",
  "dueDate": "2024-12-31",
  "description": "Personal loan for home renovation",
  "groupId": "group-uuid",
  "reminderEnabled": true,
  "reminderDays": 7
}
```

#### **Get All Loans**
```http
GET /api/v1/loans?loanType=given&status=active&page=1&limit=10
Authorization: Bearer <token>
```

#### **Get Loan Summary**
```http
GET /api/v1/loans/summary?groupId=group-uuid&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### **Update Loan**
```http
PATCH /api/v1/loans/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "repaid",
  "notes": "Loan fully repaid"
}
```

#### **Delete Loan**
```http
DELETE /api/v1/loans/:id
Authorization: Bearer <token>
```

### **Payment Management**

#### **Create Payment**
```http
POST /api/v1/loans/payments
Content-Type: application/json
Authorization: Bearer <token>

{
  "loanId": "loan-uuid",
  "amount": 500.00,
  "paymentType": "partial",
  "principalAmount": 400.00,
  "interestAmount": 100.00,
  "paymentDate": "2024-06-15",
  "description": "Monthly payment"
}
```

#### **Get All Payments**
```http
GET /api/v1/loans/payments?loanId=loan-uuid&paymentType=principal&page=1&limit=10
Authorization: Bearer <token>
```

#### **Get Loan Payments**
```http
GET /api/v1/loans/:id/payments?page=1&limit=10
Authorization: Bearer <token>
```

---

## 💡 **Use Cases**

### **1. Personal Loan Tracking**
```json
{
  "loanType": "given",
  "lenderId": "your-user-id",
  "borrowerId": "friend-user-id",
  "principalAmount": 2000.00,
  "interestRate": 0,
  "interestType": "none",
  "startDate": "2024-01-15",
  "dueDate": "2024-07-15",
  "description": "Loan to friend for car repair",
  "reminderEnabled": true,
  "reminderDays": 14
}
```

### **2. Business Loan with Interest**
```json
{
  "loanType": "taken",
  "lenderId": "bank-user-id",
  "borrowerId": "your-user-id",
  "principalAmount": 50000.00,
  "interestRate": 8.5,
  "interestType": "compound",
  "startDate": "2024-01-01",
  "dueDate": "2029-01-01",
  "description": "Business expansion loan",
  "isRecurring": true,
  "recurringFrequency": "monthly",
  "recurringAmount": 1250.00,
  "collateralDescription": "Business equipment",
  "collateralValue": 75000.00
}
```

### **3. Group Loan**
```json
{
  "loanType": "given",
  "lenderId": "your-user-id",
  "borrowerId": "group-member-id",
  "principalAmount": 1500.00,
  "interestRate": 3.0,
  "interestType": "simple",
  "startDate": "2024-02-01",
  "dueDate": "2024-08-01",
  "description": "Group member emergency loan",
  "groupId": "group-uuid",
  "tags": ["emergency", "group"]
}
```

---

## 🔧 **Business Logic**

### **Interest Calculation**

#### **Simple Interest**
```
Interest = (Principal × Rate × Days) / (100 × 365)
```

#### **Compound Interest**
```
Interest = Principal × (1 + Rate/(100 × 12))^Months - Principal
```

### **Payment Processing**
1. **Validate Payment Amount** - Cannot exceed remaining loan amount
2. **Update Loan Amounts** - Recalculate paid and remaining amounts
3. **Update Loan Status** - Mark as repaid if fully paid
4. **Send Notifications** - Notify relevant parties

### **Overdue Detection**
- **Automatic Check** - Daily check for overdue loans
- **Status Update** - Change status from 'active' to 'overdue'
- **Notifications** - Send overdue reminders to borrowers

---

## 📊 **Reporting & Analytics**

### **Loan Summary**
```json
{
  "totalLoans": 15,
  "activeLoans": 8,
  "overdueLoans": 2,
  "repaidLoans": 5,
  "totalGiven": 25000.00,
  "totalTaken": 50000.00,
  "totalInterestEarned": 1250.00,
  "totalInterestPaid": 2500.00,
  "outstandingGiven": 8000.00,
  "outstandingTaken": 15000.00
}
```

### **Filtering Options**
- **Loan Type** - Given or taken
- **Status** - Active, repaid, overdue, etc.
- **Date Range** - Filter by start or due dates
- **Group** - Filter by expense group
- **Search** - Search by description, notes, or user names

---

## 🔔 **Notifications**

### **Loan Notifications**
- **Loan Created** - Notify borrower of new loan
- **Loan Updated** - Notify relevant parties of changes
- **Loan Overdue** - Remind borrower of overdue payment

### **Payment Notifications**
- **Payment Received** - Notify lender of payment
- **Payment Updated** - Notify relevant parties of changes

---

## 🛡️ **Security & Permissions**

### **Access Control**
- **Loan Access** - Only lender, borrower, and author can view loan
- **Update Permissions** - Only loan author can update loan details
- **Delete Restrictions** - Cannot delete loan with existing payments
- **Payment Permissions** - Only payment author can update/delete payments

### **Data Validation**
- **Amount Validation** - Payment amount cannot exceed remaining loan
- **Date Validation** - Due date must be after start date
- **Rate Validation** - Interest rate must be between 0-100%
- **User Validation** - Lender and borrower must exist

---

## 🚀 **Deployment**

### **Database Migration**
The loans feature includes a comprehensive migration that:
- Creates loan and loan_payments tables
- Sets up proper foreign key relationships
- Creates indexes for performance
- Defines enums for loan types and statuses

### **Module Integration**
The LoanModule is automatically integrated into the main AppModule and includes:
- TypeORM entity registration
- Notification service integration
- JWT authentication guards
- Swagger API documentation

---

## 📱 **Frontend Integration**

### **API Response Format**
All loan endpoints return responses in the standard format:
```json
{
  "success": true,
  "data": {
    // Loan or payment data
  },
  "message": "Operation completed successfully",
  "error": null
}
```

### **Error Handling**
- **400 Bad Request** - Invalid data or business rule violations
- **404 Not Found** - Loan or payment not found
- **403 Forbidden** - Insufficient permissions

---

## 🎯 **Next Steps**

1. **Deploy Migration** - Run the loan migration
2. **Test API Endpoints** - Verify all CRUD operations
3. **Frontend Integration** - Build loan management UI
4. **Notification Setup** - Configure email and in-app notifications
5. **Reporting Dashboard** - Create loan analytics dashboard

---

**The loans feature is now ready for use! 🎉**

This comprehensive loan management system provides all the tools needed to track, manage, and monitor loans effectively within the SplitBuddy application.
