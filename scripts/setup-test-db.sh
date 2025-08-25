#!/bin/bash

# Setup Test Database Script
# This script sets up the test environment for unit testing

echo "🚀 Setting up test database environment..."

# Check if .env.test exists, if not copy from template
if [ ! -f .env.test ]; then
    echo "📋 Creating .env.test from template..."
    cp env.test.config .env.test
    echo "✅ .env.test created"
else
    echo "✅ .env.test already exists"
fi

# Start test database containers
echo "🐳 Starting test database containers..."
docker-compose -f docker-compose.test.yml up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is accessible
echo "🔍 Checking database connection..."
docker exec splitbuddy_postgres_test pg_isready -U splitbuddy_user_test -d splitbuddy_test

if [ $? -eq 0 ]; then
    echo "✅ Database is ready"
else
    echo "❌ Database connection failed"
    exit 1
fi

echo "🎉 Test environment setup complete!"
echo ""
echo "To run tests:"
echo "  npm run test:unit"
echo ""
echo "To stop test containers:"
echo "  docker-compose -f docker-compose.test.yml down"
