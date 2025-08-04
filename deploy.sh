#!/bin/bash
# SplitBuddy Backend Deployment Script
# Supports local development and production deployment on Linux VPS
# Uses Docker for local development and PM2 for production

set -e

# Parse command line arguments
SKIP_INSTALL=false
USE_GITHUB_ENV=false
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-install|-s)
            SKIP_INSTALL=true
            shift
            ;;
        --github|-g)
            USE_GITHUB_ENV=true
            shift
            ;;
        --help|-h)
            COMMAND="help"
            shift
            ;;
        *)
            COMMAND="$1"
            shift
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_status() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running or you don't have permission to access Docker."
        print_status "Try these solutions:"
        print_status "1. Start Docker: sudo systemctl start docker"
        print_status "2. Add user to docker group: sudo usermod -aG docker \$USER"
        print_status "3. Logout and login again, or run: newgrp docker"
        print_status "4. Or run with sudo: sudo ./deploy.sh production -s"
        exit 1
    fi
    print_success "Docker is running"
}

check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
}

check_production_env() {
    print_status "Checking production environment..."

    if [ ! -f ".env.production" ] && [ ! -f ".env" ]; then
        print_error "No environment file found. Please run setup-production-env.sh first."
        print_status "Run: ./setup-production-env.sh"
        exit 1
    fi

    if [ -f ".env.production" ]; then
        print_success "Production environment file found: .env.production"
    else
        print_warning "Using existing .env file for production"
    fi
}

fetch_env_from_github() {
    print_status "Fetching environment variables from GitHub..."

    # Check if GitHub token is available
    if [ -z "$GITHUB_TOKEN" ]; then
        print_error "GITHUB_TOKEN environment variable is required for fetching secrets"
        print_status "Set GITHUB_TOKEN with your GitHub personal access token"
        exit 1
    fi

    # Fetch environment variables from GitHub repository secrets
    # This requires GitHub Actions or a script to fetch secrets
    if command -v gh &> /dev/null; then
        print_status "Using GitHub CLI to fetch secrets..."
        # Fetch secrets from GitHub repository
        gh secret list --repo "$GITHUB_REPO" --json name,value | jq -r '.[] | "\(.name)=\(.value)"' > .env.production
        print_success "Environment variables fetched from GitHub secrets"
    else
        print_warning "GitHub CLI not found. Using fallback method..."
        # Alternative: Fetch from a private repository file
        curl -H "Authorization: token $GITHUB_TOKEN" \
             -H "Accept: application/vnd.github.v3.raw" \
             "https://api.github.com/repos/$GITHUB_REPO/contents/.env.production" \
             | jq -r '.content' | base64 -d > .env.production
        print_success "Environment variables fetched from GitHub repository"
    fi
}

install_dependencies() {
    if [ "$SKIP_INSTALL" = true ]; then
        print_warning "Skipping dependency installation (--skip-install flag used)"
        return 0
    fi

    print_status "Installing dependencies..."

    # Clean install to ensure consistency
    rm -rf node_modules package-lock.json
    npm install

    print_success "Dependencies installed successfully!"
}

start_local() {
    print_status "Starting local development environment..."
    check_docker
    check_node

    print_status "Stopping existing containers..."
    npm run docker:down 2>/dev/null || true

    print_status "Starting services with Docker Compose..."
    npm run docker:dev

    print_status "Waiting for services to be ready..."
    sleep 10

    # Run migrations inside Docker container
    print_status "Running database migrations..."
    docker exec splitbuddy_backend npm run migration:run

    # Create default data inside Docker container
    print_status "Creating default data..."
    docker exec splitbuddy_backend npm run create-default-data

    print_success "Local development environment started successfully!"
    print_status "Application is running at: http://localhost:5900"
    print_status "API Documentation: http://localhost:5900/api/docs"
    print_status "Database test: http://localhost:5900/api/v1/db-test"
    print_status "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

stop_local() {
    print_status "Stopping local development environment..."
    npm run docker:down
    print_success "Local development environment stopped!"
}

build_production() {
    print_status "Building production application..."
    check_node

    # Setup production environment for build
    if [ -f ".env.production" ] && [ ! -f ".env" ]; then
        print_status "Setting up production environment for build..."
        cp .env.production .env
    fi

    # Install dependencies first
    install_dependencies

    print_status "Building application..."
    npm run build

    print_success "Production build completed!"
}

deploy_production() {
    print_status "Deploying to production..."
    check_node
    check_docker
    check_production_env

    # Check if migration files are committed
    print_status "Checking for uncommitted migration files..."
    UNCOMMITTED_MIGRATIONS=$(git status --porcelain | grep "src/migrations/" | wc -l)
    if [ "$UNCOMMITTED_MIGRATIONS" -gt 0 ]; then
        print_warning "Found uncommitted migration files:"
        git status --porcelain | grep "src/migrations/"
        print_status "Please commit and push migration files before deployment"
        print_status "Run: git add src/migrations/ && git commit -m 'Add migrations' && git push"
        exit 1
    fi

    # Setup production environment for local Docker deployment
    print_status "Setting up local production environment..."
    if [ "$USE_GITHUB_ENV" = true ]; then
        fetch_env_from_github
        # Map GitHub secrets for local Docker deployment
        print_status "Mapping GitHub secrets for local Docker deployment..."

        # Read current values from .env file
        if [ -f ".env" ]; then
            # Extract database credentials from GitHub secrets
            DB_USERNAME_FROM_GITHUB=$(grep "^DB_USERNAME=" .env | cut -d'=' -f2)
            DB_PASSWORD_FROM_GITHUB=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)
            DB_DATABASE_FROM_GITHUB=$(grep "^DB_DATABASE=" .env | cut -d'=' -f2)

            # Override only the connection details for local Docker
            sed -i 's/^DB_HOST=.*/DB_HOST=postgres/' .env
            sed -i 's/^DB_PORT=.*/DB_PORT=5432/' .env
            sed -i 's/^REDIS_HOST=.*/REDIS_HOST=redis/' .env
            sed -i 's/^REDIS_PORT=.*/REDIS_PORT=6379/' .env

            # Keep the database credentials from GitHub secrets
            if [ -n "$DB_USERNAME_FROM_GITHUB" ]; then
                sed -i "s/^DB_USERNAME=.*/DB_USERNAME=$DB_USERNAME_FROM_GITHUB/" .env
            fi
            if [ -n "$DB_PASSWORD_FROM_GITHUB" ]; then
                sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD_FROM_GITHUB/" .env
            fi
            if [ -n "$DB_DATABASE_FROM_GITHUB" ]; then
                sed -i "s/^DB_DATABASE=.*/DB_DATABASE=$DB_DATABASE_FROM_GITHUB/" .env
            fi

            print_success "GitHub secrets mapped for local Docker deployment"
        fi
    elif [ -f ".env.production" ]; then
        cp .env.production .env
        print_success "Production environment file copied"
    else
        # Create local environment for Docker deployment
        print_status "Creating local environment for Docker deployment..."
        cat > .env << EOF
# SplitBuddy Backend Local Production Environment
# Using Docker Compose for local deployment

# ========================================
# DATABASE CONFIGURATION (Local Docker)
# ========================================
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_prod
DB_PASSWORD=SplitBuddy2024!Secure
DB_DATABASE=splitbuddy_prod

# ========================================
# REDIS CONFIGURATION (Local Docker)
# ========================================
REDIS_HOST=redis
REDIS_PORT=6379

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=iv570SrW+9fhKVvRrgW2cjiPXg7e+vR9dJ5xbJ1W4Ww=

# ========================================
# SMTP CONFIGURATION
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alnlabs1@gmail.com
SMTP_PASS=mszo jwpz srgu uhwh
SMTP_FROM=alnlabs1@gmail.com

# ========================================
# GOOGLE OAUTH CONFIGURATION
# ========================================
GOOGLE_CLIENT_ID=1039447696099-ftbfa65lep53cm928a862bl6m2e9gaq9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback

# ========================================
# APP CONFIGURATION
# ========================================
APP_PORT=5900
PORT=5900
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000

# ========================================
# QUEUE CONFIGURATION
# ========================================
EMAIL_QUEUE_NAME=email-queue
NOTIFICATION_QUEUE_NAME=notification-queue
EOF
        print_success "Local environment file created"
    fi

    # Build the application
    build_production

    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Start with Docker Compose
    print_status "Starting production with Docker Compose..."
    if [ "$SKIP_INSTALL" = true ]; then
        print_status "Building with skip-install flag..."
        export SKIP_INSTALL=true
        docker-compose -f docker-compose.prod.yml build --build-arg SKIP_INSTALL=true
        docker-compose -f docker-compose.prod.yml up -d
    else
        export SKIP_INSTALL=false
        docker-compose -f docker-compose.prod.yml up --build -d
    fi

    # Wait for services to be ready with retry logic
    print_status "Waiting for services to be ready..."
    MAX_RETRIES=10
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            print_success "All containers are running!"
            break
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            print_warning "Waiting for containers... (attempt $RETRY_COUNT/$MAX_RETRIES)"
            sleep 10
        fi
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        print_error "Containers failed to start after $MAX_RETRIES attempts"
        print_status "Container logs:"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi

    # Wait additional time for database to be fully ready
    print_status "Waiting for database to be fully ready..."
    sleep 15

    # Ensure migration files are available in the container
    print_status "Ensuring migration files are available..."
    docker-compose -f docker-compose.prod.yml exec app ls -la src/migrations/ || {
        print_warning "Migration directory not accessible, copying files..."
        docker-compose -f docker-compose.prod.yml cp src/migrations app:/app/src/migrations
    }

    # Check if app container is ready
    print_status "Checking if app container is ready..."
    APP_RETRY_COUNT=0
    MAX_APP_RETRIES=10

    while [ $APP_RETRY_COUNT -lt $MAX_APP_RETRIES ]; do
        if docker-compose -f docker-compose.prod.yml exec app ps aux > /dev/null 2>&1; then
            print_success "App container is ready!"
            break
        else
            APP_RETRY_COUNT=$((APP_RETRY_COUNT + 1))
            print_warning "App container not ready (attempt $APP_RETRY_COUNT/$MAX_APP_RETRIES)"

            if [ $APP_RETRY_COUNT -eq $MAX_APP_RETRIES ]; then
                print_error "App container failed to start after $MAX_APP_RETRIES attempts"
                print_status "App logs:"
                docker-compose -f docker-compose.prod.yml logs app
                exit 1
            fi

            print_status "Waiting for app container in 5 seconds..."
            sleep 5
        fi
    done

        # Debug: Check environment variables in app container
    print_status "Checking environment variables in app container..."
    docker-compose -f docker-compose.prod.yml exec app printenv | grep -E "(DB_|REDIS_|JWT_|NODE_ENV)" || print_warning "Could not check environment variables"

    # Test basic database connectivity
    print_status "Testing basic database connectivity..."
    docker-compose -f docker-compose.prod.yml exec app sh -c "echo 'Testing connection to postgres:5432...' && nc -z postgres 5432 && echo 'Port 5432 is reachable' || echo 'Port 5432 is not reachable'"

    # Check database connection with retry logic
    print_status "Checking database connection..."
    DB_RETRY_COUNT=0
    MAX_DB_RETRIES=10

    while [ $DB_RETRY_COUNT -lt $MAX_DB_RETRIES ]; do
        # First check if postgres container is ready
        print_status "Checking if PostgreSQL container is ready..."
        if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U splitbuddy_user_prod > /dev/null 2>&1; then
            print_success "PostgreSQL container is ready!"
            
            # Now test the app's connection to postgres
            if docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run > /dev/null 2>&1; then
                print_success "Database connection successful!"
                break
            else
                print_warning "App cannot connect to database (attempt $((DB_RETRY_COUNT + 1))/$MAX_DB_RETRIES)"
            fi
        else
            print_warning "PostgreSQL container not ready (attempt $((DB_RETRY_COUNT + 1))/$MAX_DB_RETRIES)"
        fi
        
        DB_RETRY_COUNT=$((DB_RETRY_COUNT + 1))

        if [ $DB_RETRY_COUNT -eq $MAX_DB_RETRIES ]; then
            print_error "Database connection failed after $MAX_DB_RETRIES attempts"
            print_status "PostgreSQL logs:"
            docker-compose -f docker-compose.prod.yml logs postgres | tail -20
            print_status "App logs:"
            docker-compose -f docker-compose.prod.yml logs app | tail -20
            print_status "Network connectivity test:"
            docker-compose -f docker-compose.prod.yml exec app ping -c 3 postgres || print_warning "Cannot ping postgres"
            print_status "Port connectivity test:"
            docker-compose -f docker-compose.prod.yml exec app sh -c "timeout 5 bash -c '</dev/tcp/postgres/5432' && echo 'Port 5432 is reachable' || echo 'Port 5432 is not reachable'" || print_warning "Port test failed"
            exit 1
        fi

        print_status "Retrying database connection in 15 seconds..."
        sleep 15
    done

    # Check if migrations exist
    print_status "Checking for migration files..."
    MIGRATION_COUNT=$(docker-compose -f docker-compose.prod.yml exec app find src/migrations -name "*.ts" | wc -l)
    if [ "$MIGRATION_COUNT" -eq 0 ]; then
        print_warning "No migration files found in src/migrations/"
        print_status "Available files in migrations directory:"
        docker-compose -f docker-compose.prod.yml exec app ls -la src/migrations/ || true
    else
        print_success "Found $MIGRATION_COUNT migration files"
    fi

    # Check database connection first
    print_status "Testing database connection..."
    if ! docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run > /dev/null 2>&1; then
        print_error "Cannot connect to database"
        print_status "Please ensure database is running and accessible"
        exit 1
    fi

    # Show pending migrations
    print_status "Checking pending migrations..."
    PENDING_MIGRATIONS=$(docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null | grep -c "pending" || echo "0")
    print_status "Found $PENDING_MIGRATIONS pending migrations"

    if [ "$PENDING_MIGRATIONS" -eq "0" ]; then
        print_success "No pending migrations found"
    else
        # Run migrations inside Docker container with retry logic
        print_status "Running database migrations..."
        MIGRATION_RETRY_COUNT=0
        MAX_MIGRATION_RETRIES=5

        while [ $MIGRATION_RETRY_COUNT -lt $MAX_MIGRATION_RETRIES ]; do
            print_status "Running migrations (attempt $((MIGRATION_RETRY_COUNT + 1))/$MAX_MIGRATION_RETRIES)..."

            if docker-compose -f docker-compose.prod.yml exec app npm run migration:run; then
                print_success "Database migrations completed successfully!"

                # Verify migrations were applied
                print_status "Verifying migrations were applied..."
                REMAINING_MIGRATIONS=$(docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null | grep -c "pending" || echo "0")

                if [ "$REMAINING_MIGRATIONS" -eq "0" ]; then
                    print_success "All migrations verified successfully!"
                    break
                else
                    print_warning "Some migrations may not have been applied properly"
                    print_status "Remaining migrations: $REMAINING_MIGRATIONS"
                fi
            else
                MIGRATION_RETRY_COUNT=$((MIGRATION_RETRY_COUNT + 1))
                print_warning "Migration failed (attempt $MIGRATION_RETRY_COUNT/$MAX_MIGRATION_RETRIES)"

                if [ $MIGRATION_RETRY_COUNT -eq $MAX_MIGRATION_RETRIES ]; then
                    print_error "Migrations failed after $MAX_MIGRATION_RETRIES attempts"
                    print_status "Migration logs:"
                    docker-compose -f docker-compose.prod.yml logs app | tail -50
                    exit 1
                fi

                print_status "Retrying migration in 15 seconds..."
                sleep 15
            fi
        done
    fi

        # Verify migrations were applied
    print_status "Verifying migrations were applied..."
    TABLE_COUNT=$(docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null | grep -c "pending" || echo "0")

    if [ "$TABLE_COUNT" -gt "0" ]; then
        print_warning "Found $TABLE_COUNT pending migrations"
        print_status "Migration status:"
        docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null || true
    else
        print_success "All migrations appear to be applied"
    fi

    # Create default data inside Docker container
    print_status "Creating default data..."
    if docker-compose -f docker-compose.prod.yml exec app npm run create-default-data; then
        print_success "Default data created successfully!"
    else
        print_warning "Default data creation failed (this is not critical)"
        print_status "Default data logs:"
        docker-compose -f docker-compose.prod.yml logs app | tail -20
    fi

    print_success "Production deployment completed!"
    print_status "Application is running with Docker Compose"
    print_status "Check status: docker-compose -f docker-compose.prod.yml ps"
    print_status "View logs: docker-compose -f docker-compose.prod.yml logs -f"
}

restart_production() {
    print_status "Restarting production application..."
    check_docker

    docker-compose -f docker-compose.prod.yml restart
    print_success "Production application restarted!"
}

show_status() {
    print_status "Checking application status..."

    # Check if containers are running (local)
    if docker ps | grep -q splitbuddy_backend; then
        print_success "Local containers are running"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_warning "Local containers are not running"
    fi

    # Check if production containers are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Production containers are running"
        docker-compose -f docker-compose.prod.yml ps
    else
        print_warning "Production containers are not running"
    fi
}

check_migrations() {
    print_status "Checking migration status..."

    # Check if containers are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_error "Production containers are not running"
        print_status "Start containers first: $0 production"
        return 1
    fi

        # Check database connection with retry logic
    print_status "Testing database connection..."
    DB_RETRY_COUNT=0
    MAX_DB_RETRIES=5

    while [ $DB_RETRY_COUNT -lt $MAX_DB_RETRIES ]; do
        if docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run > /dev/null 2>&1; then
            print_success "Database connection successful!"
            break
        else
            DB_RETRY_COUNT=$((DB_RETRY_COUNT + 1))
            print_warning "Database connection failed (attempt $DB_RETRY_COUNT/$MAX_DB_RETRIES)"

            if [ $DB_RETRY_COUNT -eq $MAX_DB_RETRIES ]; then
                print_error "Database connection failed after $MAX_DB_RETRIES attempts"
                print_status "Database logs:"
                docker-compose -f docker-compose.prod.yml logs postgres
                return 1
            fi

            print_status "Retrying database connection in 5 seconds..."
            sleep 5
        fi
    done

    # Check migration files
    print_status "Checking migration files..."
    MIGRATION_FILES=$(docker-compose -f docker-compose.prod.yml exec app find src/migrations -name "*.ts" 2>/dev/null | wc -l)
    print_status "Found $MIGRATION_FILES migration files"

    # List migration files
    print_status "Migration files:"
    docker-compose -f docker-compose.prod.yml exec app ls -la src/migrations/ 2>/dev/null || print_warning "Could not list migration files"

        # Check migration status
    print_status "Checking migration status..."
    PENDING_MIGRATIONS=$(docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null | grep -c "pending" || echo "0")

    if [ "$PENDING_MIGRATIONS" -eq "0" ]; then
        print_success "All migrations are applied"
    else
        print_warning "Found $PENDING_MIGRATIONS pending migrations"
        print_status "Pending migrations:"
        docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null || true
    fi
}

run_migrations() {
    print_status "Running database migrations..."

    # Check if containers are running
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_error "Production containers are not running"
        print_status "Start containers first: $0 production"
        return 1
    fi

    # Check database connection first
    print_status "Testing database connection..."
    if ! docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run > /dev/null 2>&1; then
        print_error "Cannot connect to database"
        print_status "Please ensure database is running and accessible"
        return 1
    fi

    # Show pending migrations
    print_status "Checking pending migrations..."
    PENDING_MIGRATIONS=$(docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null | grep -c "pending" || echo "0")
    print_status "Found $PENDING_MIGRATIONS pending migrations"

    if [ "$PENDING_MIGRATIONS" -eq "0" ]; then
        print_success "No pending migrations found"
        return 0
    fi

    # Run migrations with retry logic
    MIGRATION_RETRY_COUNT=0
    MAX_MIGRATION_RETRIES=5

    while [ $MIGRATION_RETRY_COUNT -lt $MAX_MIGRATION_RETRIES ]; do
        print_status "Running migrations (attempt $((MIGRATION_RETRY_COUNT + 1))/$MAX_MIGRATION_RETRIES)..."

        if docker-compose -f docker-compose.prod.yml exec app npm run migration:run; then
            print_success "Database migrations completed successfully!"

            # Verify migrations were applied
            print_status "Verifying migrations were applied..."
            REMAINING_MIGRATIONS=$(docker-compose -f docker-compose.prod.yml exec app npm run migration:run --dry-run 2>/dev/null | grep -c "pending" || echo "0")

            if [ "$REMAINING_MIGRATIONS" -eq "0" ]; then
                print_success "All migrations verified successfully!"
                return 0
            else
                print_warning "Some migrations may not have been applied properly"
                print_status "Remaining migrations: $REMAINING_MIGRATIONS"
            fi
        else
            MIGRATION_RETRY_COUNT=$((MIGRATION_RETRY_COUNT + 1))
            print_warning "Migration failed (attempt $MIGRATION_RETRY_COUNT/$MAX_MIGRATION_RETRIES)"

            if [ $MIGRATION_RETRY_COUNT -eq $MAX_MIGRATION_RETRIES ]; then
                print_error "Migrations failed after $MAX_MIGRATION_RETRIES attempts"
                print_status "Migration logs:"
                docker-compose -f docker-compose.prod.yml logs app | tail -50
                return 1
            fi

            print_status "Retrying migration in 15 seconds..."
            sleep 15
        fi
    done
}

show_help() {
    echo "SplitBuddy Backend Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  local-start, local    Start local development environment with Docker"
    echo "  local-stop, stop      Stop local development environment"
    echo "  build                 Build production application"
    echo "  deploy, production, prod  Deploy to production with Docker Compose"
    echo "  restart               Restart production application"
    echo "  status                Show application status"
    echo "  check-migrations      Check database migration status"
    echo "  run-migrations        Run database migrations manually"
    echo "  help, --help, -h      Show this help message"
    echo ""
    echo "Options:"
    echo "  --skip-install, -s    Skip dependency installation (use existing node_modules)"
    echo "  --github, -g          Fetch environment variables from GitHub secrets"
    echo ""
    echo "Examples:"
    echo "  $0 local-start        # Start local development"
    echo "  $0 local              # Start local development (alias)"
    echo "  $0 deploy             # Deploy to production"
    echo "  $0 production         # Deploy to production (alias)"
    echo "  $0 prod               # Deploy to production (alias)"
    echo "  $0 deploy --skip-install  # Deploy without reinstalling dependencies"
    echo "  $0 deploy -s          # Deploy without reinstalling dependencies (short)"
    echo "  $0 deploy --github    # Deploy with environment from GitHub secrets"
    echo "  $0 deploy -g          # Deploy with environment from GitHub (short)"
    echo "  $0 status             # Check application status"
    echo "  $0 check-migrations   # Check migration status"
    echo "  $0 run-migrations     # Run migrations manually"
}

# Main script logic
case "${COMMAND:-help}" in
    "local-start"|"local")
        start_local
        ;;
    "local-stop"|"stop")
        stop_local
        ;;
    "build")
        build_production
        ;;
    "deploy"|"production"|"prod")
        deploy_production
        ;;
    "restart")
        restart_production
        ;;
    "status")
        show_status
        ;;
    "check-migrations")
        check_migrations
        ;;
    "run-migrations")
        run_migrations
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac