#!/bin/bash

# Deploy User Settings Table Fix Migration
# This script applies the migration to fix the user_settings table structure in production

echo "🚀 Deploying User Settings Table Fix Migration..."

# Set environment variables for production
export NODE_ENV=production

# Run the migration
echo "📦 Running migration..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo "🔍 Testing the user-settings endpoint..."

    # Test the endpoint
    curl -s https://api.splitbuddyapp.com/api/v1/user-settings/test-user-id | jq .

    echo "✅ Migration deployment completed!"
else
    echo "❌ Migration failed!"
    exit 1
fi