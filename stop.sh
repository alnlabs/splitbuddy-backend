#!/bin/bash
# SplitBuddy Backend Stop Script
# Stops local development and production environments
# Uses Docker for local development and PM2 for production

set -e

# Parse command line arguments
COMMAND=""

while [[ $# -gt 0 ]]; do
    case $1 in
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
        print_status "4. Or run with sudo: sudo ./stop.sh"
        exit 1
    fi
    print_success "Docker is running"
}

stop_local() {
    print_status "Stopping local development environment..."
    check_docker

    # Stop Docker Compose services
    if [ -f "docker-compose.yml" ]; then
        print_status "Stopping Docker Compose services..."
        docker-compose down
        print_success "Docker Compose services stopped"
    fi

    # Stop using npm script if available
    if npm run | grep -q "docker:down"; then
        print_status "Stopping via npm script..."
        npm run docker:down 2>/dev/null || true
        print_success "NPM script execution completed"
    fi

    # Kill any remaining containers with splitbuddy in the name
    print_status "Cleaning up any remaining containers..."
    docker ps -q --filter "name=splitbuddy" | xargs -r docker stop 2>/dev/null || true
    docker ps -aq --filter "name=splitbuddy" | xargs -r docker rm 2>/dev/null || true

    print_success "Local development environment stopped!"
}

stop_production() {
    print_status "Stopping production environment..."
    check_docker

    # Stop production Docker Compose services
    if [ -f "docker-compose.prod.yml" ]; then
        print_status "Stopping production Docker Compose services..."
        docker-compose -f docker-compose.prod.yml down
        print_success "Production Docker Compose services stopped"
    fi

    # Kill any remaining production containers
    print_status "Cleaning up any remaining production containers..."
    docker ps -q --filter "name=splitbuddy" | xargs -r docker stop 2>/dev/null || true
    docker ps -aq --filter "name=splitbuddy" | xargs -r docker rm 2>/dev/null || true

    # Stop PM2 processes if PM2 is installed
    if command -v pm2 &> /dev/null; then
        print_status "Stopping PM2 processes..."
        pm2 stop all 2>/dev/null || true
        pm2 delete all 2>/dev/null || true
        print_success "PM2 processes stopped"
    fi

    print_success "Production environment stopped!"
}

stop_all() {
    print_status "Stopping all environments..."

    stop_local
    stop_production

    print_success "All environments stopped!"
}

show_status() {
    print_status "Checking application status..."

    # Check if containers are running (local)
    if docker ps | grep -q splitbuddy; then
        print_warning "Some SplitBuddy containers are still running"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep splitbuddy
    else
        print_success "No SplitBuddy containers are running"
    fi

    # Check if production containers are running
    if [ -f "docker-compose.prod.yml" ]; then
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            print_warning "Production containers are still running"
            docker-compose -f docker-compose.prod.yml ps
        else
            print_success "Production containers are stopped"
        fi
    fi

    # Check PM2 processes
    if command -v pm2 &> /dev/null; then
        if pm2 list | grep -q "online"; then
            print_warning "PM2 processes are still running"
            pm2 list
        else
            print_success "No PM2 processes are running"
        fi
    fi
}

cleanup() {
    print_status "Performing cleanup..."

    # Remove stopped containers
    print_status "Removing stopped containers..."
    docker container prune -f 2>/dev/null || true

    # Remove unused networks
    print_status "Removing unused networks..."
    docker network prune -f 2>/dev/null || true

    # Remove unused volumes (be careful with this in production)
    if [ "$1" = "--force" ]; then
        print_warning "Removing unused volumes (use with caution)..."
        docker volume prune -f 2>/dev/null || true
    fi

    # Remove unused images
    print_status "Removing unused images..."
    docker image prune -f 2>/dev/null || true

    print_success "Cleanup completed!"
}

show_help() {
    echo "SplitBuddy Backend Stop Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  local, dev           Stop local development environment"
    echo "  production, prod     Stop production environment"
    echo "  all                  Stop all environments (local + production)"
    echo "  status               Show current status of all environments"
    echo "  cleanup              Clean up Docker resources (containers, networks, images)"
    echo "  help, --help, -h     Show this help message"
    echo ""
    echo "Options:"
    echo "  --force              Force cleanup (includes volumes - use with caution)"
    echo ""
    echo "Examples:"
    echo "  $0 local             # Stop local development environment"
    echo "  $0 dev               # Stop local development environment (alias)"
    echo "  $0 production        # Stop production environment"
    echo "  $0 prod              # Stop production environment (alias)"
    echo "  $0 all               # Stop all environments"
    echo "  $0 status            # Check current status"
    echo "  $0 cleanup           # Clean up Docker resources"
    echo "  $0 cleanup --force   # Clean up including volumes (use with caution)"
}

# Main script logic
case "${COMMAND:-help}" in
    "local"|"dev")
        stop_local
        ;;
    "production"|"prod")
        stop_production
        ;;
    "all")
        stop_all
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        if [ "$1" = "--force" ]; then
            cleanup --force
        else
            cleanup
        fi
        ;;
    "help"|"--help"|"-h"|*)
        show_help
        ;;
esac