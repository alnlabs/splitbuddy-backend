#!/bin/bash
# Debug script for database connection issues

echo "🔍 Debugging database connection..."

echo ""
echo "📋 1. Checking if containers are running..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📋 2. Checking environment variables..."
docker-compose -f docker-compose.prod.yml exec app printenv | grep -E "(DB_|REDIS_|JWT_|NODE_ENV)"

echo ""
echo "📋 3. Testing basic connectivity..."
docker-compose -f docker-compose.prod.yml exec app sh -c "nc -z postgres 5432 && echo '✅ Port 5432 is reachable' || echo '❌ Port 5432 is not reachable'"

echo ""
echo "📋 4. Checking database logs..."
docker-compose -f docker-compose.prod.yml logs postgres | tail -10

echo ""
echo "📋 5. Checking app logs..."
docker-compose -f docker-compose.prod.yml logs app | tail -10

echo ""
echo "📋 6. Testing database connection manually..."
docker-compose -f docker-compose.prod.yml exec app npm run typeorm -- query "SELECT 1" 2>&1

echo ""
echo "✅ Debug completed!"