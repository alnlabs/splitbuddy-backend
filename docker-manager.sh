#!/bin/bash
# Docker Environment Manager for SplitBuddy Backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1 ${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "SplitBuddy Docker Environment Manager"
    echo ""
    echo "Usage: $0 [ENVIRONMENT] [ACTION]"
    echo ""
    echo "ENVIRONMENTS:"
    echo "  local       - Development environment (docker-compose.local.yml)"
    echo "  test        - Testing environment (docker-compose.test.yml)"
    echo "  prod        - Production environment (docker-compose.prod.yml)"
    echo ""
    echo "ACTIONS:"
    echo "  up          - Start the environment"
    echo "  down        - Stop the environment"
    echo "  restart     - Restart the environment"
    echo "  logs        - Show logs"
    echo "  status      - Show container status"
    echo "  clean       - Clean up (stop + remove volumes)"
    echo "  build       - Build and start"
    echo "  test-api    - Test API endpoints (only for running environments)"
    echo ""
    echo "Examples:"
    echo "  $0 local up          # Start local development environment"
    echo "  $0 test build        # Build and start test environment"
    echo "  $0 prod status       # Check production environment status"
    echo "  $0 local clean       # Clean up local environment"
    echo ""
}

# Function to get compose file
get_compose_file() {
    case $1 in
        local)
            echo "docker-compose.local.yml"
            ;;
        test)
            echo "docker-compose.test.yml"
            ;;
        prod)
            echo "docker-compose.prod.yml"
            ;;
        *)
            print_error "Invalid environment: $1"
            show_help
            exit 1
            ;;
    esac
}

# Function to test API endpoints
test_api() {
    local env=$1
    local port

    case $env in
        local)
            port=5900
            ;;
        test)
            port=5901
            ;;
        prod)
            port=5900
            ;;
    esac

    print_header "Testing API Endpoints for $env environment"

    # Wait for service to be ready
    print_status "Waiting for API to be ready..."
    sleep 10

    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -s -f "http://localhost:$port/api/v1/db-test" > /dev/null; then
        print_status "✅ Health check passed"
    else
        print_warning "❌ Health check failed"
    fi

    # Test basic endpoints
    print_status "Testing basic endpoints..."
    if curl -s -f "http://localhost:$port" > /dev/null; then
        print_status "✅ Root endpoint accessible"
    else
        print_warning "❌ Root endpoint failed"
    fi

    # Test Swagger docs
    if curl -s -f "http://localhost:$port/api/docs" > /dev/null; then
        print_status "✅ Swagger docs accessible"
    else
        print_warning "❌ Swagger docs not accessible"
    fi

    print_status "API testing complete!"
}

# Main script
main() {
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    check_docker

    local environment=$1
    local action=$2
    local compose_file

    if [ -z "$action" ]; then
        action="up"
    fi

    compose_file=$(get_compose_file "$environment")

    print_header "SplitBuddy $environment Environment - $action"

    case $action in
        up)
            print_status "Starting $environment environment..."
            docker-compose -f "$compose_file" up -d
            print_status "Environment started! 🚀"
            ;;
        down)
            print_status "Stopping $environment environment..."
            docker-compose -f "$compose_file" down
            print_status "Environment stopped! 🛑"
            ;;
        restart)
            print_status "Restarting $environment environment..."
            docker-compose -f "$compose_file" down
            docker-compose -f "$compose_file" up -d
            print_status "Environment restarted! 🔄"
            ;;
        logs)
            print_status "Showing logs for $environment environment..."
            docker-compose -f "$compose_file" logs -f
            ;;
        status)
            print_status "Status of $environment environment:"
            docker-compose -f "$compose_file" ps
            ;;
        clean)
            print_warning "Cleaning up $environment environment (this will remove all data)..."
            docker-compose -f "$compose_file" down -v --remove-orphans
            print_status "Environment cleaned! 🧹"
            ;;
        build)
            print_status "Building and starting $environment environment..."
            docker-compose -f "$compose_file" up --build -d
            print_status "Environment built and started! 🏗️"
            ;;
        test-api)
            test_api "$environment"
            ;;
        *)
            print_error "Invalid action: $action"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"