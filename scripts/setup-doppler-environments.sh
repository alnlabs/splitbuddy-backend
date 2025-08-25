#!/bin/bash
# Setup Doppler Environments for SplitBuddy
# This script sets up dev, test, and prod environments for a project

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
COMMON_PROJECT="common-configs"
TARGET_PROJECT=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project|-p)
            TARGET_PROJECT="$2"
            shift 2
            ;;
        --common-project|-c)
            COMMON_PROJECT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --project PROJECT_NAME [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --project, -p PROJECT_NAME    Target project name"
            echo "  --common-project, -c NAME     Common project name (default: common-configs)"
            echo "  --help, -h                    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --project splitbuddy-backend"
            echo "  $0 --project another-project --common-project shared-configs"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if target project is provided
if [ -z "$TARGET_PROJECT" ]; then
    print_error "Target project is required. Use --project PROJECT_NAME"
    echo "Run '$0 --help' for usage information"
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

# Function to setup environment
setup_environment() {
    local target_project="$1"
    local environment="$2"
    local common_env="$3"

    print_status "Setting up $environment environment for $target_project..."

    # Check if target project exists
    if ! doppler projects list | grep -q "$target_project"; then
        print_warning "Project '$target_project' does not exist. Creating it..."
        doppler projects create "$target_project"
    fi

    # Check if target environment exists
    if ! doppler configs list --project="$target_project" | grep -q "$environment"; then
        print_warning "Environment '$environment' does not exist in '$target_project'. Creating it..."
        doppler configs create "$environment" --project="$target_project"
    fi

    # Copy secrets from common project
    print_status "Copying configs from $COMMON_PROJECT/$common_env to $target_project/$environment..."
    doppler secrets copy \
        --from="$COMMON_PROJECT/$common_env" \
        --to="$target_project/$environment" \
        --yes

    print_success "$environment environment setup completed!"
}

# Function to list all environments
list_environments() {
    local target_project="$1"

    print_status "Environments in $target_project:"
    doppler configs list --project="$target_project"
}

# Main execution
main() {
    echo -e "${GREEN}🚀 Doppler Environment Setup${NC}"
    echo ""

    print_status "Common Project: $COMMON_PROJECT"
    print_status "Target Project: $TARGET_PROJECT"
    echo ""

    # Check if common project exists
    if ! doppler projects list | grep -q "$COMMON_PROJECT"; then
        print_error "Common project '$COMMON_PROJECT' does not exist."
        print_status "Please create it first in the Doppler dashboard with dev, test, and prod environments."
        exit 1
    fi

    # Check if common environments exist
    local missing_envs=()
    for env in dev test prod; do
        if ! doppler configs list --project="$COMMON_PROJECT" | grep -q "$env"; then
            missing_envs+=("$env")
        fi
    done

    if [ ${#missing_envs[@]} -gt 0 ]; then
        print_error "Missing environments in '$COMMON_PROJECT': ${missing_envs[*]}"
        print_status "Please create dev, test, and prod environments in the Doppler dashboard."
        exit 1
    fi

    print_status "Setting up all environments for $TARGET_PROJECT..."
    echo ""

    # Setup all three environments
    setup_environment "$TARGET_PROJECT" "dev" "dev"
    echo ""
    setup_environment "$TARGET_PROJECT" "test" "test"
    echo ""
    setup_environment "$TARGET_PROJECT" "prod" "prod"

    echo ""
    print_success "All environments setup completed!"
    echo ""

    # Show the environments
    list_environments "$TARGET_PROJECT"

    echo ""
    print_status "You can now use:"
    echo "  doppler run --project=$TARGET_PROJECT --config=dev -- npm start"
    echo "  doppler run --project=$TARGET_PROJECT --config=test -- npm test"
    echo "  doppler run --project=$TARGET_PROJECT --config=prod -- docker-compose up -d"
}

# Run main function
main "$@"
