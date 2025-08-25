# Development Guide

This guide covers all the different ways to run, stop, and manage the SplitBuddy backend application during development.

## 🚀 Quick Start Options

### **Option 1: Full Stack with Docker (Recommended)**

```bash
# Start everything (Backend + Database + Redis)
./deploy.sh local-start
# or
./docker-manager.sh local up
```

### **Option 2: Partial Stack with Docker**

```bash
# Start only database and Redis
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Start only backend (if DB/Redis already running)
docker-compose -f docker-compose.dev.yml up backend -d
```

### **Option 3: Local Development (No Docker)**

```bash
# Install dependencies
npm install

# Start with local PostgreSQL/Redis
npm run migration:run
npm run create-default-data
npm run start:dev
```

## 🐳 Docker-Based Development

### **Environment Management**

#### **Start Environments**

```bash
# Development environment
./docker-manager.sh local up
# or
docker-compose -f docker-compose.dev.yml up -d

# Test environment
./docker-manager.sh test up
# or
docker-compose -f docker-compose.test.yml up -d

# Production environment
./docker-manager.sh prod up
# or
docker-compose -f docker-compose.prod.yml up -d

# Both test and production
./docker-manager.sh both up
```

#### **Stop Environments**

```bash
# Stop development
./docker-manager.sh local down
# or
docker-compose -f docker-compose.dev.yml down

# Stop test
./docker-manager.sh test down
# or
docker-compose -f docker-compose.test.yml down

# Stop production
./docker-manager.sh prod down
# or
docker-compose -f docker-compose.prod.yml down

# Stop both
./docker-manager.sh both down
```

#### **Restart Environments**

```bash
# Restart development
./docker-manager.sh local restart

# Restart test
./docker-manager.sh test restart

# Restart production
./docker-manager.sh prod restart
```

#### **Clean Environments**

```bash
# Clean development (stop + remove volumes)
./docker-manager.sh local clean

# Clean test environment
./docker-manager.sh test clean

# Clean production environment
./docker-manager.sh prod clean
```

### **Partial Service Management**

#### **Start Specific Services**

```bash
# Start only backend
docker-compose -f docker-compose.dev.yml up backend -d

# Start only database
docker-compose -f docker-compose.dev.yml up postgres -d

# Start only Redis
docker-compose -f docker-compose.dev.yml up redis -d

# Start database and Redis (no backend)
docker-compose -f docker-compose.dev.yml up postgres redis -d

# Start backend and database (no Redis)
docker-compose -f docker-compose.dev.yml up backend postgres -d
```

#### **Stop Specific Services**

```bash
# Stop only backend
docker-compose -f docker-compose.dev.yml stop backend

# Stop only database
docker-compose -f docker-compose.dev.yml stop postgres

# Stop only Redis
docker-compose -f docker-compose.dev.yml stop redis

# Stop database and Redis
docker-compose -f docker-compose.dev.yml stop postgres redis
```

#### **View Logs**

```bash
# View all logs
docker-compose -f docker-compose.dev.yml logs

# View backend logs
docker-compose -f docker-compose.dev.yml logs backend

# Follow backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# View database logs
docker-compose -f docker-compose.dev.yml logs postgres

# View Redis logs
docker-compose -f docker-compose.dev.yml logs redis
```

#### **Rebuild Services**

```bash
# Rebuild and start backend
docker-compose -f docker-compose.dev.yml up --build backend -d

# Rebuild and start all services
docker-compose -f docker-compose.dev.yml up --build -d

# Rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache backend
docker-compose -f docker-compose.dev.yml up backend -d
```

## 📦 NPM Scripts

### **Development Scripts**

```bash
# Start in development mode with watch
npm run start:dev

# Start in debug mode
npm run start:debug

# Start in production mode
npm run start:prod

# Build the application
npm run build

# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### **Database Management**

```bash
# Generate new migration
npm run migration:generate

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Create default categories and payment methods
npm run create-default-data

# Create data for specific user
npm run create-default-data-for-user
```

### **Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e

# Run unit tests only
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with coverage
npm run test:unit:cov

# Setup test database
npm run test:setup
```

### **Docker Integration**

```bash
# Start development with Docker
npm run docker:dev

# Stop Docker containers
npm run docker:down

# Start with Doppler (dev environment)
npm run docker:doppler:dev

# Start with Doppler (prod environment)
npm run docker:doppler:prod
```

### **Doppler Integration**

```bash
# Start with Doppler
npm run start:doppler

# Start with Doppler (dev environment)
npm run start:doppler:dev

# Start with Doppler (test environment)
npm run start:doppler:test

# Start with Doppler (prod environment)
npm run start:doppler:prod
```

### **Utilities**

```bash
# Export API to Postman collection
npm run export:postman

# Run TypeORM CLI
npm run typeorm
```

## 🔧 Manual Commands

### **Database Operations**

```bash
# Connect to database
psql -h localhost -U splitbuddy_user_dev -d splitbuddy_dev

# Run SQL scripts
psql -h localhost -U splitbuddy_user_dev -d splitbuddy_dev -f setup_db.sql
psql -h localhost -U splitbuddy_user_dev -d splitbuddy_dev -f fix-user-settings.sql

# Debug database
./debug-db.sh

# Database manager
./db-manager.sh
```

### **Environment Management**

```bash
# Update environment variables
./scripts/update-env.sh

# Sync environment configurations
./scripts/sync-common-configs.sh

# Setup Doppler environments
./scripts/setup-doppler-environments.sh

# Setup GitHub secrets
./scripts/setup-github-secrets.sh

# Update OAuth configurations
./scripts/update-oauth-configs.sh
```

### **Deployment Scripts**

```bash
# Main deployment script
./deploy.sh local-start        # Start local development
./deploy.sh local-stop         # Stop local development
./deploy.sh build              # Build production
./deploy.sh deploy             # Deploy to production
./deploy.sh restart            # Restart production

# Simple deployment
./simple-deploy.sh

# Test deployment
./test-deploy.sh

# Deploy with Doppler
./scripts/deploy-with-doppler.sh

# Deploy migrations
./deploy-migration.sh
```

## 🧹 Cleaning Commands

### **Docker Cleanup**

```bash
# Remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.prod.yml down -v

# Remove specific containers
docker-compose -f docker-compose.dev.yml down -v postgres
docker-compose -f docker-compose.dev.yml down -v redis

# Remove images
docker rmi splitbuddy-backend_backend
docker rmi postgres:15
docker rmi redis:7-alpine

# Clean Docker system
docker system prune -f          # Remove unused containers, networks, images
docker volume prune -f          # Remove unused volumes
docker image prune -f           # Remove unused images
docker container prune -f       # Remove stopped containers
docker network prune -f         # Remove unused networks
```

### **Node.js Cleanup**

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Remove build artifacts
rm -rf dist/
rm -rf coverage/

# Clear TypeScript cache
rm -rf .tsbuildinfo
```

### **Database Cleanup**

```bash
# Drop and recreate database
dropdb -h localhost -U postgres splitbuddy_dev
createdb -h localhost -U postgres splitbuddy_dev

# Reset migrations
npm run migration:revert        # Revert last migration
# Repeat until all migrations are reverted
npm run migration:run          # Run migrations again

# Clean database data (keep structure)
psql -h localhost -U splitbuddy_user_dev -d splitbuddy_dev -c "TRUNCATE TABLE users, expenses, groups CASCADE;"
```

### **Complete Cleanup**

```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.prod.yml down -v

# Remove all images
docker rmi $(docker images -q)

# Clean Docker system
docker system prune -af

# Remove node_modules
rm -rf node_modules package-lock.json

# Remove build artifacts
rm -rf dist/ coverage/

# Reinstall everything
npm install
```

## 🔄 Common Development Workflows

### **Fresh Start (Complete Reset)**

```bash
# 1. Clean everything
./docker-manager.sh local clean
rm -rf node_modules package-lock.json

# 2. Reinstall dependencies
npm install

# 3. Start fresh
./docker-manager.sh local up

# 4. Run migrations
npm run migration:run

# 5. Create default data
npm run create-default-data
```

### **Backend Only Development**

```bash
# 1. Start database and Redis
docker-compose -f docker-compose.dev.yml up postgres redis -d

# 2. Start backend locally
npm run start:dev

# 3. Stop backend (keep DB/Redis running)
# Ctrl+C to stop backend

# 4. Restart backend
npm run start:dev
```

### **Database Schema Changes**

```bash
# 1. Generate migration
npm run migration:generate

# 2. Review generated migration file
# Edit src/migrations/[timestamp]-[name].ts if needed

# 3. Run migration
npm run migration:run

# 4. If something goes wrong, revert
npm run migration:revert
```

### **Testing Workflow**

```bash
# 1. Setup test database
npm run test:setup

# 2. Run tests
npm test

# 3. Run tests with coverage
npm run test:cov

# 4. Run specific test file
npm test -- --testPathPattern=auth.service.spec.ts

# 5. Run tests in watch mode
npm run test:watch
```

### **Debugging Workflow**

```bash
# 1. Start in debug mode
npm run start:debug

# 2. Attach debugger (VS Code)
# Add breakpoints in your code

# 3. Or use Chrome DevTools
# Open chrome://inspect

# 4. Alternative: Use logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Port Already in Use**

```bash
# Check what's using the port
lsof -i :5900

# Kill the process
kill -9 <PID>

# Or use different port
APP_PORT=5901 npm run start:dev
```

#### **Database Connection Issues**

```bash
# Check if database is running
docker-compose -f docker-compose.dev.yml ps postgres

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres
```

#### **Docker Issues**

```bash
# Check Docker status
docker info

# Restart Docker
sudo systemctl restart docker

# Check available disk space
df -h

# Clean Docker
docker system prune -af
```

#### **Permission Issues**

```bash
# Fix file permissions
chmod +x *.sh
chmod +x scripts/*.sh

# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

### **Reset Everything**

```bash
# Complete reset script
#!/bin/bash
echo "🧹 Complete Reset Script"

# Stop all containers
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.test.yml down -v
docker-compose -f docker-compose.prod.yml down -v

# Clean Docker
docker system prune -af

# Remove node_modules
rm -rf node_modules package-lock.json

# Remove build artifacts
rm -rf dist/ coverage/

# Reinstall
npm install

# Start fresh
./docker-manager.sh local up

echo "✅ Reset complete!"
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Jest Testing Framework](https://jestjs.io/)
- [Doppler Documentation](https://docs.doppler.com/)
