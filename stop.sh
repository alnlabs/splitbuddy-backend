#!/bin/bash
# SplitBuddy Backend Stop Script
# Stops local development and production environments
# Uses Docker for local development and PM2 for production

set -e

# Parse command line arguments
COMMAND=""
CLEANUP_LEVEL="safe"

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            COMMAND="help"
            shift
            ;;
        --cleanup-level)
            CLEANUP_LEVEL="$2"
            shift 2
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
PURPLE='\033[0;35m'
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

print_info() {
    echo -e "${PURPLE}📋 $1${NC}"
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

    if [ -f "docker-compose.local.yml" ]; then
        print_status "Stopping local Docker Compose services..."
        docker-compose -f docker-compose.local.yml down
        print_success "Local Docker Compose services stopped"
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

    # Show Docker resource usage
    print_info "Docker resource usage:"
    docker system df
}

# Safe cleanup - removes only unused resources
cleanup_safe() {
    print_status "Performing safe cleanup (unused resources only)..."

    # Show what will be deleted
    print_info "Will delete:"
    print_info "  - Stopped containers"
    print_info "  - Unused networks"
    print_info "  - Dangling images (untagged images)"

    read -p "Continue with safe cleanup? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_warning "Safe cleanup cancelled"
        return
    fi

    # Remove stopped containers
    print_status "Removing stopped containers..."
    docker container prune -f 2>/dev/null || true

    # Remove unused networks
    print_status "Removing unused networks..."
    docker network prune -f 2>/dev/null || true

    # Remove unused images (dangling only)
    print_status "Removing dangling images..."
    docker image prune -f 2>/dev/null || true

    print_success "Safe cleanup completed!"
}

# Aggressive cleanup - removes more resources including unused images
cleanup_aggressive() {
    print_status "Performing aggressive cleanup..."

    # Show what will be deleted
    print_info "Will delete:"
    print_info "  - Everything from safe cleanup"
    print_info "  - ALL unused images (including tagged ones)"
    print_info "  - Unused build cache"
    print_warning "This will free significant disk space but may remove images you might need later"

    read -p "Continue with aggressive cleanup? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_warning "Aggressive cleanup cancelled"
        return
    fi

    # Safe cleanup first
    cleanup_safe

    # Remove all unused images (not just dangling)
    print_status "Removing all unused images..."
    docker image prune -a -f 2>/dev/null || true

    # Remove unused build cache
    print_status "Removing unused build cache..."
    docker builder prune -f 2>/dev/null || true

    print_success "Aggressive cleanup completed!"
}

# Nuclear cleanup - removes everything including volumes (use with extreme caution)
cleanup_nuclear() {
    print_warning "⚠️  NUCLEAR CLEANUP - This will remove ALL Docker resources!"
    print_warning "This includes:"
    print_warning "  - All containers (running and stopped)"
    print_warning "  - All images"
    print_warning "  - All networks"
    print_warning "  - All volumes (this will DELETE your data!)"
    print_warning "  - All build cache"

    # Show current resource usage
    print_info "Current Docker resources:"
    docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Size}}\t{{.Reclaimable}}"

    print_warning "⚠️  WARNING: This will DELETE ALL your Docker data including databases!"
    read -p "Are you absolutely sure? Type 'YES' to continue: " confirm
    if [ "$confirm" != "YES" ]; then
        print_error "Nuclear cleanup cancelled"
        exit 1
    fi

    print_status "Performing nuclear cleanup..."

    # Stop all containers
    print_status "Stopping all containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true

    # Remove all containers
    print_status "Removing all containers..."
    docker rm $(docker ps -aq) 2>/dev/null || true

    # Remove all images
    print_status "Removing all images..."
    docker rmi $(docker images -aq) 2>/dev/null || true

    # Remove all networks
    print_status "Removing all networks..."
    docker network prune -f 2>/dev/null || true

    # Remove all volumes
    print_status "Removing all volumes..."
    docker volume prune -f 2>/dev/null || true

    # Remove all build cache
    print_status "Removing all build cache..."
    docker builder prune -a -f 2>/dev/null || true

    # System prune everything
    print_status "Final system cleanup..."
    docker system prune -a -f --volumes 2>/dev/null || true

    print_success "Nuclear cleanup completed! All Docker resources removed."
}

# Comprehensive cleanup with different levels
cleanup() {
    case "$CLEANUP_LEVEL" in
        "safe")
            cleanup_safe
            ;;
        "aggressive")
            cleanup_aggressive
            ;;
        "nuclear")
            cleanup_nuclear
            ;;
        *)
            print_error "Invalid cleanup level: $CLEANUP_LEVEL"
            print_info "Valid levels: safe, aggressive, nuclear"
            exit 1
            ;;
    esac
}

# Show Docker resource usage
show_resources() {
    print_status "Docker resource usage:"
    docker system df

    print_status "Container status:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Size}}\t{{.Ports}}"

    print_status "Image usage:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

    print_status "Volume usage:"
    docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Size}}"

    print_status "Network usage:"
    docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
}

show_help() {
    echo "SplitBuddy Backend Stop Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  local, dev, l        Stop local development environment"
    echo "  production, prod, p  Stop production environment"
    echo "  all, a               Stop all environments (local + production)"
    echo "  status, s            Show current status of all environments"
    echo "  cleanup, c           Clean up Docker resources"
    echo "  resources, r         Show detailed Docker resource usage"
    echo "  help, --help, -h, h  Show this help message"
    echo ""
    echo "Cleanup Levels (--cleanup-level):"
    echo "  safe                 Safe cleanup - removes only unused resources (default)"
    echo "  aggressive           Aggressive cleanup - removes unused images and build cache"
    echo "  nuclear              Nuclear cleanup - removes ALL Docker resources (use with caution!)"
    echo ""
    echo "Examples:"
    echo "  $0 local             # Stop local development environment"
    echo "  $0 l                 # Shortcut for local"
    echo "  $0 production        # Stop production environment"
    echo "  $0 p                 # Shortcut for production"
    echo "  $0 all               # Stop all environments"
    echo "  $0 a                 # Shortcut for all"
    echo "  $0 status            # Check current status"
    echo "  $0 s                 # Shortcut for status"
    echo "  $0 resources         # Show detailed resource usage"
    echo "  $0 r                 # Shortcut for resources"
    echo "  $0 cleanup           # Safe cleanup (default)"
    echo "  $0 c                 # Shortcut for cleanup"
    echo "  $0 cleanup --cleanup-level aggressive  # Aggressive cleanup"
    echo "  $0 cleanup --cleanup-level nuclear     # Nuclear cleanup (dangerous!)"
    echo ""
    echo "⚠️  WARNING: Nuclear cleanup will delete ALL Docker data including volumes!"
}

# Main script logic
case "${COMMAND:-help}" in
    "local"|"dev"|"l")
        stop_local
        ;;
    "production"|"prod"|"p")
        stop_production
        ;;
    "all"|"a")
        stop_all
        ;;
    "status"|"s")
        show_status
        ;;
    "cleanup"|"c")
        cleanup
        ;;
    "resources"|"r")
        show_resources
        ;;
    "help"|"--help"|"-h"|"h"|*)
        show_help
        ;;
esac