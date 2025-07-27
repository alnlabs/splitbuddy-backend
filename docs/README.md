# SplitBuddy Backend Documentation

This directory contains comprehensive documentation for the SplitBuddy backend application.

## Documentation Files

### 📋 [DEFAULT_DATA_IMPLEMENTATION.md](./DEFAULT_DATA_IMPLEMENTATION.md)

Complete documentation for the default data implementation covering:

- Architecture and design principles
- Implementation scenarios for all use cases
- Backend implementation details
- Database migration procedures
- Manual scripts and CLI commands
- Mobile app integration
- Troubleshooting guide
- API endpoints reference

### ⚡ [DEFAULT_DATA_QUICK_REFERENCE.md](./DEFAULT_DATA_QUICK_REFERENCE.md)

Quick reference guide for common operations:

- Essential commands for all scenarios
- Common troubleshooting steps
- Success indicators
- File locations
- API endpoint quick reference

## Default Data Implementation Overview

The default data system ensures all users have access to common payment methods and expense categories. It provides:

### ✅ **Automatic Creation**

- New user registration (email/password)
- Google OAuth signup
- Database migration for existing users

### 🔧 **Manual Options**

- CLI script for all users: `npm run create-default-data`
- CLI script for specific user: `npm run create-default-data-for-user <userId>`
- API endpoints for status and creation

### 📊 **Default Data**

- **10 Payment Methods**: Cash, Credit Card, Debit Card, Bank Transfer, UPI, PayPal, Venmo, Apple Pay, Google Pay, Check
- **17 Categories**: Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Rent/Mortgage, Insurance, Education, Travel, Gifts, Personal Care, Home & Garden, Business, Investment, Taxes, Other

### 🏗️ **Architecture**

- **Backend-Only Control**: All creation handled by backend
- **Idempotent Operations**: Safe to run multiple times
- **Mobile App Integration**: App fetches existing data only
- **Error Handling**: Graceful failure handling

## Quick Start

### For New Users

No action needed - default data is created automatically during registration.

### For Existing Users

```bash
# Create default data for all users
npm run create-default-data

# Or for specific user
npm run create-default-data-for-user <userId>
```

### For Database Setup

```bash
# Run migration to create default data for existing users
npm run migration:run
```

## Contributing

When updating the default data implementation:

1. **Update both documentation files** to reflect changes
2. **Test all scenarios** before updating docs
3. **Include troubleshooting steps** for new features
4. **Update quick reference** with new commands
5. **Verify file paths** are correct

## Support

For issues with default data implementation:

1. Check the [troubleshooting section](./DEFAULT_DATA_IMPLEMENTATION.md#troubleshooting)
2. Review the [quick reference guide](./DEFAULT_DATA_QUICK_REFERENCE.md)
3. Check logs for specific error messages
4. Verify database connectivity and user permissions
