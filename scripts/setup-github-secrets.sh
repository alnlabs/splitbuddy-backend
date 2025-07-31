#!/bin/bash
# Setup GitHub Secrets for SplitBuddy Backend
# This script helps you set up GitHub repository secrets for production deployment

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

# Check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI is not installed. Please install it first."
        print_status "Install: https://cli.github.com/"
        exit 1
    fi
}

# Check if user is authenticated
check_auth() {
    if ! gh auth status &> /dev/null; then
        print_error "Not authenticated with GitHub CLI. Please login first."
        print_status "Run: gh auth login"
        exit 1
    fi
}

# Get repository name
get_repo_name() {
    if [ -z "$GITHUB_REPO" ]; then
        echo -n "Enter GitHub repository (format: owner/repo): "
        read -r repo_name
        export GITHUB_REPO="$repo_name"
    fi
}

# Create secrets from .env file
create_secrets_from_env() {
    local env_file="$1"

    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        exit 1
    fi

    print_status "Creating GitHub secrets from $env_file..."

    # Read each line from .env file and create a secret
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
            continue
        fi

        # Extract key and value
        if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
            local key="${BASH_REMATCH[1]}"
            local value="${BASH_REMATCH[2]}"

            # Remove quotes if present
            value=$(echo "$value" | sed 's/^"//;s/"$//;s/^'"'"'//;s/'"'"'$//')

            print_status "Creating secret: $key"
            echo "$value" | gh secret set "$key" --repo "$GITHUB_REPO"
        fi
    done < "$env_file"

    print_success "All secrets created successfully!"
}

# List existing secrets
list_secrets() {
    print_status "Listing existing secrets for $GITHUB_REPO..."
    gh secret list --repo "$GITHUB_REPO"
}

# Main script
main() {
    echo -e "${GREEN}🔧 GitHub Secrets Setup for SplitBuddy Backend${NC}"
    echo ""

    check_gh_cli
    check_auth
    get_repo_name

    echo ""
    echo "Choose an option:"
    echo "1. Create secrets from .env.production"
    echo "2. Create secrets from .env"
    echo "3. List existing secrets"
    echo "4. Exit"
    echo ""

    read -p "Enter your choice (1-4): " choice

    case $choice in
        1)
            create_secrets_from_env ".env.production"
            ;;
        2)
            create_secrets_from_env ".env"
            ;;
        3)
            list_secrets
            ;;
        4)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"