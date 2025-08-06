#!/bin/bash
# Migration deployment script for SplitBuddy Backend

echo "🔄 Running database migrations..."

# Run migrations
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

echo "🎉 Migration deployment complete!"