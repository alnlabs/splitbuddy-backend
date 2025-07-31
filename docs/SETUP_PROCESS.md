# 🚀 SplitBuddy Setup Process

This guide provides a comprehensive setup process for the SplitBuddy backend application, covering both local development and production deployment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Database Setup](#database-setup)
7. [Environment Configuration](#environment-configuration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [What Gets Created](#what-gets-created)
11. [Quick Reference Commands](#quick-reference-commands)
12. [Security Considerations](#security-considerations)
13. [Monitoring](#monitoring)
14. [Next Steps](#next-steps)

## 🎯 Prerequisites

### System Requirements

- **Node.js**: v18+ (recommended v20+)
- **Docker**: v20+ with Docker Compose
- **Git**: Latest version
- **PostgreSQL**: v13+ (for local development)
- **Redis**: v6+ (for queue management)

### Development Tools

- **Code Editor**: VS Code, WebStorm, or similar
- **API Testing**: Postman, Insomnia, or similar
- **Database Client**: pgAdmin, DBeaver, or similar

### Production Requirements

- **Linux Server**: Ubuntu 20.04+ or CentOS 8+
- **Domain Name**: For SSL certificates
- **Email Service**: For notifications
- **Storage**: Minimum 10GB available space

## ⚡ Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd splitbuddy-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Create environment file
cp .env.example .env

# Or use the setup script
chmod +x setup-env.sh
./setup-env.sh
```

### 4. Start Local Development

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.local.yml up -d

# Or using npm
npm run start:dev
```

### 5. Access Application

- **API**: http://localhost:5900
- **Swagger Docs**: http://localhost:5900/api/v1/docs
- **Health Check**: http://localhost:5900/api/v1/

## 🔧 Detailed Setup

### Local Development Setup

#### Step 1: Environment Configuration

```bash
# Create environment file
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=splitbuddy

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration (optional for local)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Google OAuth (optional for local)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application Configuration
PORT=5900
NODE_ENV=development
EOF
```

#### Step 2: Database Setup

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name postgres-splitbuddy \
  -e POSTGRES_DB=splitbuddy \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Wait for database to be ready
sleep 10

# Run migrations
npm run migration:run
```

#### Step 3: Start Application

```bash
# Development mode
npm run start:dev

# Or with Docker Compose
docker-compose -f docker-compose.local.yml up -d
```

### Production Deployment Setup

#### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Step 2: Database Setup

```bash
# Create database user
sudo -u postgres psql -c "CREATE USER splitbuddy WITH PASSWORD 'your-secure-password';"
sudo -u postgres psql -c "CREATE DATABASE splitbuddy OWNER splitbuddy;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE splitbuddy TO splitbuddy;"
```

#### Step 3: Application Deployment

```bash
# Clone repository
git clone <repository-url> /opt/splitbuddy
cd /opt/splitbuddy

# Install dependencies
npm install --production

# Build application
npm run build

# Setup environment
cp .env.example .env
# Edit .env with production values

# Run migrations
npm run migration:run

# Start with PM2
pm2 start dist/main.js --name splitbuddy
pm2 save
pm2 startup
```

## 🗄️ Database Setup

### Schema Overview

The application uses the following main entities:

- **Users**: Authentication and profile management
- **Groups**: Expense sharing groups
- **Expenses**: Financial transactions
- **Categories**: Expense categorization
- **Payment Methods**: Payment tracking
- **Splits**: Expense sharing logic
- **Notifications**: User notifications

### Migration Process

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Seed Data

```bash
# Create default categories
npm run seed:categories

# Create default payment methods
npm run seed:payment-methods

# Create test users
npm run seed:users
```

## ⚙️ Environment Configuration

### Required Environment Variables

#### Database

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=splitbuddy
```

#### JWT Authentication

```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

#### Redis (for queues)

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Email (optional)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Google OAuth (optional)

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Environment-Specific Configurations

#### Development

```env
NODE_ENV=development
PORT=5900
LOG_LEVEL=debug
```

#### Production

```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Integration Tests

```bash
# Run e2e tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- --testNamePattern="Auth"
```

### API Testing

```bash
# Test health endpoint
curl http://localhost:5900/api/v1/

# Test database connection
curl http://localhost:5900/api/v1/db-test

# Test Swagger documentation
curl http://localhost:5900/api/v1/docs
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U postgres -d splitbuddy
```

#### Port Conflicts

```bash
# Check what's using port 5900
sudo lsof -i :5900

# Kill process using port
sudo kill -9 <PID>
```

#### Docker Issues

```bash
# Check Docker status
docker ps

# Restart Docker
sudo systemctl restart docker

# Clean up containers
docker system prune -a
```

#### Memory Issues

```bash
# Check memory usage
free -h

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

### Log Analysis

```bash
# View application logs
pm2 logs splitbuddy

# View specific log file
tail -f logs/application.log

# View error logs
grep ERROR logs/application.log
```

## 📁 What Gets Created

### Directories

```
splitbuddy-backend/
├── src/                    # Source code
├── dist/                   # Compiled code
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── test/                   # Test files
├── logs/                   # Application logs
└── uploads/                # File uploads
```

### Database Tables

- `users` - User accounts
- `user_groups` - Groups
- `expenses` - Financial transactions
- `categories` - Expense categories
- `payment_methods` - Payment tracking
- `expense_splits` - Expense sharing
- `notifications` - User notifications
- `transactions` - Financial records

### Configuration Files

- `.env` - Environment variables
- `docker-compose.yml` - Docker configuration
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript configuration
- `nest-cli.json` - NestJS configuration

## ⚡ Quick Reference Commands

### Development

```bash
# Start development server
npm run start:dev

# Start with Docker
docker-compose -f docker-compose.local.yml up -d

# Run tests
npm run test

# Build application
npm run build
```

### Database

```bash
# Run migrations
npm run migration:run

# Generate migration
npm run migration:generate -- -n MigrationName

# Revert migration
npm run migration:revert
```

### Production

```bash
# Start with PM2
pm2 start dist/main.js --name splitbuddy

# Restart application
pm2 restart splitbuddy

# View logs
pm2 logs splitbuddy

# Monitor resources
pm2 monit
```

### Docker

```bash
# Build image
docker build -t splitbuddy .

# Run container
docker run -p 5900:5900 splitbuddy

# View logs
docker logs <container-id>

# Stop containers
docker-compose down
```

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT
- Rotate secrets regularly
- Use environment-specific configurations

### Database Security

- Use strong passwords for database users
- Limit database access to application only
- Enable SSL for database connections
- Regular database backups

### API Security

- All business logic endpoints require authentication
- Use HTTPS in production
- Implement rate limiting
- Validate all input data

### File Uploads

- Validate file types and sizes
- Store files outside web root
- Use secure file naming
- Implement virus scanning

## 📊 Monitoring

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

### Log Monitoring

```bash
# Application logs
tail -f logs/application.log

# Error logs
grep ERROR logs/application.log

# Access logs
tail -f /var/log/nginx/access.log
```

### Database Monitoring

```bash
# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('splitbuddy'));"

# Check table sizes
psql -c "SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name)) FROM information_schema.tables WHERE table_schema = 'public';"
```

## 🎯 Next Steps

### Immediate Actions

1. **Test all endpoints** using Swagger documentation
2. **Verify authentication** works correctly
3. **Test database operations** with sample data
4. **Configure email notifications** (if needed)
5. **Set up monitoring** and alerting

### Future Enhancements

1. **Add more test coverage**
2. **Implement caching** for better performance
3. **Add file upload** functionality
4. **Implement real-time** notifications
5. **Add analytics** and reporting
6. **Optimize database** queries
7. **Add API rate limiting**
8. **Implement backup** strategies

### Maintenance Tasks

1. **Regular security updates**
2. **Database maintenance**
3. **Log rotation**
4. **Performance monitoring**
5. **Backup verification**

---

## 📞 Support

For additional support:

- Check the [Troubleshooting Guide](../TROUBLESHOOTING.md)
- Review [Security Best Practices](../SECURITY.md)
- Consult the [API Documentation](../README.md)

**Happy coding! 🚀**
