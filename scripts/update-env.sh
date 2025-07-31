#!/bin/bash
# Update Environment Variables Script
# This script helps you easily update environment variables in the centralized config

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

# Function to update environment variable
update_env_var() {
    local var_name="$1"
    local new_value="$2"
    local env_file="$3"

    if [ -f "$env_file" ]; then
        # Check if variable exists
        if grep -q "^${var_name}=" "$env_file"; then
            # Update existing variable
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/^${var_name}=.*/${var_name}=${new_value}/" "$env_file"
            else
                # Linux
                sed -i "s/^${var_name}=.*/${var_name}=${new_value}/" "$env_file"
            fi
            print_success "Updated $var_name in $env_file"
        else
            # Add new variable
            echo "${var_name}=${new_value}" >> "$env_file"
            print_success "Added $var_name to $env_file"
        fi
    else
        print_error "Environment file not found: $env_file"
        return 1
    fi
}

# Function to show current environment variables
show_env_vars() {
    local env_file="$1"

    if [ -f "$env_file" ]; then
        print_status "Current environment variables in $env_file:"
        echo ""
        cat "$env_file" | grep -v '^#' | grep -v '^$' | sort
        echo ""
    else
        print_error "Environment file not found: $env_file"
    fi
}

# Function to create environment file from template
create_env_file() {
    local env_file="$1"

    print_status "Creating environment file: $env_file"

    cat > "$env_file" << EOF
# SplitBuddy Backend Environment Configuration
# Generated on $(date)

# ========================================
# DATABASE CONFIGURATION
# ========================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=splitbuddy_user_local
DB_PASSWORD=ngSystems@2019
DB_DATABASE=splitbuddy_db_local

# ========================================
# REDIS CONFIGURATION
# ========================================
REDIS_HOST=localhost
REDIS_PORT=6379

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=your-jwt-secret-key

# ========================================
# SMTP CONFIGURATION
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# ========================================
# GOOGLE OAUTH CONFIGURATION
# ========================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback

# ========================================
# APP CONFIGURATION
# ========================================
APP_PORT=5900
PORT=5900
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# ========================================
# QUEUE CONFIGURATION
# ========================================
EMAIL_QUEUE_NAME=email-queue
NOTIFICATION_QUEUE_NAME=notification-queue
EOF

    print_success "Environment file created: $env_file"
}

# Main script
main() {
    echo -e "${GREEN}🔧 Environment Variables Update Script${NC}"
    echo ""

    if [ "$1" = "show" ]; then
        show_env_vars ".env"
        exit 0
    fi

    if [ "$1" = "create" ]; then
        create_env_file ".env"
        exit 0
    fi

    if [ "$1" = "update" ] && [ -n "$2" ] && [ -n "$3" ]; then
        update_env_var "$2" "$3" ".env"
        exit 0
    fi

    if [ "$1" = "update-prod" ] && [ -n "$2" ] && [ -n "$3" ]; then
        update_env_var "$2" "$3" ".env.production"
        exit 0
    fi

    # Show help
    echo "Usage:"
    echo "  $0 show                    # Show current environment variables"
    echo "  $0 create                  # Create new .env file from template"
    echo "  $0 update VAR_NAME VALUE   # Update variable in .env"
    echo "  $0 update-prod VAR_NAME VALUE  # Update variable in .env.production"
    echo ""
    echo "Examples:"
    echo "  $0 show"
    echo "  $0 create"
    echo "  $0 update DB_HOST postgres"
    echo "  $0 update-prod JWT_SECRET my-secret-key"
    echo ""
}

# Run main function
main "$@"