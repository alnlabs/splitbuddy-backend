#!/bin/bash
# SplitBuddy Backend Deployment Script
# Supports local development and production deployment on Linux VPS
# Uses Docker for local development and PM2 for production

set -e

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

install_dependencies() {
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

    # Setup production environment
    print_status "Setting up production environment..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
        print_success "Production environment file copied"
    else
        print_warning "No .env.production file found. Using existing .env file."
        if [ ! -f ".env" ]; then
            print_error "No .env file found. Please run setup-production-env.sh first."
            exit 1
        fi
    fi

    # Build the application
    build_production

    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Start with Docker Compose
    print_status "Starting production with Docker Compose..."
    docker-compose -f docker-compose.prod.yml up --build -d

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
    echo "Usage: $0 [COMMAND]"
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
    echo "Examples:"
    echo "  $0 local-start        # Start local development"
    echo "  $0 local              # Start local development (alias)"
    echo "  $0 deploy             # Deploy to production"
    echo "  $0 production         # Deploy to production (alias)"
    echo "  $0 prod               # Deploy to production (alias)"
    echo "  $0 status             # Check application status"
}

# Main script logic
case "${1:-help}" in
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