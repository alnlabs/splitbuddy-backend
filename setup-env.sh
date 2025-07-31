#!/bin/bash

# SplitBuddy Environment Setup Script
# This script helps you create and configure your .env file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 SplitBuddy Environment Setup${NC}"

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists. Do you want to overwrite it? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}ℹ️  Setup cancelled.${NC}"
        exit 0
    fi
fi

# Copy the production environment template
if [ -f "env.production" ]; then
    cp env.production .env
    echo -e "${GREEN}✅ Created .env file from template${NC}"
else
    echo -e "${RED}❌ env.production template not found${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Please update the following values in your .env file:${NC}"
echo -e "${BLUE}   1. JWT_SECRET - Generate a secure random string${NC}"
echo -e "${BLUE}   2. SMTP_PASS - Your Gmail app password${NC}"
echo -e "${BLUE}   3. GOOGLE_CLIENT_ID - Your Google OAuth client ID${NC}"
echo -e "${BLUE}   4. GOOGLE_CLIENT_SECRET - Your Google OAuth client secret${NC}"
echo -e "${BLUE}   5. SESSION_SECRET - Another secure random string${NC}"

echo -e "${YELLOW}🔑 For AWS deployment, update these values:${NC}"
echo -e "${BLUE}   1. DB_HOST - Your RDS endpoint${NC}"
echo -e "${BLUE}   2. DB_PASSWORD - Your RDS password${NC}"
echo -e "${BLUE}   3. REDIS_HOST - Your ElastiCache endpoint${NC}"
echo -e "${BLUE}   4. CORS_ORIGIN - Your frontend domain${NC}"

echo -e "${GREEN}✅ Environment setup completed!${NC}"
echo -e "${BLUE}📁 Your .env file is ready for configuration.${NC}"