#!/bin/bash
# Test script for deployment functionality

echo "🧪 Testing deployment script..."

# Test help command
echo "📋 Testing help command..."
./deploy.sh help

echo ""
echo "📋 Testing check-migrations command..."
./deploy.sh check-migrations

echo ""
echo "✅ Test completed!"