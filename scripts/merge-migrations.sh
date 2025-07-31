#!/bin/bash

# Merge Migrations Script
# This script removes old migration files and keeps only the consolidated migration

echo "🧹 Cleaning up old migration files..."

# Remove old migration files
rm -f src/migrations/1753260075994-InitialMigration.ts
rm -f src/migrations/1753273597583-AddTransactionTable.ts
rm -f src/migrations/1753274000000-AddNotificationsTable.ts
rm -f src/migrations/1753275000000-CreateDefaultDataForExistingUsers.ts

# Remove compiled migration files from dist
rm -f dist/migrations/1753260075994-InitialMigration.js
rm -f dist/migrations/1753260075994-InitialMigration.js.map
rm -f dist/migrations/1753260075994-InitialMigration.d.ts
rm -f dist/migrations/1753273597583-AddTransactionTable.js
rm -f dist/migrations/1753273597583-AddTransactionTable.js.map
rm -f dist/migrations/1753273597583-AddTransactionTable.d.ts
rm -f dist/migrations/1753274000000-AddNotificationsTable.js
rm -f dist/migrations/1753274000000-AddNotificationsTable.js.map
rm -f dist/migrations/1753274000000-AddNotificationsTable.d.ts
rm -f dist/migrations/1753275000000-CreateDefaultDataForExistingUsers.js
rm -f dist/migrations/1753275000000-CreateDefaultDataForExistingUsers.js.map
rm -f dist/migrations/1753275000000-CreateDefaultDataForExistingUsers.d.ts

echo "✅ Old migration files removed"
echo "📁 Current migration files:"
ls -la src/migrations/

echo ""
echo "🔄 Rebuilding TypeScript..."
npm run build

echo ""
echo "✅ Migration consolidation complete!"
echo "📋 Only 1700000000000-InitialMigration.ts remains"
echo "🚀 Ready to run: npm run migration:run"