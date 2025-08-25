#!/bin/bash
# Sync Common Configurations from Doppler
# This script syncs common configs from a shared project to other projects

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
COMMON_ENV="dev"
TARGET_ENV="dev"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project|-p)
            TARGET_PROJECT="$2"
            shift 2
            ;;
        --env|-e)
            TARGET_ENV="$2"
            shift 2
            ;;
        --common-project|-c)
            COMMON_PROJECT="$2"
            shift 2
            ;;
        --common-env|-ce)
            COMMON_ENV="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 --project PROJECT_NAME [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --project, -p PROJECT_NAME    Target project name"
            echo "  --env, -e ENVIRONMENT         Target environment (default: local)"
            echo "  --common-project, -c NAME     Common project name (default: common-configs)"
            echo "  --common-env, -ce ENV         Common environment (default: shared)"
            echo "  --help, -h                    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --project splitbuddy-backend"
            echo "  $0 --project another-project --env production"
            echo "  $0 --project my-app --common-project shared-configs"
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

# Function to sync configs
sync_configs() {
    local target_project="$1"
    local target_env="$2"

    print_status "Syncing configs from $COMMON_PROJECT/$COMMON_ENV to $target_project/$target_env..."

    # Check if target project exists
    if ! doppler projects list | grep -q "$target_project"; then
        print_warning "Project '$target_project' does not exist. Creating it..."
        doppler projects create "$target_project"
    fi

    # Check if target environment exists
    if ! doppler configs list --project="$target_project" | grep -q "$target_env"; then
        print_warning "Environment '$target_env' does not exist in '$target_project'. Creating it..."
        doppler configs create "$target_env" --project="$target_project"
    fi

    # Copy secrets from common project
    print_status "Copying secrets..."
    doppler secrets copy \
        --from="$COMMON_PROJECT/$COMMON_ENV" \
        --to="$target_project/$target_env" \
        --yes

    print_success "Configs synced successfully!"
}

# Function to list common configs
list_common_configs() {
    print_status "Common configs in $COMMON_PROJECT/$COMMON_ENV:"
    doppler secrets list --project="$COMMON_PROJECT" --config="$COMMON_ENV"
}

# Function to show differences
show_diff() {
    local target_project="$1"
    local target_env="$2"

    print_status "Showing differences between $COMMON_PROJECT/$COMMON_ENV and $target_project/$target_env:"

    # Get common secrets
    local common_secrets=$(doppler secrets list --project="$COMMON_PROJECT" --config="$COMMON_ENV" --format=json)

    # Get target secrets
    local target_secrets=$(doppler secrets list --project="$target_project" --config="$target_env" --format=json)

    # Compare (simplified comparison)
    echo "Common secrets:"
    echo "$common_secrets" | jq -r '.[].name' | sort

    echo ""
    echo "Target secrets:"
    echo "$target_secrets" | jq -r '.[].name' | sort
}

# Main execution
main() {
    echo -e "${GREEN}🔄 Doppler Common Config Sync${NC}"
    echo ""

    print_status "Common Project: $COMMON_PROJECT/$COMMON_ENV"
    print_status "Target Project: $TARGET_PROJECT/$TARGET_ENV"
    echo ""

    # Check if common project exists
    if ! doppler projects list | grep -q "$COMMON_PROJECT"; then
        print_error "Common project '$COMMON_PROJECT' does not exist."
        print_status "Please create it first in the Doppler dashboard."
        exit 1
    fi

    # Check if common environment exists
    if ! doppler configs list --project="$COMMON_PROJECT" | grep -q "$COMMON_ENV"; then
        print_error "Common environment '$COMMON_ENV' does not exist in '$COMMON_PROJECT'."
        print_status "Please create it first in the Doppler dashboard."
        exit 1
    fi

    # Show what will be synced
    print_status "Common configs that will be synced:"
    list_common_configs

    echo ""
    read -p "Do you want to proceed with syncing? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sync_configs "$TARGET_PROJECT" "$TARGET_ENV"

        echo ""
        print_status "Sync completed! You can now use:"
        echo "  doppler run --project=$TARGET_PROJECT --config=$TARGET_ENV -- npm start"
    else
        print_warning "Sync cancelled."
    fi
}

# Run main function
main "$@"
