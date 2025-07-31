#!/bin/bash

# SplitBuddy Backend Production Environment Setup Script
# Interactive setup for production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to read user input with default value
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
    if [ -z "$input" ] && [ -n "$default" ]; then
        input="$default"
    fi

    eval "$var_name=\"$input\""
}

# Function to generate secure random string
generate_secret() {
    openssl rand -base64 32
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if system is Linux
is_linux() {
    [ "$(uname)" = "Linux" ]
}

# Function to check if system is Ubuntu/Debian
is_ubuntu() {
    command_exists apt-get
}

# Function to check if system is CentOS/RHEL
is_centos() {
    command_exists yum
}

# Function to install system dependencies
install_system_deps() {
    print_status "Installing system dependencies..."

    if is_linux; then
        if is_ubuntu; then
            sudo apt-get update
            sudo apt-get install -y curl wget git build-essential
        elif is_centos; then
            sudo yum update -y
            sudo yum install -y curl wget git gcc gcc-c++ make
        else
            print_warning "Unsupported Linux distribution. Please install manually:"
            print_warning "  - curl, wget, git, build-essential (Ubuntu/Debian)"
            print_warning "  - curl, wget, git, gcc, gcc-c++ (CentOS/RHEL)"
        fi
    else
        print_warning "Non-Linux system detected. Please install dependencies manually."
    fi
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js..."

    if command_exists node; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            print_success "Node.js $(node -v) is already installed"
            return 0
        else
            print_warning "Node.js version is too old: $(node -v). Installing v18..."
        fi
    fi

    if is_linux; then
        if is_ubuntu; then
            # Install Node.js 18.x
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif is_centos; then
            # Install Node.js 18.x
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs
        fi
    else
        print_error "Please install Node.js v18 or higher manually"
        exit 1
    fi

    print_success "Node.js $(node -v) installed successfully"
}

# Function to install PostgreSQL
install_postgresql() {
    print_status "Installing PostgreSQL..."

    if command_exists psql; then
        print_success "PostgreSQL is already installed"
        return 0
    fi

    if is_linux; then
        if is_ubuntu; then
            sudo apt-get install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        elif is_centos; then
            sudo yum install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        fi
    else
        print_error "Please install PostgreSQL manually"
        exit 1
    fi

    print_success "PostgreSQL installed successfully"
}

# Function to install Redis
install_redis() {
    print_status "Installing Redis..."

    if command_exists redis-server; then
        print_success "Redis is already installed"
        return 0
    fi

    if is_linux; then
        if is_ubuntu; then
            sudo apt-get install -y redis-server
            sudo systemctl start redis-server
            sudo systemctl enable redis-server
        elif is_centos; then
            sudo yum install -y redis
            sudo systemctl start redis
            sudo systemctl enable redis
        fi
    else
        print_error "Please install Redis manually"
        exit 1
    fi

    print_success "Redis installed successfully"
}

# Function to install PM2
install_pm2() {
    print_status "Installing PM2..."

    if command_exists pm2; then
        print_success "PM2 is already installed"
        return 0
    fi

    sudo npm install -g pm2
    print_success "PM2 installed successfully"
}

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."

    if command_exists nginx; then
        print_success "Nginx is already installed"
        return 0
    fi

    if is_linux; then
        if is_ubuntu; then
            sudo apt-get install -y nginx
            sudo systemctl start nginx
            sudo systemctl enable nginx
        elif is_centos; then
            sudo yum install -y nginx
            sudo systemctl start nginx
            sudo systemctl enable nginx
        fi
    else
        print_error "Please install Nginx manually"
        exit 1
    fi

    print_success "Nginx installed successfully"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall..."

    if is_linux; then
        if is_ubuntu; then
            sudo ufw allow 22/tcp    # SSH
            sudo ufw allow 80/tcp    # HTTP
            sudo ufw allow 443/tcp   # HTTPS
            sudo ufw allow 3000/tcp  # Application
            sudo ufw --force enable
        elif is_centos; then
            sudo firewall-cmd --permanent --add-service=ssh
            sudo firewall-cmd --permanent --add-service=http
            sudo firewall-cmd --permanent --add-service=https
            sudo firewall-cmd --permanent --add-port=3000/tcp
            sudo firewall-cmd --reload
        fi
    fi

    print_success "Firewall configured successfully"
}

# Function to create production environment file
create_env_file() {
    print_status "Creating production environment file..."

    cat > .env.production << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=$JWT_SECRET

# Email Configuration
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Google OAuth
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

# Application Configuration
APP_PORT=3000
NODE_ENV=production

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

    print_success "Production environment file created: .env.production"
}

# Function to create systemd service
create_systemd_service() {
    print_status "Creating systemd service..."

    local app_name="splitbuddy-backend"
    local app_path="$(pwd)"
    local user="$(whoami)"

    sudo tee /etc/systemd/system/$app_name.service > /dev/null << EOF
[Unit]
Description=SplitBuddy Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$user
WorkingDirectory=$app_path
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$app_name

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable $app_name.service

    print_success "Systemd service created: $app_name.service"
}

# Function to create Nginx configuration
create_nginx_config() {
    print_status "Creating Nginx configuration..."

    local domain="$1"
    local app_name="splitbuddy-backend"

    sudo tee /etc/nginx/sites-available/$app_name > /dev/null << EOF
server {
    listen 80;
    server_name $domain;

    location / {
        proxy_pass http://localhost:3000;
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
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/$app_name /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx

    print_success "Nginx configuration created for domain: $domain"
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    local domain="$1"

    print_status "Setting up SSL certificate with Let's Encrypt..."

    if command_exists certbot; then
        sudo certbot --nginx -d $domain
        print_success "SSL certificate installed for $domain"
    else
        print_warning "Certbot not found. Please install Let's Encrypt manually:"
        print_warning "  sudo apt-get install certbot python3-certbot-nginx"
    fi
}

# Function to create database
setup_database() {
    print_status "Setting up database..."

    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USERNAME WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USERNAME;
ALTER USER $DB_USERNAME CREATEDB;
\q
EOF

    print_success "Database setup completed"
}

# Function to show final instructions
show_final_instructions() {
    local domain="$1"

    echo ""
    echo "=========================================="
    echo "🎉 PRODUCTION SETUP COMPLETED SUCCESSFULLY!"
    echo "=========================================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Deploy the application:"
    echo "   ./deploy.sh production"
    echo ""
    echo "2. Start the service:"
    echo "   sudo systemctl start splitbuddy-backend"
    echo ""
    echo "3. Check service status:"
    echo "   sudo systemctl status splitbuddy-backend"
    echo ""
    echo "4. View logs:"
    echo "   sudo journalctl -u splitbuddy-backend -f"
    echo ""
    echo "5. Test the application:"
    echo "   curl http://$domain/api/v1/"
    echo ""
    echo "6. API Documentation:"
    echo "   http://$domain/api/docs"
    echo ""
    echo "🔧 Configuration Files:"
    echo "   - Environment: .env.production"
    echo "   - Systemd: /etc/systemd/system/splitbuddy-backend.service"
    echo "   - Nginx: /etc/nginx/sites-available/splitbuddy-backend"
    echo ""
    echo "🔐 Security Notes:"
    echo "   - Change default passwords"
    echo "   - Set up regular backups"
    echo "   - Monitor logs for security issues"
    echo "   - Keep system packages updated"
    echo ""
}

# Main setup function
main() {
    echo "=========================================="
    echo "🚀 SplitBuddy Backend Production Setup"
    echo "=========================================="
    echo ""

    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please don't run this script as root"
        exit 1
    fi

    # Check if we're in the project directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi

    # Install system dependencies
    install_system_deps

    # Install required software
    install_nodejs
    install_postgresql
    install_redis
    install_pm2
    install_nginx

    # Setup firewall
    setup_firewall

    # Get user input for configuration
    echo ""
    echo "📝 Configuration Setup"
    echo "====================="

    read_input "Enter database name" "splitbuddy_db_prod" DB_NAME
    read_input "Enter database username" "splitbuddy_user_prod" DB_USERNAME
    read_input "Enter database password" "" DB_PASSWORD

    read_input "Enter JWT secret (leave empty to generate)" "" JWT_SECRET_INPUT
    if [ -z "$JWT_SECRET_INPUT" ]; then
        JWT_SECRET=$(generate_secret)
        print_success "Generated JWT secret"
    else
        JWT_SECRET="$JWT_SECRET_INPUT"
    fi

    read_input "Enter Gmail address" "" SMTP_USER
    read_input "Enter Gmail app password" "" SMTP_PASS
    read_input "Enter sender email" "$SMTP_USER" SMTP_FROM
    read_input "Enter Google OAuth Client ID" "" GOOGLE_CLIENT_ID
    read_input "Enter domain name (e.g., api.splitbuddyapp.com)" "" DOMAIN

    # Create environment file
    create_env_file

    # Setup database
    setup_database

    # Create systemd service
    create_systemd_service

    # Create Nginx configuration
    if [ -n "$DOMAIN" ]; then
        create_nginx_config "$DOMAIN"

        # Setup SSL if domain is provided
        read_input "Setup SSL certificate with Let's Encrypt? (y/n)" "y" SETUP_SSL
        if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
            setup_ssl "$DOMAIN"
        fi
    fi

    # Show final instructions
    show_final_instructions "$DOMAIN"
}

# Run main function
main "$@"