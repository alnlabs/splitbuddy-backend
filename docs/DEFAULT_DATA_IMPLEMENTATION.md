# Default Data Implementation Documentation

## Overview

This document covers the complete implementation of default data (payment methods and categories) in the SplitBuddy backend. The system automatically creates common payment methods and expense categories for new users and provides multiple ways to create default data for existing users.

## Table of Contents

1. [Architecture](#architecture)
2. [Default Data Types](#default-data-types)
3. [Implementation Scenarios](#implementation-scenarios)
4. [Backend Implementation](#backend-implementation)
5. [Database Migration](#database-migration)
6. [Manual Scripts](#manual-scripts)
7. [Mobile App Integration](#mobile-app-integration)
8. [Troubleshooting](#troubleshooting)
9. [API Endpoints](#api-endpoints)

## Architecture

### Design Principles

- **Backend-Only Control**: All default data creation is handled by the backend
- **Automatic Creation**: New users get default data automatically
- **Manual Options**: Multiple ways to create data for existing users
- **Idempotent**: Safe to run multiple times without duplicates

### Components

- `DefaultDataService`: Core service for creating default data
- `DefaultDataModule`: NestJS module for dependency injection
- Database Migration: Automatic creation for existing users
- CLI Scripts: Manual creation commands
- Auth Service Integration: Automatic creation on user registration

## Default Data Types

### Payment Methods (10 items)

```
1. Cash
2. Credit Card
3. Debit Card
4. Bank Transfer
5. UPI
6. PayPal
7. Venmo
8. Apple Pay
9. Google Pay
10. Check
```

### Categories (17 items)

```
1. Food & Dining
2. Transportation
3. Shopping
4. Entertainment
5. Healthcare
6. Utilities
7. Rent/Mortgage
8. Insurance
9. Education
10. Travel
11. Gifts
12. Personal Care
13. Home & Garden
14. Business
15. Investment
16. Taxes
17. Other
```

## Implementation Scenarios

### Scenario 1: New User Registration

**When**: User signs up via email/password or Google OAuth
**What Happens**: Backend automatically creates default data
**Files Involved**: `auth.service.ts`, `default-data.service.ts`

### Scenario 2: Database Initial Setup

**When**: Database is first created or migrated
**What Happens**: Migration creates default data for all existing users
**Files Involved**: Migration file, `migration:run` command

### Scenario 3: Manual Creation for All Users

**When**: Admin wants to create default data for all existing users
**What Happens**: CLI script creates data for all users
**Files Involved**: `create-default-data.ts` script

### Scenario 4: Manual Creation for Specific User

**When**: Admin wants to create default data for a specific user
**What Happens**: CLI script creates data for specified user
**Files Involved**: `create-default-data-for-user.ts` script

### Scenario 5: Mobile App Usage

**When**: Mobile app loads user data
**What Happens**: App fetches existing data without trying to create it
**Files Involved**: Mobile app services, Redux store

## Backend Implementation

### 1. DefaultDataService

**File**: `src/services/default-data.service.ts`

```typescript
@Injectable()
export class DefaultDataService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async createDefaultPaymentMethods(userId: string): Promise<number>;
  async createDefaultCategories(userId: string): Promise<number>;
  async createDefaultDataForUser(userId: string): Promise<void>;
  async checkDefaultDataStatus(userId: string): Promise<DefaultDataStatus>;
}
```

### 2. DefaultDataModule

**File**: `src/services/default-data.module.ts`

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, Category])],
  providers: [DefaultDataService],
  exports: [DefaultDataService],
})
export class DefaultDataModule {}
```

### 3. Auth Service Integration

**File**: `src/auth/auth.service.ts`

```typescript
// In register() method
const user = await this.userRepository.save(newUser);
await this.defaultDataService.createDefaultDataForUser(user.id);

// In googleSignup() method
const user = await this.userRepository.save(newUser);
await this.defaultDataService.createDefaultDataForUser(user.id);
```

## Database Migration

### Migration File

**File**: `src/migrations/1753275000000-CreateDefaultDataForExistingUsers.ts`

### Running Migration

```bash
# Run migration
npm run migration:run

# Or using Docker
docker compose -f docker-compose.local.yml exec backend npm run migration:run
```

### Migration Features

- Creates default data for all existing users
- Handles duplicates gracefully (skips existing items)
- Provides rollback functionality
- Logs progress and results

## Manual Scripts

### 1. Create Default Data for All Users

**Command**:

```bash
npm run create-default-data
```

**Docker Command**:

```bash
docker compose -f docker-compose.local.yml exec backend npm run create-default-data
```

**What it does**:

- Finds all enabled users
- Creates default payment methods and categories for each user
- Skips existing items (idempotent)
- Provides detailed logging

### 2. Create Default Data for Specific User

**Command**:

```bash
npm run create-default-data-for-user <userId>
```

**Example**:

```bash
npm run create-default-data-for-user b4e53db6-5787-4eb3-9456-83c7808dbbd4
```

**Docker Command**:

```bash
docker compose -f docker-compose.local.yml exec backend npm run create-default-data-for-user <userId>
```

**What it does**:

- Validates user ID exists
- Creates default data for specified user only
- Provides detailed logging
- Exits with error if user not found

## Mobile App Integration

### Architecture Decision

- **No Default Data Creation**: Mobile app never attempts to create default data
- **Data Fetching Only**: App only fetches existing data from backend
- **Error Handling**: Graceful handling when data doesn't exist

### Removed Components

- `defaultDataService.ts` - Deleted
- `defaultDataSlice.ts` - Deleted
- `defaultDataSaga.ts` - Deleted
- Default data logic from `DataLoader.tsx` - Removed

### Current Flow

1. User logs in/signs up
2. Backend automatically creates default data
3. Mobile app fetches existing data
4. User sees payment methods and categories immediately

## Troubleshooting

### Common Issues

#### 1. Migration Fails with "relation already exists"

**Problem**: Table already exists in database
**Solution**: Mark migration as executed manually

```sql
INSERT INTO migrations (timestamp, name)
VALUES (1753274000000, 'AddNotificationsTable1753274000000')
ON CONFLICT DO NOTHING;
```

#### 2. Script Fails with "User not found"

**Problem**: Invalid user ID provided
**Solution**: Verify user ID exists in database

```sql
SELECT id, email FROM "user" WHERE id = 'your-user-id';
```

#### 3. Duplicate Data Creation

**Problem**: Script creates duplicate items
**Solution**: Scripts are idempotent - they skip existing items automatically

#### 4. Redis Connection Error in Scripts

**Problem**: Script tries to connect to Redis
**Solution**: This is expected - Redis connection is not needed for data creation

### Debugging Commands

#### Check User Data

```sql
-- Check if user exists
SELECT id, email, enabled FROM "user" WHERE email = 'user@example.com';

-- Check user's payment methods
SELECT * FROM "payment_method" WHERE "authorId" = 'user-id';

-- Check user's categories
SELECT * FROM "category" WHERE "authorId" = 'user-id';
```

#### Check Migration Status

```sql
-- Check executed migrations
SELECT * FROM "migrations" ORDER BY timestamp DESC;
```

#### Verify Default Data

```sql
-- Count payment methods per user
SELECT "authorId", COUNT(*) as payment_method_count
FROM "payment_method"
GROUP BY "authorId";

-- Count categories per user
SELECT "authorId", COUNT(*) as category_count
FROM "category"
GROUP BY "authorId";
```

## API Endpoints

### Default Data Status

**GET** `/api/v1/auth/default-data/status`

- Returns status of default data for authenticated user
- Response: `{ hasPaymentMethods: boolean, hasCategories: boolean }`

### Create Default Data

**POST** `/api/v1/auth/default-data/create`

- Creates default data for authenticated user
- Response: `{ success: boolean, message: string }`

### User Profile

**GET** `/api/v1/auth/profile`

- Returns user profile with payment methods and categories
- Includes default data in response

## Package.json Scripts

```json
{
  "scripts": {
    "create-default-data": "ts-node -r tsconfig-paths/register src/scripts/create-default-data.ts",
    "create-default-data-for-user": "ts-node -r tsconfig-paths/register src/scripts/create-default-data-for-user.ts",
    "migration:run": "npx ts-node ./node_modules/typeorm/cli.js -d src/data-source.cli.ts migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

## File Structure

```
splitbuddy-backend/
├── src/
│   ├── services/
│   │   ├── default-data.service.ts
│   │   └── default-data.module.ts
│   ├── auth/
│   │   ├── auth.service.ts
│   │   └── auth.controller.ts
│   ├── migrations/
│   │   └── 1753275000000-CreateDefaultDataForExistingUsers.ts
│   └── scripts/
│       ├── create-default-data.ts
│       └── create-default-data-for-user.ts
├── package.json
└── docs/
    └── DEFAULT_DATA_IMPLEMENTATION.md
```

## Best Practices

### For Developers

1. **Always check if data exists** before creating
2. **Use transactions** for data consistency
3. **Log operations** for debugging
4. **Handle errors gracefully**
5. **Make scripts idempotent**

### For Operations

1. **Run migration** after database setup
2. **Use manual scripts** for specific users
3. **Monitor logs** for errors
4. **Backup data** before major operations
5. **Test in staging** before production

### For Mobile App

1. **Never create default data** on client side
2. **Handle missing data gracefully**
3. **Show loading states** during data fetch
4. **Cache data** for offline use
5. **Refresh data** on app activation

## Summary

The default data implementation provides a robust, scalable solution for ensuring all users have access to common payment methods and expense categories. The system is designed to be:

- **Automatic**: New users get data without intervention
- **Flexible**: Multiple ways to create data for existing users
- **Reliable**: Idempotent operations prevent duplicates
- **Maintainable**: Clear separation of concerns
- **Debuggable**: Comprehensive logging and error handling

This implementation ensures a consistent user experience across the SplitBuddy application while maintaining data integrity and system reliability.
