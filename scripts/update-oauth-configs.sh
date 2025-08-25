#!/bin/bash
# Update OAuth Configuration with Platform-Specific Client IDs
# This script updates environment variables with separate client IDs for web, Android, and iOS

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
COMMON_PROJECT="common-configs"

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
        --common-project|-c)
            COMMON_PROJECT="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --project, -p PROJECT_NAME    Project name (default: splitbuddy-backend)"
            echo "  --env, -e ENVIRONMENT         Environment: dev, test, prod (default: dev)"
            echo "  --common-project, -c NAME     Common project name (default: common-configs)"
            echo "  --help, -h                    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --env dev                  # Update dev environment"
            echo "  $0 --env test                 # Update test environment"
            echo "  $0 --env prod                 # Update production environment"
            echo "  $0 --project my-app --env prod # Update different project"
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

# Function to get user input for OAuth configs
get_oauth_configs() {
    echo ""
    print_status "Enter Google OAuth Configuration for $ENVIRONMENT environment:"
    echo ""

    # Web Client ID
    echo -n "Web Client ID (for web applications): "
    read -r WEB_CLIENT_ID

    # Android Client ID
    echo -n "Android Client ID (for Android apps): "
    read -r ANDROID_CLIENT_ID

    # iOS Client ID
    echo -n "iOS Client ID (for iOS apps): "
    read -r IOS_CLIENT_ID

    # Client Secret (shared across platforms)
    echo -n "Client Secret (shared): "
    read -r CLIENT_SECRET

    # Callback URLs
    echo -n "Web Callback URL (default: http://localhost:5900/api/v1/auth/google/callback): "
    read -r WEB_CALLBACK_URL
    WEB_CALLBACK_URL=${WEB_CALLBACK_URL:-"http://localhost:5900/api/v1/auth/google/callback"}

    echo -n "Android Callback URL (default: com.splitbuddy.app:/oauth2redirect): "
    read -r ANDROID_CALLBACK_URL
    ANDROID_CALLBACK_URL=${ANDROID_CALLBACK_URL:-"com.splitbuddy.app:/oauth2redirect"}

    echo -n "iOS Callback URL (default: com.splitbuddy.app:/oauth2redirect): "
    read -r IOS_CALLBACK_URL
    IOS_CALLBACK_URL=${IOS_CALLBACK_URL:-"com.splitbuddy.app:/oauth2redirect"}
}

# Function to update Doppler secrets
update_doppler_secrets() {
    local project="$1"
    local environment="$2"

    print_status "Updating OAuth configuration in $project/$environment..."

    # Update Google OAuth secrets
    echo "$WEB_CLIENT_ID" | doppler secrets set GOOGLE_WEB_CLIENT_ID --project="$project" --config="$environment"
    echo "$ANDROID_CLIENT_ID" | doppler secrets set GOOGLE_ANDROID_CLIENT_ID --project="$project" --config="$environment"
    echo "$IOS_CLIENT_ID" | doppler secrets set GOOGLE_IOS_CLIENT_ID --project="$project" --config="$environment"
    echo "$CLIENT_SECRET" | doppler secrets set GOOGLE_CLIENT_SECRET --project="$project" --config="$environment"

    # Update callback URLs
    echo "$WEB_CALLBACK_URL" | doppler secrets set GOOGLE_WEB_CALLBACK_URL --project="$project" --config="$environment"
    echo "$ANDROID_CALLBACK_URL" | doppler secrets set GOOGLE_ANDROID_CALLBACK_URL --project="$project" --config="$environment"
    echo "$IOS_CALLBACK_URL" | doppler secrets set GOOGLE_IOS_CALLBACK_URL --project="$project" --config="$environment"

    # Keep backward compatibility
    echo "$WEB_CLIENT_ID" | doppler secrets set GOOGLE_CLIENT_ID --project="$project" --config="$environment"
    echo "$WEB_CALLBACK_URL" | doppler secrets set GOOGLE_CALLBACK_URL --project="$project" --config="$environment"

    print_success "OAuth configuration updated successfully!"
}

# Function to show current OAuth configs
show_current_configs() {
    local project="$1"
    local environment="$2"

    print_status "Current OAuth configuration in $project/$environment:"
    echo ""

    # Get current values
    local web_client_id=$(doppler secrets get GOOGLE_WEB_CLIENT_ID --project="$project" --config="$environment" --silent 2>/dev/null || echo "Not set")
    local android_client_id=$(doppler secrets get GOOGLE_ANDROID_CLIENT_ID --project="$project" --config="$environment" --silent 2>/dev/null || echo "Not set")
    local ios_client_id=$(doppler secrets get GOOGLE_IOS_CLIENT_ID --project="$project" --config="$environment" --silent 2>/dev/null || echo "Not set")

    echo "Web Client ID: $web_client_id"
    echo "Android Client ID: $android_client_id"
    echo "iOS Client ID: $ios_client_id"
    echo ""
}

# Function to create OAuth configuration template
create_oauth_template() {
    print_status "Creating OAuth configuration template..."

    cat > oauth-config-template.md << EOF
# Google OAuth Configuration Template

## Required Client IDs

### 1. Web Client ID
- **Purpose**: Web applications, browser-based OAuth
- **Platform**: Web
- **Redirect URI**: http://localhost:5900/api/v1/auth/google/callback (dev)
- **Redirect URI**: https://your-domain.com/api/v1/auth/google/callback (prod)

### 2. Android Client ID
- **Purpose**: Android mobile applications
- **Platform**: Android
- **Package Name**: com.splitbuddy.app
- **SHA-1 Certificate**: Your Android app's SHA-1 fingerprint

### 3. iOS Client ID
- **Purpose**: iOS mobile applications
- **Platform**: iOS
- **Bundle ID**: com.splitbuddy.app
- **URL Scheme**: com.splitbuddy.app

## Environment-Specific Configurations

### Development Environment
- **Web Callback**: http://localhost:5900/api/v1/auth/google/callback
- **Android Callback**: com.splitbuddy.app:/oauth2redirect
- **iOS Callback**: com.splitbuddy.app:/oauth2redirect

### Production Environment
- **Web Callback**: https://your-domain.com/api/v1/auth/google/callback
- **Android Callback**: com.splitbuddy.app:/oauth2redirect
- **iOS Callback**: com.splitbuddy.app:/oauth2redirect

## Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Create three OAuth 2.0 Client IDs:
   - Web application client
   - Android client
   - iOS client
4. Configure redirect URIs for each platform
5. Download the client configuration files

## Environment Variables

\`\`\`bash
# Web OAuth
GOOGLE_WEB_CLIENT_ID=your-web-client-id
GOOGLE_WEB_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback

# Android OAuth
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
GOOGLE_ANDROID_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# iOS OAuth
GOOGLE_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_IOS_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Shared
GOOGLE_CLIENT_SECRET=your-client-secret

# Backward Compatibility
GOOGLE_CLIENT_ID=your-web-client-id
GOOGLE_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback
\`\`\`
EOF

    print_success "OAuth configuration template created: oauth-config-template.md"
}

# Main execution
main() {
    echo -e "${GREEN}🔐 Google OAuth Configuration Update${NC}"
    echo ""

    print_status "Project: $PROJECT_NAME"
    print_status "Environment: $ENVIRONMENT"
    print_status "Common Project: $COMMON_PROJECT"
    echo ""

    # Check if project exists
    if ! doppler projects list | grep -q "$PROJECT_NAME"; then
        print_error "Project '$PROJECT_NAME' does not exist."
        print_status "Please create it first or use the correct project name."
        exit 1
    fi

    # Check if environment exists
    if ! doppler configs list --project="$PROJECT_NAME" | grep -q "$ENVIRONMENT"; then
        print_error "Environment '$ENVIRONMENT' does not exist in '$PROJECT_NAME'."
        print_status "Please create it first or use the correct environment name."
        exit 1
    fi

    # Show current configuration
    show_current_configs "$PROJECT_NAME" "$ENVIRONMENT"

    # Ask if user wants to update
    echo ""
    read -p "Do you want to update the OAuth configuration? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Get OAuth configuration from user
        get_oauth_configs

        # Update Doppler secrets
        update_doppler_secrets "$PROJECT_NAME" "$ENVIRONMENT"

        # Also update common project if different
        if [ "$PROJECT_NAME" != "$COMMON_PROJECT" ]; then
            echo ""
            read -p "Do you also want to update the common project ($COMMON_PROJECT)? (y/N): " -n 1 -r
            echo ""

            if [[ $REPLY =~ ^[Yy]$ ]]; then
                update_doppler_secrets "$COMMON_PROJECT" "$ENVIRONMENT"
            fi
        fi

        echo ""
        print_success "OAuth configuration updated successfully!"
        print_status "You can now use platform-specific client IDs in your application."

    else
        print_warning "OAuth configuration update cancelled."
    fi

    # Create template
    echo ""
    read -p "Do you want to create an OAuth configuration template? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_oauth_template
    fi
}

# Run main function
main "$@"
