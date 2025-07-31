# SplitBuddy Backend Setup Process

This document provides a comprehensive guide for setting up the SplitBuddy backend for both local development and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [GitHub Secrets Integration](#github-secrets-integration)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**
- **npm** or **yarn**

### Optional for Production

- **GitHub CLI** (for GitHub secrets integration)
- **Linux VPS** (for production deployment)

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd splitbuddy-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Local Development Environment

```bash
# Start with Docker Compose (recommended)
./deploy.sh local-start

# Or manually
npm run docker:dev
```

### Step 4: Verify Setup

- **API**: http://localhost:5900
- **Documentation**: http://localhost:5900/api/docs
- **Health Check**: http://localhost:5900/api/v1/db-test

---

## Production Deployment

### Option 1: Local Docker Deployment (Default)

```bash
# Deploy to production using local Docker
./deploy.sh production

# Fast deployment (skip dependency installation)
./deploy.sh production -s

# Check status
./deploy.sh status
```

### Option 2: GitHub Secrets Integration (Recommended)

#### Step 1: Install GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Or download from: https://cli.github.com/
```

#### Step 2: Authenticate with GitHub

```bash
gh auth login
```

#### Step 3: Set up GitHub Secrets

```bash
# Set repository name
export GITHUB_REPO="your-username/splitbuddy-backend"

# Run the setup script
./scripts/setup-github-secrets.sh
```

#### Step 4: Deploy with GitHub Secrets

```bash
# Set GitHub token
export GITHUB_TOKEN="your-personal-access-token"

# Deploy with GitHub secrets
./deploy.sh production -g

# Fast deployment with GitHub secrets
./deploy.sh production -s -g
```

### Option 3: Manual Environment Setup

#### Step 1: Create Production Environment

```bash
# Run the interactive setup
./setup-production-env.sh
```

#### Step 2: Deploy

```bash
./deploy.sh production
```

---

## GitHub Secrets Integration

### Benefits

- **Security**: No secrets in code or files
- **Access Control**: Only authorized users can access
- **Audit Trail**: GitHub logs all secret access
- **Easy Rotation**: Update secrets without code changes
- **Team Collaboration**: Share secrets across team

### Setup Process

1. **Install GitHub CLI**

   ```bash
   brew install gh  # macOS
   sudo apt install gh  # Ubuntu
   ```

2. **Authenticate**

   ```bash
   gh auth login
   ```

3. **Set Repository**

   ```bash
   export GITHUB_REPO="your-username/splitbuddy-backend"
   ```

4. **Create Secrets**

   ```bash
   ./scripts/setup-github-secrets.sh
   ```

5. **Deploy**
   ```bash
   export GITHUB_TOKEN="your-token"
   ./deploy.sh production -g
   ```

### Required Secrets

The following environment variables are stored as GitHub secrets:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `JWT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `REDIS_HOST`
- `REDIS_PORT`
- `APP_PORT`
- `NODE_ENV`

---

## Environment Configuration

### Local Development

The local environment uses Docker Compose with predefined settings:

```yaml
# docker-compose.local.yml
services:
  postgres:
    environment:
      POSTGRES_USER: splitbuddy_user_local
      POSTGRES_PASSWORD: ngSystems@2019
      POSTGRES_DB: splitbuddy_db_local
```

### Production Environment

Production uses secure environment variables:

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_prod
DB_PASSWORD=your-secure-password
DB_DATABASE=splitbuddy_prod

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# App
APP_PORT=5900
NODE_ENV=production
```

---

## Database Setup

### Automatic Setup (Recommended)

The deployment script automatically:

1. **Creates Database Users**
   - `splitbuddy_user_local` (development)
   - `splitbuddy_user_prod` (production)

2. **Creates Databases**
   - `splitbuddy_db_local` (development)
   - `splitbuddy_prod` (production)

3. **Runs Migrations**
   - Creates all tables and indexes
   - Sets up foreign key relationships

4. **Creates Default Data**
   - Sample categories and payment methods

### Manual Database Setup

If you need to set up the database manually:

```bash
# Connect to PostgreSQL
psql -h localhost -U postgres

# Create user and database
CREATE USER splitbuddy_user_prod WITH PASSWORD 'your-password';
CREATE DATABASE splitbuddy_prod OWNER splitbuddy_user_prod;
GRANT ALL PRIVILEGES ON DATABASE splitbuddy_prod TO splitbuddy_user_prod;

# Exit psql
\q

# Run migrations
npm run migration:run
```

---

## Deployment Script Commands

### Local Development

```bash
./deploy.sh local-start    # Start local development
./deploy.sh local-stop     # Stop local development
./deploy.sh local          # Alias for local-start
```

### Production Deployment

```bash
./deploy.sh production     # Deploy to production
./deploy.sh deploy         # Alias for production
./deploy.sh prod           # Alias for production
```

### Options

```bash
./deploy.sh production -s  # Skip dependency installation
./deploy.sh production -g  # Use GitHub secrets
./deploy.sh production -s -g  # Both options
```

### Management

```bash
./deploy.sh restart        # Restart production
./deploy.sh status         # Check application status
./deploy.sh help           # Show help
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Stop existing containers
./deploy.sh local-stop
docker-compose -f docker-compose.prod.yml down

# Or kill process using port 5900
sudo lsof -i :5900
sudo kill -9 <PID>
```

#### 2. Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres
```

#### 3. GitHub Secrets Not Working

```bash
# Check authentication
gh auth status

# Check repository access
gh repo view

# Verify token
echo $GITHUB_TOKEN
```

#### 4. Migration Errors

```bash
# Reset database
docker-compose -f docker-compose.prod.yml down -v
./deploy.sh production
```

#### 5. Docker Build Issues

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f app

# View local development logs
docker-compose -f docker-compose.local.yml logs -f
```

### Health Checks

```bash
# Check application health
curl http://localhost:5900/api/v1/db-test

# Check database connection
docker-compose -f docker-compose.prod.yml exec app npm run migration:run

# Check Redis connection
docker-compose -f docker-compose.prod.yml exec app node -e "
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_HOST, process.env.REDIS_PORT);
redis.ping().then(() => console.log('Redis OK')).catch(console.error);
"
```

---

## Security Best Practices

1. **Use GitHub Secrets** for production environment variables
2. **Generate Strong Passwords** for database users
3. **Use HTTPS** in production
4. **Regular Updates** of dependencies
5. **Monitor Logs** for suspicious activity
6. **Backup Database** regularly
7. **Use Firewall** to restrict access

---

## Next Steps

After successful setup:

1. **Test API Endpoints** using the Swagger documentation
2. **Create Test Users** and verify authentication
3. **Test Notifications** by creating expenses
4. **Monitor Performance** and logs
5. **Set up Monitoring** (optional)
6. **Configure Backup** strategy (optional)

---

For additional support, check the main README.md or create an issue in the repository.
