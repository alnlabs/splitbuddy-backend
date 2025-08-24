# 🚀 Quick Start Guide - SplitBuddy Backend

## ⚡ **5-Minute Deployment**

### Step 1: Setup Environment
```bash
# Run the interactive setup
./setup-env.sh
```

This will:
- ✅ Generate secure passwords and JWT secrets
- ✅ Ask for your email and Google OAuth settings
- ✅ Create a complete `.env` file
- ✅ Optionally deploy immediately

### Step 2: Deploy (if not done in Step 1)
```bash
# Deploy the application
./simple-deploy.sh deploy
```

### Step 3: Verify
```bash
# Check status
./simple-deploy.sh status

# Test endpoints
./simple-deploy.sh test
```

### Step 4: Access
- **API**: http://localhost:5900
- **Docs**: http://localhost:5900/api/docs
- **Health**: http://localhost:5900/api/v1/db-test

---

## 🛠️ **Common Commands**

```bash
# Start application
./simple-deploy.sh deploy

# Stop application
./simple-deploy.sh stop

# Restart application
./simple-deploy.sh restart

# View logs
./simple-deploy.sh logs

# Check status
./simple-deploy.sh status

# Test endpoints
./simple-deploy.sh test
```

## 🗄️ **Database Management**

```bash
# Check database status
./db-manager.sh status

# Connect to database
./db-manager.sh connect

# Create backup
./db-manager.sh backup

# Restore from backup
./db-manager.sh restore backup.sql

# Show table sizes
./db-manager.sh tables

# Show user statistics
./db-manager.sh users

# Reset database (DANGER)
./db-manager.sh reset
```

---

## 🔧 **Troubleshooting**

### Application Won't Start
```bash
# Check logs
./simple-deploy.sh logs

# Restart everything
./simple-deploy.sh stop
./simple-deploy.sh deploy
```

### Database Issues
```bash
# Reset database
docker-compose -f docker-compose.prod.yml down -v
./simple-deploy.sh deploy
```

### Port Conflicts
```bash
# Check what's using port 5900
lsof -i :5900

# Change port in .env
APP_PORT=5901
```

---

## 📋 **What You Get**

✅ **Complete API** with authentication, expenses, groups, notifications
✅ **PostgreSQL Database** with automatic migrations
✅ **Redis** for caching and queues
✅ **Email Notifications** via SMTP
✅ **Google OAuth** integration
✅ **API Documentation** with Swagger
✅ **Health Checks** and monitoring
✅ **Docker** containerization

---

## 🎯 **Next Steps**

1. **Connect your frontend** to the API
2. **Configure your domain** (if deploying to production)
3. **Set up SSL certificates** (for production)
4. **Monitor logs** and performance

---

## 📚 **More Information**

- **Detailed Guide**: [SIMPLE_DEPLOYMENT_GUIDE.md](SIMPLE_DEPLOYMENT_GUIDE.md)
- **API Documentation**: http://localhost:5900/api/docs
- **Environment Setup**: [setup-env.sh](setup-env.sh)
- **Deployment Script**: [simple-deploy.sh](simple-deploy.sh)

---

**That's it! Your SplitBuddy backend is ready to use! 🎉**
