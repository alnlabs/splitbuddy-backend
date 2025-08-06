#!/bin/bash
# Environment Files Setup Script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE} SplitBuddy Environment Files Setup ${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to copy and rename environment files
setup_env_file() {
    local source=$1
    local target=$2
    local env_name=$3

    if [ -f "$source" ]; then
        if [ -f "$target" ]; then
            echo -e "${YELLOW}⚠️  $target already exists. Backing up to ${target}.backup${NC}"
            cp "$target" "${target}.backup"
        fi

        cp "$source" "$target"
        echo -e "${GREEN}✅ Created $target for $env_name environment${NC}"
    else
        echo -e "${YELLOW}❌ Source file $source not found${NC}"
    fi
}

echo "Setting up environment configuration files..."
echo ""

# Setup environment files
setup_env_file "env.local.config" ".env.local" "Local Development"
setup_env_file "env.test.config" ".env.test" "Test"
setup_env_file "env.prod.config" ".env.prod" "Production"

echo ""
echo -e "${GREEN}🎉 Environment files setup complete!${NC}"
echo ""
echo "📋 Available environment files:"
echo "   .env.local  - Local development with visible credentials"
echo "   .env.test   - Test environment with test credentials"
echo "   .env.prod   - Production template (CHANGE CREDENTIALS!)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT FOR PRODUCTION:${NC}"
echo "   - Change all passwords and secrets in .env.prod"
echo "   - Set your actual SMTP credentials"
echo "   - Set your actual Google OAuth credentials"
echo "   - Set your actual domain URLs"
echo ""
echo "🚀 You can now use:"
echo "   ./docker-manager.sh local up    # Uses .env.local"
echo "   ./docker-manager.sh test up     # Uses .env.test"
echo "   ./docker-manager.sh prod up     # Uses .env.prod"