# Default Data Quick Reference Guide

## Quick Commands

### Create Default Data for All Users

```bash
# Local
npm run create-default-data

# Docker
docker compose -f docker-compose.local.yml exec backend npm run create-default-data
```

### Create Default Data for Specific User

```bash
# Local
npm run create-default-data-for-user <userId>

# Docker
docker compose -f docker-compose.local.yml exec backend npm run create-default-data-for-user <userId>

# Example
npm run create-default-data-for-user b4e53db6-5787-4eb3-9456-83c7808dbbd4
```

### Run Database Migration

```bash
# Local
npm run migration:run

# Docker
docker compose -f docker-compose.local.yml exec backend npm run migration:run
```

## Common Scenarios

### 1. New User Registration

**What happens**: Automatic default data creation
**No action needed**: Backend handles everything

### 2. Database Setup

**Action**: Run migration

```bash
npm run migration:run
```

### 3. Existing Users Need Default Data

**Action**: Run script for all users

```bash
npm run create-default-data
```

### 4. Single User Needs Default Data

**Action**: Run script for specific user

```bash
npm run create-default-data-for-user <userId>
```

### 5. Check User Data

**Action**: Query database

```sql
-- Check user exists
SELECT id, email FROM "user" WHERE email = 'user@example.com';

-- Check payment methods
SELECT * FROM "payment_method" WHERE "authorId" = 'user-id';

-- Check categories
SELECT * FROM "category" WHERE "authorId" = 'user-id';
```

## Troubleshooting

### Migration Fails

```sql
-- Mark migration as executed
INSERT INTO migrations (timestamp, name)
VALUES (1753274000000, 'AddNotificationsTable1753274000000')
ON CONFLICT DO NOTHING;
```

### User Not Found

```sql
-- Verify user exists
SELECT id, email, enabled FROM "user" WHERE id = 'user-id';
```

### Check Migration Status

```sql
-- View executed migrations
SELECT * FROM "migrations" ORDER BY timestamp DESC;
```

## Default Data Summary

### Payment Methods (10)

- Cash, Credit Card, Debit Card, Bank Transfer, UPI
- PayPal, Venmo, Apple Pay, Google Pay, Check

### Categories (17)

- Food & Dining, Transportation, Shopping, Entertainment, Healthcare
- Utilities, Rent/Mortgage, Insurance, Education, Travel
- Gifts, Personal Care, Home & Garden, Business, Investment, Taxes, Other

## API Endpoints

### Check Default Data Status

```bash
GET /api/v1/auth/default-data/status
```

### Create Default Data

```bash
POST /api/v1/auth/default-data/create
```

### Get User Profile (includes default data)

```bash
GET /api/v1/auth/profile
```

## File Locations

- **Service**: `src/services/default-data.service.ts`
- **Module**: `src/services/default-data.module.ts`
- **Migration**: `src/migrations/1753275000000-CreateDefaultDataForExistingUsers.ts`
- **Scripts**: `src/scripts/create-default-data.ts`, `src/scripts/create-default-data-for-user.ts`
- **Documentation**: `docs/DEFAULT_DATA_IMPLEMENTATION.md`

## Success Indicators

### Script Success

```
✅ Default data created for user: user@example.com
Default data creation completed!
```

### Migration Success

```
No migrations are pending
```

### API Success

```json
{
  "success": true,
  "data": {
    "hasPaymentMethods": true,
    "hasCategories": true
  }
}
```
