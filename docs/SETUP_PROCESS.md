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

SplitBuddy uses a **centralized environment configuration** system for easy management of all environment variables.

### 📁 Centralized Configuration

All environment variables are managed in `src/config/env.config.ts`:

```typescript
export const env: EnvironmentConfig = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'splitbuddy_db_local',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
  },

  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:5900/api/v1/auth/google/callback',
  },

  // App Configuration
  app: {
    port: parseInt(process.env.PORT || process.env.APP_PORT || '5900'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Queue Configuration
  queues: {
    email: process.env.EMAIL_QUEUE_NAME || 'email-queue',
    notification: process.env.NOTIFICATION_QUEUE_NAME || 'notification-queue',
  },
};
```

### 🔧 Easy Environment Management

Use the provided script to easily manage environment variables:

```bash
# Show current environment variables
./scripts/update-env.sh show

# Create new .env file from template
./scripts/update-env.sh create

# Update a variable in .env
./scripts/update-env.sh update DB_HOST postgres

# Update a variable in .env.production
./scripts/update-env.sh update-prod JWT_SECRET my-secret-key
```

### 📋 Complete Environment Variables List

| Variable                  | Description                | Default Value                                       |
| ------------------------- | -------------------------- | --------------------------------------------------- |
| `DB_HOST`                 | Database host              | `localhost`                                         |
| `DB_PORT`                 | Database port              | `5432`                                              |
| `DB_USERNAME`             | Database username          | `postgres`                                          |
| `DB_PASSWORD`             | Database password          | `postgres`                                          |
| `DB_DATABASE`             | Database name              | `splitbuddy_db_local`                               |
| `REDIS_HOST`              | Redis host                 | `localhost`                                         |
| `REDIS_PORT`              | Redis port                 | `6379`                                              |
| `JWT_SECRET`              | JWT signing secret         | `fallback-secret-key`                               |
| `SMTP_HOST`               | SMTP server                | `smtp.gmail.com`                                    |
| `SMTP_PORT`               | SMTP port                  | `587`                                               |
| `SMTP_USER`               | SMTP username              | ``                                                  |
| `SMTP_PASS`               | SMTP password              | ``                                                  |
| `SMTP_FROM`               | From email address         | ``                                                  |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID     | ``                                                  |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret | ``                                                  |
| `GOOGLE_CALLBACK_URL`     | Google OAuth callback URL  | `http://localhost:5900/api/v1/auth/google/callback` |
| `APP_PORT`                | Application port           | `5900`                                              |
| `PORT`                    | Alternative port variable  | `5900`                                              |
| `NODE_ENV`                | Environment                | `development`                                       |
| `CORS_ORIGIN`             | CORS allowed origins       | `http://localhost:3000`                             |
| `EMAIL_QUEUE_NAME`        | Email queue name           | `email-queue`                                       |
| `NOTIFICATION_QUEUE_NAME` | Notification queue name    | `notification-queue`                                |

### 🚀 Benefits of Centralized Configuration

1. **Single Source of Truth**: All environment variables are defined in one place
2. **Type Safety**: TypeScript interfaces ensure correct variable types
3. **Easy Updates**: Use the update script to modify variables
4. **Default Values**: Sensible defaults for development
5. **Backward Compatibility**: Individual exports for existing code
6. **Debug Logging**: Built-in environment logging for troubleshooting

### 🔍 Debug Environment Variables

The application automatically logs environment configuration on startup:

```bash
npm start:dev
```

You'll see output like:

```
Environment Configuration:
Database: { host: 'localhost', port: 5432, username: 'postgres', database: 'splitbuddy_db_local', password: '***' }
Redis: { host: 'localhost', port: 6379 }
App: { port: 5900, nodeEnv: 'development', corsOrigin: 'http://localhost:3000' }
SMTP Host: smtp.gmail.com
Google Client ID: ***
Queues: { email: 'email-queue', notification: 'notification-queue' }
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
