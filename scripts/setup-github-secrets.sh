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

# Create all required secrets with default values
create_default_secrets() {
    print_status "Creating default GitHub secrets..."

    # Database Configuration
    echo "postgres" | gh secret set DB_HOST --repo "$GITHUB_REPO"
    echo "5432" | gh secret set DB_PORT --repo "$GITHUB_REPO"
    echo "splitbuddy_user_prod" | gh secret set DB_USERNAME --repo "$GITHUB_REPO"
    echo "your-secure-password" | gh secret set DB_PASSWORD --repo "$GITHUB_REPO"
    echo "splitbuddy_prod" | gh secret set DB_DATABASE --repo "$GITHUB_REPO"

    # Redis Configuration
    echo "redis" | gh secret set REDIS_HOST --repo "$GITHUB_REPO"
    echo "6379" | gh secret set REDIS_PORT --repo "$GITHUB_REPO"

    # JWT Configuration
    echo "your-jwt-secret" | gh secret set JWT_SECRET --repo "$GITHUB_REPO"

    # SMTP Configuration
    echo "smtp.gmail.com" | gh secret set SMTP_HOST --repo "$GITHUB_REPO"
    echo "587" | gh secret set SMTP_PORT --repo "$GITHUB_REPO"
    echo "your-email@gmail.com" | gh secret set SMTP_USER --repo "$GITHUB_REPO"
    echo "your-app-password" | gh secret set SMTP_PASS --repo "$GITHUB_REPO"
    echo "your-email@gmail.com" | gh secret set SMTP_FROM --repo "$GITHUB_REPO"

    # Google OAuth Configuration
    echo "your-google-client-id" | gh secret set GOOGLE_CLIENT_ID --repo "$GITHUB_REPO"
    echo "your-google-client-secret" | gh secret set GOOGLE_CLIENT_SECRET --repo "$GITHUB_REPO"
    echo "http://localhost:5900/api/v1/auth/google/callback" | gh secret set GOOGLE_CALLBACK_URL --repo "$GITHUB_REPO"

    # App Configuration
    echo "5900" | gh secret set APP_PORT --repo "$GITHUB_REPO"
    echo "5900" | gh secret set PORT --repo "$GITHUB_REPO"
    echo "production" | gh secret set NODE_ENV --repo "$GITHUB_REPO"
    echo "http://localhost:3000" | gh secret set CORS_ORIGIN --repo "$GITHUB_REPO"

    # Queue Configuration
    echo "email-queue" | gh secret set EMAIL_QUEUE_NAME --repo "$GITHUB_REPO"
    echo "notification-queue" | gh secret set NOTIFICATION_QUEUE_NAME --repo "$GITHUB_REPO"

    print_success "All default secrets created successfully!"
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
    echo "3. Create default secrets with placeholder values"
    echo "4. List existing secrets"
    echo "5. Exit"
    echo ""

    read -p "Enter your choice (1-5): " choice

    case $choice in
        1)
            create_secrets_from_env ".env.production"
            ;;
        2)
            create_secrets_from_env ".env"
            ;;
        3)
            create_default_secrets
            ;;
        4)
            list_secrets
            ;;
        5)
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