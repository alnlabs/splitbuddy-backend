#!/bin/bash
# Test deployment script for SplitBuddy Backend

echo "🧪 Testing SplitBuddy Backend deployment..."

# Test API health
echo "📊 Testing API health..."
curl -f http://localhost:5900/api/v1/db-test || echo "❌ Health check failed"

echo ""
echo "🎉 Test deployment complete!"