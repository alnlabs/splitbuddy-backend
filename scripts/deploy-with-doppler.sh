#!/bin/bash
# Deploy SplitBuddy with Doppler Environment Management
# This script deploys the application using Doppler for environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Default values
PROJECT_NAME="splitbuddy-backend"
ENVIRONMENT="dev"
SKIP_INSTALL=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project|-p)
            PROJECT_NAME="$2"
            shift 2
            ;;
        --env|-e)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --skip-install|-s)
            SKIP_INSTALL=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --project, -p PROJECT_NAME    Project name (default: splitbuddy-backend)"
            echo "  --env, -e ENVIRONMENT         Environment: dev, test, prod (default: dev)"
            echo "  --skip-install, -s            Skip dependency installation"
            echo "  --help, -h                    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --env dev                  # Deploy to development"
            echo "  $0 --env test                 # Deploy to testing"
            echo "  $0 --env prod                 # Deploy to production"
            echo "  $0 --project my-app --env prod # Deploy different project"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|test|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be dev, test, or prod."
    exit 1
fi

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    print_error "Doppler CLI is not installed. Please install it first."
    print_status "Install: https://cli.doppler.com/"
    exit 1
fi

# Check if user is authenticated
if ! doppler me &> /dev/null; then
    print_error "Not authenticated with Doppler. Please login first."
    print_status "Run: doppler login"
    exit 1
fi

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Deploy development environment
deploy_dev() {
    print_status "Deploying to development environment..."

    # Stop existing containers
    docker-compose -f docker-compose.local.yml down 2>/dev/null || true

    # Start with Doppler
    doppler run --project="$PROJECT_NAME" --config=dev -- docker-compose -f docker-compose.local.yml up --build -d

    print_success "Development deployment completed!"
    print_status "Application is running at: http://localhost:5900"
    print_status "API Documentation: http://localhost:5900/api/docs"
}

# Deploy testing environment
deploy_test() {
    print_status "Deploying to testing environment..."

    # Stop existing containers
    docker-compose -f docker-compose.test.yml down 2>/dev/null || true

    # Start with Doppler
    doppler run --project="$PROJECT_NAME" --config=test -- docker-compose -f docker-compose.test.yml up --build -d

    print_success "Testing deployment completed!"
    print_status "Application is running at: http://localhost:5901"
    print_status "API Documentation: http://localhost:5901/api/docs"
}

# Deploy production environment
deploy_prod() {
    print_status "Deploying to production environment..."

    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Build with skip install if requested
    if [ "$SKIP_INSTALL" = true ]; then
        print_status "Building with skip-install flag..."
        doppler run --project="$PROJECT_NAME" --config=prod -- docker-compose -f docker-compose.prod.yml build --build-arg SKIP_INSTALL=true
        doppler run --project="$PROJECT_NAME" --config=prod -- docker-compose -f docker-compose.prod.yml up -d
    else
        doppler run --project="$PROJECT_NAME" --config=prod -- docker-compose -f docker-compose.prod.yml up --build -d
    fi

    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30

    # Run migrations
    print_status "Running database migrations..."
    doppler run --project="$PROJECT_NAME" --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run migration:run || true

    # Create default data
    print_status "Creating default data..."
    doppler run --project="$PROJECT_NAME" --config=prod -- docker-compose -f docker-compose.prod.yml exec -T backend npm run create-default-data || true

    print_success "Production deployment completed!"
    print_status "Application is running at: http://localhost:5900"
    print_status "API Documentation: http://localhost:5900/api/docs"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."

    local port="5900"
    if [ "$ENVIRONMENT" = "test" ]; then
        port="5901"
    fi

    # Test database connection
    if curl -f "http://localhost:$port/api/v1/db-test" >/dev/null 2>&1; then
        print_success "Database connection: OK"
    else
        print_warning "Database connection: Failed"
    fi

    # Test API documentation
    if curl -f "http://localhost:$port/api/docs" >/dev/null 2>&1; then
        print_success "API documentation: OK"
    else
        print_warning "API documentation: Failed"
    fi

    print_status "Application URLs:"
    echo "  API: http://localhost:$port"
    echo "  Docs: http://localhost:$port/api/docs"
    echo "  Health: http://localhost:$port/api/v1/db-test"
}

# Show status
show_status() {
    print_status "Checking deployment status..."

    local compose_file="docker-compose.local.yml"
    if [ "$ENVIRONMENT" = "test" ]; then
        compose_file="docker-compose.test.yml"
    elif [ "$ENVIRONMENT" = "prod" ]; then
        compose_file="docker-compose.prod.yml"
    fi

    if docker-compose -f "$compose_file" ps | grep -q "Up"; then
        print_success "Application is running"
        docker-compose -f "$compose_file" ps
    else
        print_warning "Application is not running"
    fi
}

# Main execution
main() {
    echo -e "${GREEN}🚀 SplitBuddy Deployment with Doppler${NC}"
    echo ""

    print_status "Project: $PROJECT_NAME"
    print_status "Environment: $ENVIRONMENT"
    print_status "Skip Install: $SKIP_INSTALL"
    echo ""

    check_docker

    # Deploy based on environment
    case "$ENVIRONMENT" in
        "dev")
            deploy_dev
            ;;
        "test")
            deploy_test
            ;;
        "prod")
            deploy_prod
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac

    echo ""
    test_deployment
    echo ""
    show_status
}

# Run main function
main "$@"
