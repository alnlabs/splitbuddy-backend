#!/bin/bash

# SplitBuddy Backend Deployment Script
# Supports local and production deployments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
}

# Function to check if Node.js is installed
check_node() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
}

# Function to check if npm is installed
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Function to build the application
build_app() {
    print_status "Building the application..."
    npm run build
    print_success "Application built successfully"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    npm run migration:run
    print_success "Migrations completed successfully"
}

# Function to create default data
create_default_data() {
    print_status "Creating default data..."
    npm run create-default-data
    print_success "Default data created successfully"
}

# Function to start local development
start_local() {
    print_status "Starting local development environment..."

    # Check if Docker is running
    check_docker

    # Stop any existing containers
    print_status "Stopping existing containers..."
    npm run docker:down 2>/dev/null || true

    # Start services with Docker Compose
    print_status "Starting services with Docker Compose..."
    npm run docker:dev

    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 10

    # Run migrations
    run_migrations

    # Create default data
    create_default_data

    print_success "Local development environment started successfully!"
    print_status "Application is running at: http://localhost:5900"
    print_status "API Documentation: http://localhost:5900/api/docs"
    print_status "Database test: http://localhost:5900/api/v1/db-test"

    # Show running containers
    print_status "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to stop local development
stop_local() {
    print_status "Stopping local development environment..."
    npm run docker:down
    print_success "Local development environment stopped successfully"
}

# Function to deploy to production
deploy_production() {
    print_status "Starting production deployment..."

    # Check prerequisites
    check_node
    check_npm

    # Install dependencies
    install_dependencies

    # Build the application
    build_app

    # Run migrations
    run_migrations

    # Create default data
    create_default_data

    print_success "Production deployment completed successfully!"
    print_status "To start the application in production mode:"
    print_status "  npm run start:prod"
}

# Function to show help
show_help() {
    echo "SplitBuddy Backend Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local-start    Start local development environment with Docker"
    echo "  local-stop     Stop local development environment"
    echo "  local-restart  Restart local development environment"
    echo "  production     Deploy to production (build + migrate)"
    echo "  build          Build the application"
    echo "  migrate        Run database migrations"
    echo "  default-data   Create default data"
    echo "  test           Test the application"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local-start    # Start local development"
    echo "  $0 production     # Deploy to production"
    echo "  $0 migrate        # Run migrations only"
}

# Function to test the application
test_app() {
    print_status "Testing the application..."

    # Test database connection
    print_status "Testing database connection..."
    if curl -s http://localhost:5900/api/v1/db-test >/dev/null; then
        print_success "Database connection test passed"
    else
        print_error "Database connection test failed"
        return 1
    fi

    # Test health check
    print_status "Testing health check..."
    if curl -s http://localhost:5900/api/v1/ >/dev/null; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        return 1
    fi

    print_success "All tests passed!"
}

# Main script logic
case "${1:-help}" in
    "local-start")
        start_local
        ;;
    "local-stop")
        stop_local
        ;;
    "local-restart")
        stop_local
        sleep 2
        start_local
        ;;
    "production")
        deploy_production
        ;;
    "build")
        build_app
        ;;
    "migrate")
        run_migrations
        ;;
    "default-data")
        create_default_data
        ;;
    "test")
        test_app
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac