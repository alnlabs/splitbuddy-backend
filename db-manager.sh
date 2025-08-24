#!/bin/bash
# Simple Database Manager for SplitBuddy Backend
# Easy database operations and management

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

# Check if containers are running
check_containers() {
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_error "Containers are not running. Please start the application first:"
        echo "  ./simple-deploy.sh deploy"
        exit 1
    fi
}

# Connect to database
connect() {
    print_status "Connecting to database..."
    docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod
}

# Check database status
status() {
    print_status "Checking database status..."

    # Check if database is running
    if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U splitbuddy_user_prod >/dev/null 2>&1; then
        print_success "Database is running"
    else
        print_error "Database is not running"
        return 1
    fi

    # Check database size
    print_status "Database size:"
    docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "SELECT pg_size_pretty(pg_database_size('splitbuddy_prod'));" 2>/dev/null || print_warning "Could not get database size"

    # Check migration status
    print_status "Migration status:"
    docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "SELECT timestamp, name FROM migrations ORDER BY timestamp DESC LIMIT 5;" 2>/dev/null || print_warning "Could not get migration status"
}

# Run migrations
migrate() {
    print_status "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec backend npm run migration:run
    print_success "Migrations completed"
}

# Create default data
seed() {
    print_status "Creating default data..."
    docker-compose -f docker-compose.prod.yml exec backend npm run create-default-data
    print_success "Default data created"
}

# Backup database
backup() {
    local backup_file="${1:-backup_$(date +%Y%m%d_%H%M%S).sql}"

    print_status "Creating database backup: $backup_file"
    docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U splitbuddy_user_prod splitbuddy_prod > "$backup_file"

    if [ -f "$backup_file" ]; then
        print_success "Backup created: $backup_file"
        print_status "Backup size: $(du -h "$backup_file" | cut -f1)"
    else
        print_error "Backup failed"
        exit 1
    fi
}

# Restore database
restore() {
    local backup_file="$1"

    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file: $0 restore <backup_file>"
        exit 1
    fi

    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi

    print_warning "This will overwrite the current database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        exit 0
    fi

    print_status "Restoring database from: $backup_file"
    docker-compose -f docker-compose.prod.yml exec -T postgres psql -U splitbuddy_user_prod splitbuddy_prod < "$backup_file"
    print_success "Database restored"
}

# Reset database (DANGER)
reset() {
    print_warning "This will DELETE ALL DATA and recreate the database!"
    read -p "Are you sure? Type 'DELETE' to confirm: " -r
    if [ "$REPLY" != "DELETE" ]; then
        print_status "Reset cancelled"
        exit 0
    fi

    print_status "Resetting database..."

    # Drop and recreate database
    docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -c "DROP DATABASE IF EXISTS splitbuddy_prod;"
    docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -c "CREATE DATABASE splitbuddy_prod;"

    # Run migrations
    migrate

    # Create default data
    seed

    print_success "Database reset completed"
}

# Show table information
tables() {
    print_status "Database tables and sizes:"
    docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "
    SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        (SELECT count(*) FROM information_schema.tables WHERE table_name = t.tablename) as exists
    FROM pg_tables t
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    " 2>/dev/null || print_warning "Could not get table information"
}

# Show user statistics
users() {
    print_status "User statistics:"
    docker-compose -f docker-compose.prod.yml exec postgres psql -U splitbuddy_user_prod -d splitbuddy_prod -c "
    SELECT
        'Users' as table_name,
        COUNT(*) as count
    FROM users
    UNION ALL
    SELECT
        'Groups' as table_name,
        COUNT(*) as count
    FROM user_groups
    UNION ALL
    SELECT
        'Expenses' as table_name,
        COUNT(*) as count
    FROM expenses
    UNION ALL
    SELECT
        'Categories' as table_name,
        COUNT(*) as count
    FROM categories
    UNION ALL
    SELECT
        'Payment Methods' as table_name,
        COUNT(*) as count
    FROM payment_methods;
    " 2>/dev/null || print_warning "Could not get user statistics"
}

# Monitor database logs
logs() {
    print_status "Showing database logs..."
    docker-compose -f docker-compose.prod.yml logs -f postgres
}

# Show help
help() {
    echo "Database Manager for SplitBuddy Backend"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  connect              Connect to database (interactive)"
    echo "  status               Check database status"
    echo "  migrate              Run database migrations"
    echo "  seed                 Create default data"
    echo "  backup [filename]    Create database backup"
    echo "  restore <filename>   Restore database from backup"
    echo "  reset                Reset database (DANGER - deletes all data)"
    echo "  tables               Show table information and sizes"
    echo "  users                Show user statistics"
    echo "  logs                 Show database logs"
    echo "  help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status            # Check database status"
    echo "  $0 backup            # Create backup with timestamp"
    echo "  $0 backup my_backup.sql  # Create backup with custom name"
    echo "  $0 restore backup.sql    # Restore from backup"
    echo "  $0 connect           # Connect to database"
    echo "  $0 tables            # Show table sizes"
    echo ""
    echo "Note: Make sure the application is running first:"
    echo "  ./simple-deploy.sh deploy"
}

# Main script
case "${1:-help}" in
    "connect")
        check_containers
        connect
        ;;
    "status")
        check_containers
        status
        ;;
    "migrate")
        check_containers
        migrate
        ;;
    "seed")
        check_containers
        seed
        ;;
    "backup")
        check_containers
        backup "$2"
        ;;
    "restore")
        check_containers
        restore "$2"
        ;;
    "reset")
        check_containers
        reset
        ;;
    "tables")
        check_containers
        tables
        ;;
    "users")
        check_containers
        users
        ;;
    "logs")
        logs
        ;;
    "help"|"--help"|"-h"|*)
        help
        ;;
esac
