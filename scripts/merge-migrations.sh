#!/bin/bash
# Migration Management Script
# This script helps manage migration files

echo "🧹 Migration Management Script"
echo "=============================="
echo ""

# Check if we want to consolidate or split migrations
echo "Choose an option:"
echo "1. Consolidate migrations into single file"
echo "2. Split consolidated migration into separate files"
echo "3. Clean up old migration files"
echo "4. Show current migration status"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
  1)
    echo "🔄 Consolidating migrations..."
    # This would consolidate all migrations into one file
    echo "Consolidation feature not implemented yet"
    ;;
  2)
    echo "✅ Migrations are already split into separate files"
    echo "Current migration files:"
    ls -la src/migrations/
    ;;
  3)
    echo "🧹 Cleaning up old migration files..."
    # Remove any old migration files that might exist
    rm -f src/migrations/1753260075994-InitialMigration.ts
    rm -f src/migrations/1753273597583-AddTransactionTable.ts
    rm -f src/migrations/1753274000000-AddNotificationsTable.ts
    rm -f src/migrations/1753275000000-CreateDefaultDataForExistingUsers.ts
    rm -f src/migrations/1753276000000-AddIsSharedToUserGroups.ts
    rm -f src/migrations/1753277000000-UpdateIsSharedDefault.ts
    rm -f src/migrations/1753278000000-AddDescriptionToUserGroups.ts
    echo "✅ Old migration files removed"
    ;;
  4)
    echo "📋 Current migration status:"
    echo ""
    echo "Migration files:"
    ls -la src/migrations/
    echo ""
    echo "Migration order:"
    echo "1. CreateUsersTable (1700000000000)"
    echo "2. CreateUserGroupsTable (1700000000001)"
    echo "3. CreateCategoriesAndPaymentMethodsTable (1700000000002)"
    echo "4. CreateExpensesAndSplitsTable (1700000000003)"
    echo "5. CreateTransactionsAndNotificationsTable (1700000000004)"
    echo "6. CreateUserSettingsAndInvitationsTable (1700000000005)"
    echo "7. CreatePaymentsAndSettingsTable (1700000000006)"
    echo "8. CreateClientsAndChitFundsTable (1700000000007)"
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "🔄 Rebuilding TypeScript..."
npm run build
echo "✅ Migration management complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run migration:run"
echo "   2. Test the application"
echo "   3. Commit the changes"