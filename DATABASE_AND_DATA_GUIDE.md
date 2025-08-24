# 🗄️ Database & Data Handling Guide

## 📋 **Overview**

The SplitBuddy backend uses **PostgreSQL** with **TypeORM** for database management. The simplified deployment handles everything automatically:

- ✅ **Database Creation** - Automatic setup
- ✅ **Migrations** - Automatic schema updates
- ✅ **Default Data** - Pre-populated categories and payment methods
- ✅ **Data Persistence** - Docker volumes for data storage

---

## 🏗️ **Database Architecture**

### **Tables Created by Migrations:**

1. **Users** - User accounts and authentication
2. **UserGroups** - Expense sharing groups
3. **UserGroupMembers** - Group membership
4. **Categories** - Expense categories (Food, Transport, etc.)
5. **PaymentMethods** - Payment methods (Cash, Credit Card, etc.)
6. **Expenses** - Individual expenses
7. **ExpenseSplits** - How expenses are split between users
8. **Transactions** - Financial transactions
9. **Notifications** - User notifications
10. **UserSettings** - User preferences
11. **Invitations** - Group invitations
12. **Payments** - Payment records
13. **Clients** - Client management
14. **ChitFunds** - Chit fund management
15. **Apps** - Application settings

---

## 🚀 **Automatic Database Setup**

### **What Happens During Deployment:**

#### 1. **Database Creation** (`setup_db.sql`)

```sql
-- Creates database users and databases automatically
CREATE ROLE splitbuddy_user_prod LOGIN PASSWORD 'your-password';
CREATE DATABASE splitbuddy_prod OWNER splitbuddy_user_prod;
GRANT ALL PRIVILEGES ON DATABASE splitbuddy_prod TO splitbuddy_user_prod;
```

#### 2. **Schema Migration** (TypeORM Migrations)

```bash
# Runs automatically during deployment
npm run migration:run
```

**Migration Files:**

- `1700000000000-CreateUsersTable.ts`
- `1700000000001-CreateUserGroupsTable.ts`
- `1700000000002-CreateCategoriesAndPaymentMethodsTable.ts`
- `1700000000003-CreateExpensesAndSplitsTable.ts`
- `1700000000004-CreateTransactionsAndNotificationsTable.ts`
- `1700000000005-CreateUserSettingsAndInvitationsTable.ts`
- `1700000000006-CreatePaymentsAndSettingsTable.ts`
- `1700000000007-CreateClientsAndChitFundsTable.ts`
- `1700000000009-CreateAppsTable.ts`
- `1700000000010-AddMissingUserColumns.ts`
- `1700000000011-FixPasswordNullable.ts`
- `1754311016000-FixUserSettingsTable.ts`

#### 3. **Default Data Creation** (`create-default-data.ts`)

```bash
# Runs automatically after migrations
npm run create-default-data
```

**Creates for each user:**

- **10 Payment Methods**: Cash, Credit Card, Debit Card, Bank Transfer, UPI, PayPal, Venmo, Apple Pay, Google Pay, Check
- **17 Categories**: Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Rent/Mortgage, Insurance, Education, Travel, Gifts, Personal Care, Home & Garden, Business, Investment, Taxes, Other

---

## 💾 **Data Persistence**

### **Docker Volumes**

```yaml
# docker-compose.prod.yml
volumes:
  - postgres_data_prod:/var/lib/postgresql/data
```

**Your data is stored in:**

- **Database**: `postgres_data_prod` Docker volume
- **Redis**: In-memory (resets on restart)
- **Application**: Stateless (no persistent data)

### **Data Backup & Restore**

#### **Backup Database:**

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U splitbuddy_user_prod splitbuddy_prod > backup.sql

# Or backup the entire volume
docker run --rm -v splitbuddy_backend_postgres_data_prod:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

#### **Restore Database:**

```bash
# Restore from SQL backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U splitbuddy_user_prod splitbuddy_prod < backup.sql

# Or restore from volume backup
docker run --rm -v splitbuddy_backend_postgres_data_prod:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

---

## 🔧 **Manual Database Operations**

### **Access Database:**

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod

# Or from host (if port is exposed)
psql -h localhost -p 5433 -U splitbuddy_user_prod -d splitbuddy_prod
```

### **Run Migrations Manually:**

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# Generate new migration
docker-compose -f docker-compose.prod.yml exec backend npm run migration:generate -- src/migrations/NewMigrationName

# Revert migration
docker-compose -f docker-compose.prod.yml exec backend npm run migration:revert
```

### **Create Default Data Manually:**

```bash
# Create default data for all users
docker-compose -f docker-compose.prod.yml exec backend npm run create-default-data

# Or run the script directly
docker-compose -f docker-compose.prod.yml exec backend npx ts-node src/scripts/create-default-data.ts
```

---

## 📊 **Database Monitoring**

### **Check Database Status:**

```bash
# Check if database is running
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U splitbuddy_user_prod

# Check database size
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "SELECT pg_size_pretty(pg_database_size('splitbuddy_prod'));"

# Check table sizes
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### **Check Migration Status:**

```bash
# View migration table
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "SELECT * FROM migrations ORDER BY timestamp;"
```

---

## 🔄 **Data Reset & Cleanup**

### **Reset Everything (DANGER - Deletes All Data):**

```bash
# Stop containers and remove volumes
docker-compose -f docker-compose.prod.yml down -v

# Start fresh
./simple-deploy.sh deploy
```

### **Reset Only Database (Keep Volumes):**

```bash
# Drop and recreate database
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -c "DROP DATABASE splitbuddy_prod;"
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -c "CREATE DATABASE splitbuddy_prod;"

# Run migrations and default data
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run
docker-compose -f docker-compose.prod.yml exec backend npm run create-default-data
```

### **Clear Specific Data:**

```bash
# Clear all expenses (keep users and groups)
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "DELETE FROM expense_splits; DELETE FROM expenses;"

# Clear all users (DANGER)
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "DELETE FROM users CASCADE;"
```

---

## 🛡️ **Data Security**

### **Environment Variables:**

```bash
# Database credentials (set in .env)
DB_USERNAME=splitbuddy_user_prod
DB_PASSWORD=your-secure-password
DB_NAME=splitbuddy_prod
```

### **Connection Security:**

- ✅ **Docker Network**: Database only accessible within Docker network
- ✅ **No External Access**: Database not exposed to host by default
- ✅ **Secure Passwords**: Auto-generated secure passwords
- ✅ **SSL Ready**: Can enable SSL for production

### **Production Security:**

```bash
# For production, consider:
# 1. Change default passwords
# 2. Enable SSL connections
# 3. Use external database (AWS RDS, etc.)
# 4. Regular backups
# 5. Database monitoring
```

---

## 📈 **Scaling Considerations**

### **Current Setup (Development/Testing):**

- ✅ Single PostgreSQL instance
- ✅ Docker volumes for persistence
- ✅ Automatic migrations
- ✅ Default data creation

### **Production Scaling:**

- 🔄 **External Database**: AWS RDS, Google Cloud SQL, Azure Database
- 🔄 **Database Clustering**: Read replicas, connection pooling
- 🔄 **Backup Strategy**: Automated backups, point-in-time recovery
- 🔄 **Monitoring**: Database performance monitoring
- 🔄 **Connection Pooling**: Optimize database connections

---

## 🎯 **Summary**

The simplified deployment handles all database operations automatically:

1. **Setup**: Creates database, users, and permissions
2. **Migration**: Runs all schema migrations
3. **Data**: Creates default categories and payment methods
4. **Persistence**: Stores data in Docker volumes
5. **Monitoring**: Health checks and status commands

**You don't need to worry about database setup - it's all automated!** 🎉

---

## 🚀 **Quick Commands**

```bash
# Deploy with full database setup
./simple-deploy.sh deploy

# Check database status
./simple-deploy.sh test

# View database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U splitbuddy_user_prod splitbuddy_prod > backup.sql
```
