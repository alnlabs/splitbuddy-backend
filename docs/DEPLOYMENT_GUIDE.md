# SplitBuddy Backend Deployment Guide

This guide covers all deployment options for the SplitBuddy backend, from local development to production deployment with GitHub secrets integration.

## Table of Contents

1. [Overview](#overview)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [GitHub Secrets Integration](#github-secrets-integration)
5. [Environment Management](#environment-management)
6. [Docker Configuration](#docker-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The SplitBuddy backend supports multiple deployment strategies:

- **Local Development**: Docker Compose with hot reload
- **Production Docker**: Containerized deployment with local services
- **GitHub Secrets**: Secure environment variable management
- **Manual Setup**: Traditional environment file approach

---

## Local Development

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd splitbuddy-backend

# Install dependencies
npm install

# Start local development
./deploy.sh local-start

# Access the application
# - API: http://localhost:5900
# - Docs: http://localhost:5900/api/docs
# - Health: http://localhost:5900/api/v1/db-test
```

### Local Development Commands

```bash
# Start development environment
./deploy.sh local-start
./deploy.sh local          # Alias

# Stop development environment
./deploy.sh local-stop
./deploy.sh stop           # Alias

# Check status
./deploy.sh status
```

### What Gets Started

The local development environment includes:

- **Backend Application**: NestJS server with hot reload
- **PostgreSQL Database**: Local database with sample data
- **Redis Cache**: For session and queue management
- **Network**: Isolated Docker network for services

### Local Environment Variables

```yaml
# docker-compose.local.yml
services:
  postgres:
    environment:
      POSTGRES_USER: splitbuddy_user_local
      POSTGRES_PASSWORD: ngSystems@2019
      POSTGRES_DB: splitbuddy_db_local
  
  backend:
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: splitbuddy_user_local
      DB_PASSWORD: ngSystems@2019
      DB_DATABASE: splitbuddy_db_local
      REDIS_HOST: redis
      REDIS_PORT: 6379
      NODE_ENV: local
```

---

## Production Deployment

### Option 1: Local Docker Deployment (Default)

Uses Docker Compose with local PostgreSQL and Redis for production-like environment.

```bash
# Deploy to production
./deploy.sh production
./deploy.sh deploy          # Alias
./deploy.sh prod            # Alias

# Fast deployment (skip dependency installation)
./deploy.sh production -s

# Check status
./deploy.sh status
```

### Option 2: GitHub Secrets Integration (Recommended)

Store environment variables securely in GitHub repository secrets.

#### Prerequisites

1. **Install GitHub CLI**
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   ```

2. **Authenticate with GitHub**
   ```bash
   gh auth login
   ```

3. **Set Repository**
   ```bash
   export GITHUB_REPO="your-username/splitbuddy-backend"
   ```

#### Setup GitHub Secrets

```bash
# Run the interactive setup script
./scripts/setup-github-secrets.sh

# This will:
# 1. Read your .env.production file
# 2. Create GitHub repository secrets
# 3. Store all environment variables securely
```

#### Deploy with GitHub Secrets

```bash
# Set GitHub token
export GITHUB_TOKEN="your-personal-access-token"

# Deploy with GitHub secrets
./deploy.sh production -g

# Fast deployment with GitHub secrets
./deploy.sh production -s -g
```

### Option 3: Manual Environment Setup

Create your own environment file for production.

```bash
# Run interactive setup
./setup-production-env.sh

# Deploy with custom environment
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

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `splitbuddy_user_prod` |
| `DB_PASSWORD` | Database password | `your-secure-password` |
| `DB_DATABASE` | Database name | `splitbuddy_prod` |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | `your-app-password` |
| `SMTP_FROM` | From email address | `your-email@gmail.com` |
| `REDIS_HOST` | Redis host | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `APP_PORT` | Application port | `5900` |
| `NODE_ENV` | Environment | `production` |

### Managing Secrets

```bash
# List existing secrets
gh secret list --repo "$GITHUB_REPO"

# Update a secret
echo "new-value" | gh secret set SECRET_NAME --repo "$GITHUB_REPO"

# Delete a secret
gh secret delete SECRET_NAME --repo "$GITHUB_REPO"
```

---

## Environment Management

### Environment Files

The deployment script supports multiple environment sources:

1. **`.env.production`** - Production environment file
2. **GitHub Secrets** - Secure cloud storage
3. **Local `.env`** - Development environment

### Environment Priority

1. **GitHub Secrets** (if `-g` flag used)
2. **`.env.production`** (if exists)
3. **Local `.env`** (fallback)

### Creating Environment Files

#### Production Environment Template

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_prod
DB_PASSWORD=your-secure-password
DB_DATABASE=splitbuddy_prod

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-jwt-secret

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Application Configuration
APP_PORT=5900
NODE_ENV=production
```

#### Development Environment Template

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_local
DB_PASSWORD=ngSystems@2019
DB_DATABASE=splitbuddy_db_local

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=iv570SrW+9fhKVvRrgW2cjiPXg7e+vR9dJ5xbJ1W4Ww=

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alnlabs1@gmail.com
SMTP_PASS=mszo jwpz srgu uhwh
SMTP_FROM=alnlabs1@gmail.com

# Application Configuration
APP_PORT=5900
NODE_ENV=local
```

---

## Docker Configuration

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        SKIP_INSTALL: ${SKIP_INSTALL:-false}
    ports:
      - '5900:5900'
    environment:
      - NODE_ENV=production
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_USERNAME=${DB_USERNAME}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=${DB_DATABASE}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - SMTP_FROM=${SMTP_FROM}
      - REDIS_HOST=${REDIS_HOST}
      - REDIS_PORT=${REDIS_PORT}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_DATABASE}
      - POSTGRES_USER=${DB_USERNAME}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./setup_db.sql:/docker-entrypoint-initdb.d/setup_db.sql
    ports:
      - '5432:5432'
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    restart: unless-stopped

volumes:
  postgres_data:
```

### Production Dockerfile

```dockerfile
# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Accept build argument for skipping install
ARG SKIP_INSTALL=false

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps (unless SKIP_INSTALL is true)
RUN if [ "$SKIP_INSTALL" != "true" ]; then npm install --legacy-peer-deps; fi

# Copy the rest of the application code
COPY . .

# Install dependencies if they were skipped (needed for build)
RUN if [ "$SKIP_INSTALL" = "true" ]; then npm install --legacy-peer-deps; fi

# Build the NestJS app
RUN npm run build

# Expose the backend port
EXPOSE 5900

# Start the app in production mode
CMD ["npm", "run", "start:prod"]
```

---

## Deployment Script Commands

### Available Commands

```bash
# Local Development
./deploy.sh local-start    # Start local development
./deploy.sh local-stop     # Stop local development
./deploy.sh local          # Alias for local-start

# Production Deployment
./deploy.sh production     # Deploy to production
./deploy.sh deploy         # Alias for production
./deploy.sh prod           # Alias for production

# Options
./deploy.sh production -s  # Skip dependency installation
./deploy.sh production -g  # Use GitHub secrets
./deploy.sh production -s -g  # Both options

# Management
./deploy.sh restart        # Restart production
./deploy.sh status         # Check application status
./deploy.sh help           # Show help
```

### Command Options

| Option | Long Form | Description |
|--------|-----------|-------------|
| `-s` | `--skip-install` | Skip dependency installation |
| `-g` | `--github` | Use GitHub secrets for environment |
| `-h` | `--help` | Show help information |

### Examples

```bash
# Basic production deployment
./deploy.sh production

# Fast deployment (skip install)
./deploy.sh production -s

# Deploy with GitHub secrets
./deploy.sh production -g

# Fast deployment with GitHub secrets
./deploy.sh production -s -g

# Check application status
./deploy.sh status

# Restart production
./deploy.sh restart
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

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

#### 3. GitHub Secrets Not Working

```bash
# Check authentication
gh auth status

# Check repository access
gh repo view

# Verify token
echo $GITHUB_TOKEN

# Check if repository is set
echo $GITHUB_REPO
```

#### 4. Migration Errors

```bash
# Reset database
docker-compose -f docker-compose.prod.yml down -v
./deploy.sh production

# Check migration status
docker-compose -f docker-compose.prod.yml exec app npm run migration:run
```

#### 5. Docker Build Issues

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Check Docker disk space
docker system df
```

### Logs and Debugging

#### View Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres
docker-compose -f docker-compose.prod.yml logs -f redis

# View local development logs
docker-compose -f docker-compose.local.yml logs -f
```

#### Health Checks

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

# Check container status
docker-compose -f docker-compose.prod.yml ps
```

### Performance Optimization

#### Skip Install for Faster Deployments

```bash
# Use existing node_modules
./deploy.sh production -s

# This skips:
# - npm install
# - Removing node_modules
# - Clean install
```

#### Docker Build Optimization

```dockerfile
# Multi-stage build for smaller images
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 5900
CMD ["npm", "run", "start:prod"]
```

---

## Security Best Practices

### 1. Use GitHub Secrets

- Store all sensitive data in GitHub repository secrets
- Never commit `.env` files to version control
- Use different secrets for different environments

### 2. Strong Passwords

- Generate strong passwords for database users
- Use password managers for secret management
- Rotate passwords regularly

### 3. Network Security

- Use HTTPS in production
- Configure firewall rules
- Restrict database access

### 4. Monitoring

- Monitor application logs
- Set up alerts for errors
- Track resource usage

### 5. Backups

- Regular database backups
- Version control for code
- Document deployment procedures

---

## Next Steps

After successful deployment:

1. **Test API Endpoints** using Swagger documentation
2. **Create Test Users** and verify authentication
3. **Test Notifications** by creating expenses
4. **Monitor Performance** and logs
5. **Set up Monitoring** (optional)
6. **Configure Backup** strategy (optional)
7. **Set up CI/CD** pipeline (optional)

---

For additional support, check the main README.md or create an issue in the repository. 