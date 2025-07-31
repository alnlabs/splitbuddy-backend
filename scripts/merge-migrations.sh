#!/bin/bash
# Merge Migrations Script
# This script removes old migration files and keeps only the consolidated migration

echo "🧹 Cleaning up old migration files..."

# Remove old migration files
rm -f src/migrations/1753260075994-InitialMigration.ts
rm -f src/migrations/1753273597583-AddTransactionTable.ts
rm -f src/migrations/1753274000000-AddNotificationsTable.ts
rm -f src/migrations/1753275000000-CreateDefaultDataForExistingUsers.ts
rm -f src/migrations/1753276000000-AddIsSharedToUserGroups.ts
rm -f src/migrations/1753277000000-UpdateIsSharedDefault.ts
rm -f src/migrations/1753278000000-AddDescriptionToUserGroups.ts

echo "✅ Old migration files removed"
echo "🔄 Rebuilding TypeScript..."
npm run build
echo "✅ Migration consolidation complete!"
echo ""
echo "📋 Summary:"
echo "   - Removed 7 old migration files"
echo "   - Kept consolidated migration: 1700000000000-InitialMigration.ts"
echo "   - All database schema is now in one file"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run migration:run"
echo "   2. Test the application"
echo "   3. Commit the changes" 