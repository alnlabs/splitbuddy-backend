#!/bin/bash
# Simple Environment Setup for SplitBuddy Backend
# Interactive setup for essential configuration

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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

# Generate secure password
generate_password() {
    openssl rand -base64 12 | tr -d "=+/" | cut -c1-16
}

# Generate JWT secret
generate_jwt_secret() {
    openssl rand -base64 32
}

# Read user input with default
read_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local secret="$4"

    if [ -n "$default" ]; then
        echo -n "$prompt [$default]: "
    else
        echo -n "$prompt: "
    fi

    if [ "$secret" = "true" ]; then
        read -s -r input
        echo
    else
        read -r input
    fi

    if [ -z "$input" ]; then
        input="$default"
    fi

    eval "$var_name=\"$input\""
}

# Main setup function
main() {
    echo "🚀 SplitBuddy Backend Environment Setup"
    echo "======================================="
    echo ""
    print_status "This will help you configure your environment file."
    echo ""

    # Check if .env already exists
    if [ -f ".env" ]; then
        print_warning "Environment file already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Setup cancelled. Your existing .env file is preserved."
            exit 0
        fi
    fi

    # Get user input
    echo "📝 Please provide the following information:"
    echo ""

    # Database configuration
    read_input "Database password" "$(generate_password)" DB_PASSWORD "true"
    read_input "Database name" "splitbuddy_prod" DB_NAME
    read_input "Database username" "splitbuddy_user_prod" DB_USERNAME

    # JWT configuration
    read_input "JWT secret (leave empty to generate)" "" JWT_SECRET "true"
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(generate_jwt_secret)
        print_status "Generated JWT secret"
    fi

    # Email configuration
    echo ""
    print_status "Email Configuration (for notifications)"
    read_input "SMTP email" "" SMTP_USER
    read_input "SMTP password" "" SMTP_PASS "true"
    read_input "SMTP from email" "$SMTP_USER" SMTP_FROM

    # Google OAuth configuration
    echo ""
    print_status "Google OAuth Configuration (optional)"
    read_input "Google Client ID" "" GOOGLE_CLIENT_ID
    read_input "Google Client Secret" "" GOOGLE_CLIENT_SECRET "true"

    # App configuration
    echo ""
    print_status "Application Configuration"
    read_input "Application port" "5900" APP_PORT
    read_input "CORS origin (frontend URL)" "http://localhost:3000" CORS_ORIGIN

    # Create environment file
    print_status "Creating environment file..."
    
    cat > .env << EOF
# SplitBuddy Backend Environment Configuration
# Generated on $(date)

# ========================================
# APPLICATION CONFIGURATION
# ========================================
NODE_ENV=production
APP_PORT=${APP_PORT}
PORT=${APP_PORT}
CORS_ORIGIN=${CORS_ORIGIN}

# ========================================
# DATABASE CONFIGURATION
# ========================================
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_DATABASE=${DB_NAME}

# ========================================
# REDIS CONFIGURATION
# ========================================
REDIS_HOST=redis
REDIS_PORT=6379

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=${JWT_SECRET}

# ========================================
# SMTP CONFIGURATION
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}

# ========================================
# GOOGLE OAUTH CONFIGURATION
# ========================================
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=http://localhost:${APP_PORT}/api/v1/auth/google/callback

# ========================================
# QUEUE CONFIGURATION
# ========================================
EMAIL_QUEUE_NAME=email-queue
NOTIFICATION_QUEUE_NAME=notification-queue
EOF

    print_success "Environment file created: .env"
    echo ""

    # Show next steps
    print_status "Next steps:"
    echo "1. Review your configuration: cat .env"
    echo "2. Deploy the application: ./simple-deploy.sh deploy"
    echo "3. Test the application: ./simple-deploy.sh test"
    echo ""

    # Ask if user wants to deploy now
    read -p "Do you want to deploy now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        print_status "Starting deployment..."
        ./simple-deploy.sh deploy
    else
        print_status "You can deploy later with: ./simple-deploy.sh deploy"
    fi
}

# Run main function
main "$@"