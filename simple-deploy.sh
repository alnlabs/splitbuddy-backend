#!/bin/bash
# Simple Deployment Script for SplitBuddy Backend
# Removes complexity and provides straightforward deployment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check Doppler setup
check_doppler() {
    if ! command -v doppler &> /dev/null; then
        print_error "Doppler CLI is not installed. Please install it first."
        print_status "Install: https://cli.doppler.com/"
        exit 1
    fi

    if ! doppler me &> /dev/null; then
        print_error "Not authenticated with Doppler. Please login first."
        print_status "Run: doppler login"
        exit 1
    fi

    print_success "Doppler is configured"
}

# Generate secure JWT secret
generate_jwt_secret() {
    openssl rand -base64 32
}

# Update JWT secret in Doppler if needed
update_jwt_secret() {
    print_status "JWT secret is managed by Doppler - no local updates needed"
}

# Build and deploy
deploy() {
    print_status "Building and deploying application with Doppler..."

    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Build and start with Doppler
    doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml up --build -d

    # Wait for services
    print_status "Waiting for services to start..."
    sleep 30

    # Run migrations
    print_status "Running database migrations..."
    doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run || true

    # Create default data
    print_status "Creating default data..."
    doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run create-default-data || true

    print_success "Deployment completed!"
}

# Check status
status() {
    print_status "Checking application status..."

    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Application is running"
        docker-compose -f docker-compose.prod.yml ps
    else
        print_warning "Application is not running"
    fi
}

# Stop application
stop() {
    print_status "Stopping application..."
    docker-compose -f docker-compose.prod.yml down
    print_success "Application stopped"
}

# Restart application
restart() {
    print_status "Restarting application..."
    doppler run --project=splitbuddy-backend --config=prod -- docker-compose -f docker-compose.prod.yml restart
    print_success "Application restarted"
}

# Show logs
logs() {
    print_status "Showing application logs..."
    docker-compose -f docker-compose.prod.yml logs -f
}

# Test application
test() {
    print_status "Testing application..."

    # Wait a moment for services to be ready
    sleep 5

    # Test database connection
    if curl -f http://localhost:5900/api/v1/db-test >/dev/null 2>&1; then
        print_success "Database connection: OK"
    else
        print_warning "Database connection: Failed"
    fi

    # Test API documentation
    if curl -f http://localhost:5900/api/docs >/dev/null 2>&1; then
        print_success "API documentation: OK"
    else
        print_warning "API documentation: Failed"
    fi

    print_status "Application URLs:"
    echo "  API: http://localhost:5900"
    echo "  Docs: http://localhost:5900/api/docs"
    echo "  Health: http://localhost:5900/api/v1/db-test"
}

# Show help
help() {
    echo "Simple Deployment Script for SplitBuddy Backend"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    Deploy the application (default)"
    echo "  status    Check application status"
    echo "  stop      Stop the application"
    echo "  restart   Restart the application"
    echo "  logs      Show application logs"
    echo "  test      Test application endpoints"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy application"
    echo "  $0 status    # Check status"
    echo "  $0 logs      # View logs"
    echo ""
    echo "Quick Start:"
echo "  1. Set up Doppler with your project and environments"
echo "  2. Configure OAuth settings: ./scripts/update-oauth-configs.sh --env prod"
echo "  3. Run: $0 deploy"
}

# Main script
case "${1:-deploy}" in
    "deploy")
        check_docker
        check_doppler
        deploy
        test
        ;;
    "status")
        status
        ;;
    "stop")
        stop
        ;;
    "restart")
        restart
        ;;
    "logs")
        logs
        ;;
    "test")
        test
        ;;
    "help"|"--help"|"-h")
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
