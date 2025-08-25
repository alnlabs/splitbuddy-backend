#!/bin/bash
# Start SplitBuddy Backend with Doppler Environment Management

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
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --project, -p PROJECT_NAME    Project name (default: splitbuddy-backend)"
            echo "  --env, -e ENVIRONMENT         Environment: dev, test, prod (default: dev)"
            echo "  --help, -h                    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --env dev                  # Start with dev environment"
            echo "  $0 --env test                 # Start with test environment"
            echo "  $0 --env prod                 # Start with prod environment"
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

print_status "Starting SplitBuddy Backend with Doppler..."
print_status "Project: $PROJECT_NAME"
print_status "Environment: $ENVIRONMENT"
echo ""

# Check if Doppler CLI is installed
if ! command -v doppler &> /dev/null; then
    print_warning "Doppler CLI not found. Starting with local environment variables..."
    npm run start:dev
    exit 0
fi

# Check if user is authenticated
if ! doppler me &> /dev/null; then
    print_warning "Not authenticated with Doppler. Starting with local environment variables..."
    npm run start:dev
    exit 0
fi

# Start the application with Doppler
print_status "Starting application with Doppler environment variables..."
doppler run --project="$PROJECT_NAME" --config="$ENVIRONMENT" -- npm run start:dev

print_success "Application started successfully!"
print_status "API Documentation: http://localhost:5900/api/docs"
print_status "Health Check: http://localhost:5900/api/v1/db-test"
