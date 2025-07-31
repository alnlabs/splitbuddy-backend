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

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
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

    # Setup production environment for local Docker deployment
    print_status "Setting up local production environment..."
    if [ "$USE_GITHUB_ENV" = true ]; then
        fetch_env_from_github
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
# APP CONFIGURATION
# ========================================
APP_PORT=5900
NODE_ENV=production
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

    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 15

    # Run migrations inside Docker container
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec app npm run migration:run

    # Create default data inside Docker container
    print_status "Creating default data..."
    docker-compose -f docker-compose.prod.yml exec app npm run create-default-data

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
    "help"|"--help"|"-h"|*)
        show_help
        ;;
esac