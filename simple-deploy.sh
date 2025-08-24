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

# Setup environment file
setup_env() {
    if [ ! -f ".env" ]; then
        print_status "Creating environment file..."
        if [ -f "env.prod.config" ]; then
            cp env.prod.config .env
            print_success "Environment file created from template"
        else
            print_error "No environment template found. Please create .env file manually."
            exit 1
        fi
    else
        print_success "Environment file already exists"
    fi
}

# Generate secure JWT secret
generate_jwt_secret() {
    openssl rand -base64 32
}

# Update JWT secret if needed
update_jwt_secret() {
    if grep -q "CHANGE-THIS-TO-SECURE-RANDOM-STRING" .env; then
        print_status "Generating secure JWT secret..."
        NEW_SECRET=$(generate_jwt_secret)
        sed -i "s/CHANGE-THIS-TO-SECURE-RANDOM-STRING/$NEW_SECRET/" .env
        print_success "JWT secret updated"
    fi
}

# Build and deploy
deploy() {
    print_status "Building and deploying application..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Build and start
    docker-compose -f docker-compose.prod.yml up --build -d
    
    # Wait for services
    print_status "Waiting for services to start..."
    sleep 30
    
    # Run migrations
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run || true
    
    # Create default data
    print_status "Creating default data..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run create-default-data || true
    
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
    docker-compose -f docker-compose.prod.yml restart
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
    echo "  1. Copy env.prod.config to .env"
    echo "  2. Edit .env with your settings"
    echo "  3. Run: $0 deploy"
}

# Main script
case "${1:-deploy}" in
    "deploy")
        check_docker
        setup_env
        update_jwt_secret
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
