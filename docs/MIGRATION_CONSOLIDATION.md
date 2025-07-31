# 🔄 Migration Consolidation Guide

This guide explains the migration consolidation process for the SplitBuddy backend application.

## 📋 Overview

The application now uses a **single consolidated migration** (`1700000000000-InitialMigration.ts`) that creates all database tables, relationships, and indexes in one comprehensive migration.

## 🎯 Benefits

- **Simplified Setup**: Only one migration to run
- **Consistent Schema**: All tables created in the correct order
- **Better Performance**: Optimized indexes included
- **Easier Maintenance**: Single source of truth for database schema
- **Clean History**: No migration conflicts or dependencies

## 📁 Migration Structure

### Current Migration Files
```
src/migrations/
└── 1700000000000-InitialMigration.ts  # Consolidated migration
```

### What's Included

#### 🗄️ Database Tables
1. **users** - User accounts and profiles
2. **user_groups** - Expense sharing groups
3. **user_group_members** - Group membership
4. **categories** - Expense categories
5. **payment_methods** - Payment methods
6. **expenses** - Financial transactions
7. **expense_splits** - Expense sharing details
8. **transactions** - Financial records
9. **notifications** - User notifications
10. **user_settings** - User preferences
11. **plans** - User plans
12. **chit_funds** - Chit fund operations

#### 🔗 Foreign Key Relationships
- All proper relationships between tables
- Cascade delete where appropriate
- Referential integrity maintained

#### 📊 Performance Indexes
- Email and username indexes for users
- Group and user indexes for expenses
- Recipient indexes for notifications
- User indexes for settings and plans

## 🚀 Usage

### Fresh Installation
```bash
# Run the consolidated migration
npm run migration:run
```

### Development Setup
```bash
# Clean install
npm install

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

### Production Deployment
```bash
# Build the application
npm run build

# Run migrations
npm run migration:run

# Start production server
npm run start:prod
```

## 🛠️ Migration Scripts

### Consolidation Script
```bash
# Clean up old migrations and keep only consolidated one
./scripts/merge-migrations.sh
```

### Manual Cleanup
```bash
# Remove old migration files
rm src/migrations/1753260075994-InitialMigration.ts
rm src/migrations/1753273597583-AddTransactionTable.ts
rm src/migrations/1753274000000-AddNotificationsTable.ts
rm src/migrations/1753275000000-CreateDefaultDataForExistingUsers.ts

# Rebuild TypeScript
npm run build
```

## 📊 Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "username" varchar UNIQUE NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "password" varchar NOT NULL,
  "firstName" varchar,
  "lastName" varchar,
  -- ... other fields
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);
```

#### User Groups Table
```sql
CREATE TABLE "user_groups" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "groupName" varchar NOT NULL,
  "description" varchar,
  "currency" varchar DEFAULT 'USD',
  "authorId" uuid NOT NULL,
  "isShared" boolean DEFAULT true,
  -- ... other fields
  FOREIGN KEY ("authorId") REFERENCES "users"("id")
);
```

#### Expenses Table
```sql
CREATE TABLE "expenses" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "groupId" uuid NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "description" varchar,
  "date" TIMESTAMP NOT NULL,
  "categoryId" uuid NOT NULL,
  "paymentMethodId" uuid NOT NULL,
  "addedBy" uuid NOT NULL,
  -- ... other fields
  FOREIGN KEY ("groupId") REFERENCES "user_groups"("id"),
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id"),
  FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id"),
  FOREIGN KEY ("addedBy") REFERENCES "users"("id")
);
```

## 🔧 Troubleshooting

### Migration Errors

#### UUID Extension Missing
```bash
# Connect to PostgreSQL and run:
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Permission Issues
```bash
# Ensure database user has proper permissions
GRANT ALL PRIVILEGES ON DATABASE splitbuddy TO postgres;
```

#### Connection Issues
```bash
# Check environment variables
echo $DB_HOST $DB_PORT $DB_USERNAME $DB_PASSWORD $DB_NAME

# Test database connection
psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d $DB_NAME
```

### Common Issues

1. **Database Not Found**
   ```bash
   # Create database
   createdb splitbuddy
   ```

2. **User Not Found**
   ```bash
   # Create user
   createuser -P postgres
   ```

3. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :5432
   
   # Kill the process
   sudo kill -9 <PID>
   ```

## 📈 Performance Considerations

### Indexes Included
- Email and username indexes for fast user lookups
- Group and user indexes for expense queries
- Foreign key indexes for relationship queries
- Recipient indexes for notification filtering

### Query Optimization
- Proper foreign key relationships
- Cascade deletes for data integrity
- Optimized data types (UUID, numeric, timestamps)

## 🔄 Migration Commands

### TypeORM Commands
```bash
# Generate new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Database Commands
```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d splitbuddy

# List tables
\dt

# Describe table
\d table_name

# Check indexes
\di
```

## 📝 Best Practices

### For Developers
1. **Always run migrations** before starting development
2. **Test migrations** in a separate database first
3. **Backup data** before running migrations in production
4. **Use transactions** for data migrations
5. **Document schema changes** in commit messages

### For Production
1. **Schedule maintenance windows** for migrations
2. **Test migrations** in staging environment
3. **Monitor migration logs** for errors
4. **Have rollback plan** ready
5. **Backup database** before migrations

## 🎯 Next Steps

1. **Run the consolidated migration** on your database
2. **Verify all tables** are created correctly
3. **Test the application** with the new schema
4. **Update deployment scripts** to use the new migration
5. **Document any customizations** for your environment

## 📞 Support

If you encounter issues with migrations:

1. Check the [Troubleshooting Guide](../TROUBLESHOOTING.md)
2. Review database logs for specific errors
3. Verify environment variables are correct
4. Test database connectivity manually
5. Check TypeORM configuration in `data-source.ts`

---

**Happy migrating! 🚀** 