#!/bin/bash
# Database debugging utility for SplitBuddy Backend

echo "🔍 SplitBuddy Database Debug Utility"
echo "===================================="

# Test database connection
echo "📊 Testing database connection..."
curl -s http://localhost:5900/api/v1/db-test | jq '.' 2>/dev/null || curl -s http://localhost:5900/api/v1/db-test

echo ""
echo "🐳 Docker containers status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📋 Database logs (last 20 lines):"
docker logs $(docker ps -q --filter "name=postgres") --tail 20 2>/dev/null || echo "No postgres container found"

echo ""
echo "🔗 Network connectivity:"
ping -c 2 localhost
telnet localhost 5432 <<< "quit" 2>/dev/null || echo "Port 5432 not accessible"

echo ""
echo "Debug complete! ✅"