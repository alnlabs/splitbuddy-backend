#!/bin/bash
# SplitBuddy Backend Production Environment Setup Script
# Interactive setup for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN=""
DB_NAME=""
DB_USERNAME=""
DB_PASSWORD=""
DB_HOST=""
DB_PORT=""
REDIS_HOST=""
REDIS_PORT=""
JWT_SECRET=""
APP_PORT=""
NODE_ENV=""

# Helper functions
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

read_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"

    if [ -n "$default" ]; then
        echo -n "$prompt [$default]: "
    else
        echo -n "$prompt: "
    fi

    read -r input
    if [ -z "$input" ]; then
        input="$default"
    fi

    eval "$var_name=\"$input\""
}

generate_jwt_secret() {
    openssl rand -base64 32
}

check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please do not run this script as root. Use a regular user with sudo privileges."
        exit 1
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js v18 or higher first."
        exit 1
    fi

    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Prerequisites check passed!"
}

install_system_dependencies() {
    print_status "Installing system dependencies..."

    # Update package list
    sudo apt update

    # Install required packages
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

    # Install Node.js (if not already installed)
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi

    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        print_status "Installing PM2..."
        sudo npm install -g pm2
    fi

    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_status "Installing PostgreSQL..."
        sudo apt install -y postgresql postgresql-contrib
        sudo systemctl enable postgresql
        sudo systemctl start postgresql
    fi

    # Install Redis
    if ! command -v redis-server &> /dev/null; then
        print_status "Installing Redis..."
        sudo apt install -y redis-server
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
    fi

    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        print_status "Installing Nginx..."
        sudo apt install -y nginx
        sudo systemctl enable nginx
        sudo systemctl start nginx
    fi

    print_success "System dependencies installed!"
}

create_env_file() {
    print_status "Creating environment file..."

    cat > .env.production << EOF
# Application Configuration
NODE_ENV=production
APP_PORT=${APP_PORT}
DOMAIN=${DOMAIN}

# Database Configuration
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

# Redis Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=${REDIS_PORT}

# JWT Configuration
JWT_SECRET=${JWT_SECRET}

# Email Configuration (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AWS Configuration (optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
EOF

    print_success "Environment file created: .env.production"
}

setup_database() {
    print_status "Setting up PostgreSQL database..."

    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE USER $DB_USERNAME WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USERNAME;" 2>/dev/null || true
    sudo -u postgres psql -c "ALTER USER $DB_USERNAME CREATEDB;" 2>/dev/null || true

    print_success "Database setup completed!"
}

create_systemd_service() {
    print_status "Creating systemd service..."

    sudo tee /etc/systemd/system/splitbuddy-backend.service > /dev/null << EOF
[Unit]
Description=SplitBuddy Backend API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=splitbuddy-backend

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable splitbuddy-backend

    print_success "Systemd service created!"
}

create_nginx_config() {
    local domain="$1"

    print_status "Creating Nginx configuration..."

    sudo tee /etc/nginx/sites-available/splitbuddy-backend > /dev/null << EOF
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/docs {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/splitbuddy-backend /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default

    # Test Nginx configuration
    sudo nginx -t

    # Reload Nginx
    sudo systemctl reload nginx

    print_success "Nginx configuration created!"
}

setup_ssl() {
    local domain="$1"

    print_status "Setting up SSL certificate with Let's Encrypt..."

    # Install Certbot
    if ! command -v certbot &> /dev/null; then
        sudo apt install -y certbot python3-certbot-nginx
    fi

    # Get SSL certificate
    sudo certbot --nginx -d "$domain" --non-interactive --agree-tos --email admin@"$domain"

    # Set up auto-renewal
    sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

    print_success "SSL certificate installed!"
}

setup_firewall() {
    print_status "Setting up firewall..."

    # Install UFW if not installed
    if ! command -v ufw &> /dev/null; then
        sudo apt install -y ufw
    fi

    # Configure firewall
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp

    # Enable firewall
    echo "y" | sudo ufw enable

    print_success "Firewall configured!"
}

show_final_instructions() {
    local domain="$1"

    print_success "Production environment setup completed!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Deploy the application: ./deploy.sh deploy"
    echo "2. Check application status: ./deploy.sh status"
    echo "3. View logs: pm2 logs splitbuddy-backend"
    echo "4. Monitor application: pm2 monit"
    echo ""
    echo "🌐 Application URLs:"
    echo "   - API: http://$domain"
    echo "   - Documentation: http://$domain/api/docs"
    echo "   - Health Check: http://$domain/api/v1/db-test"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   - Restart app: ./deploy.sh restart"
    echo "   - View logs: pm2 logs splitbuddy-backend"
    echo "   - Monitor: pm2 monit"
    echo "   - Stop app: pm2 stop splitbuddy-backend"
    echo "   - Start app: pm2 start splitbuddy-backend"
    echo ""
    echo "📁 Important Files:"
    echo "   - Environment: .env.production"
    echo "   - Service: /etc/systemd/system/splitbuddy-backend.service"
    echo "   - Nginx: /etc/nginx/sites-available/splitbuddy-backend"
    echo ""
}

main() {
    echo "🚀 SplitBuddy Backend Production Environment Setup"
    echo "=================================================="
    echo ""

    # Check prerequisites
    check_prerequisites

    # Get user input
    echo "📝 Please provide the following information:"
    echo ""

    read_input "Enter domain name (e.g., api.splitbuddyapp.com)" "" DOMAIN
    read_input "Enter database name" "splitbuddy_db_prod" DB_NAME
    read_input "Enter database username" "splitbuddy_user_prod" DB_USERNAME
    read_input "Enter database password" "" DB_PASSWORD
    read_input "Enter database host" "localhost" DB_HOST
    read_input "Enter database port" "5432" DB_PORT
    read_input "Enter Redis host" "localhost" REDIS_HOST
    read_input "Enter Redis port" "6379" REDIS_PORT
    read_input "Enter application port" "5900" APP_PORT
    read_input "Enter JWT secret (leave empty to generate)" "" JWT_SECRET

    # Generate JWT secret if not provided
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(generate_jwt_secret)
        print_status "Generated JWT secret"
    fi

    # Set NODE_ENV
    NODE_ENV="production"

    echo ""
    print_status "Installing system dependencies..."
    install_system_dependencies

    print_status "Setting up environment..."
    create_env_file

    print_status "Setting up database..."
    setup_database

    print_status "Creating systemd service..."
    create_systemd_service

    print_status "Creating Nginx configuration..."
    create_nginx_config "$DOMAIN"

    print_status "Setting up firewall..."
    setup_firewall

    # Ask about SSL
    echo ""
    read -p "Do you want to set up SSL certificate with Let's Encrypt? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl "$DOMAIN"
    fi

    show_final_instructions "$DOMAIN"
}

# Run main function
main "$@"