# Docker Environments Guide

This guide explains how to use the different Docker environments for SplitBuddy Backend.

## 📋 Available Environments

### 1. **Local Development** (`docker-compose.local.yml`)

- **Purpose**: Day-to-day development work
- **Port**: 5900
- **Database**: PostgreSQL on port 5432
- **Redis**: Port 6379
- **Features**: Hot reloading, development database

### 2. **Production** (`docker-compose.prod.yml`)

- **Purpose**: Production deployment
- **Port**: 5900
- **Database**: PostgreSQL on port 5433 (to avoid conflicts)
- **Redis**: Port 6379
- **Features**: Optimized build, health checks, production settings

### 3. **Test** (`docker-compose.test.yml`)

- **Purpose**: Production-like testing environment
- **Port**: 5901 (different from production)
- **Database**: PostgreSQL on port 5434
- **Redis**: Port 6380
- **Features**: Isolated testing, automated test runner, production-like setup

## 🚀 Quick Start

### Using Docker Manager Script

The easiest way to manage environments is using the Docker manager script:

```bash
# Make executable (first time only)
chmod +x docker-manager.sh

# Start local development environment
./docker-manager.sh local up

# Start test environment
./docker-manager.sh test build

# Start production environment
./docker-manager.sh prod up

# Check status
./docker-manager.sh local status

# View logs
./docker-manager.sh local logs

# Stop environment
./docker-manager.sh local down

# Clean up (removes all data)
./docker-manager.sh local clean

# Test API endpoints
./docker-manager.sh local test-api
```

### Manual Docker Compose Commands

```bash
# Local environment
docker-compose -f docker-compose.local.yml up -d
docker-compose -f docker-compose.local.yml down

# Test environment
docker-compose -f docker-compose.test.yml up --build -d
docker-compose -f docker-compose.test.yml down

# Production environment
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
```

## 🔧 Environment Configuration

### Environment Variables

Each environment uses different configuration:

| Variable    | Local               | Test                | Production            |
| ----------- | ------------------- | ------------------- | --------------------- |
| NODE_ENV    | local               | test                | production            |
| DB_NAME     | splitbuddy_db_local | splitbuddy_test     | splitbuddy_prod       |
| DB_PASSWORD | ngSystems@2019      | SplitBuddy2024!Test | SplitBuddy2024!Secure |
| JWT_SECRET  | Fixed dev key       | Test key            | **MUST BE SECURE**    |
| SMTP\_\*    | Pre-configured      | Empty (testing)     | **MUST BE SET**       |
| GOOGLE\_\*  | Pre-configured      | Empty (testing)     | **MUST BE SET**       |

### Production Setup

For production, create a `.env.prod` file based on `env.prod.template`:

```bash
cp env.prod.template .env.prod
# Edit .env.prod with your actual values
```

**Required for Production:**

- Secure JWT_SECRET
- Valid SMTP credentials
- Google OAuth credentials
- Proper CORS_ORIGIN

## 📊 Port Mapping

| Environment | API Port | DB Port | Redis Port |
| ----------- | -------- | ------- | ---------- |
| Local       | 5900     | 5432    | 6379       |
| Test        | 5901     | 5434    | 6380       |
| Production  | 5900     | 5433    | 6379       |

## 🧪 Testing

### API Health Checks

Each environment includes health checks:

```bash
# Local
curl http://localhost:5900/api/v1/db-test

# Test
curl http://localhost:5901/api/v1/db-test

# Production
curl http://localhost:5900/api/v1/db-test
```

### Swagger Documentation

- **Local**: http://localhost:5900/api/docs
- **Test**: http://localhost:5901/api/docs
- **Production**: http://localhost:5900/api/docs

### Running Tests

The test environment includes an automated test runner:

```bash
# Run tests in test environment
docker-compose -f docker-compose.test.yml --profile testing up test-runner

# Or using the manager
./docker-manager.sh test up
# Then run the test container separately
```

## 🔄 Database Migrations

Each environment has its own database. Run migrations for each:

```bash
# Local environment
docker-compose -f docker-compose.local.yml exec backend npm run migration:run

# Test environment
docker-compose -f docker-compose.test.yml exec backend npm run migration:run

# Production environment
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# Or use the migration script
./deploy-migration.sh
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Stop other services using the same ports
   - Each environment uses different ports to avoid conflicts

2. **Database Connection Issues**
   - Check if PostgreSQL container is healthy
   - Verify environment variables

3. **Build Failures**
   - Clean Docker cache: `docker system prune -a`
   - Rebuild: `./docker-manager.sh [env] build`

### Useful Commands

```bash
# View all containers
docker ps -a

# Check logs
docker logs [container-name]

# Connect to database
docker exec -it splitbuddy_postgres_local psql -U splitbuddy_user_local -d splitbuddy_db_local

# Connect to Redis
docker exec -it splitbuddy_redis_local redis-cli

# Clean up everything
docker system prune -a --volumes
```

## 📁 File Structure

```
├── docker-compose.local.yml     # Local development
├── docker-compose.test.yml      # Testing environment
├── docker-compose.prod.yml      # Production environment
├── docker-manager.sh            # Environment management script
├── Dockerfile                   # Application container
├── env.prod.template           # Production env template
├── debug-db.sh                 # Database debugging
├── deploy-migration.sh         # Migration deployment
└── setup_db.sql                # Database initialization
```

## 🚀 Deployment Workflow

### Development → Test → Production

1. **Development**: Work in local environment

   ```bash
   ./docker-manager.sh local up
   ```

2. **Testing**: Test in production-like environment

   ```bash
   ./docker-manager.sh test build
   ./docker-manager.sh test test-api
   ```

3. **Production**: Deploy to production
   ```bash
   # Set up production environment variables first
   ./docker-manager.sh prod up
   ```

## 🔒 Security Notes

- **Local**: Uses hardcoded credentials for convenience
- **Test**: Uses test credentials, isolated from production
- **Production**: **MUST** use secure credentials and proper configuration

---

**Happy Dockerizing! 🐳**
