# 🚀 Simple Deployment Guide for SplitBuddy Backend

## 🎯 **Choose Your Deployment Strategy**

You have **3 simple options** - pick ONE that fits your needs:

---

## 📦 **Option 1: Simple Docker Deployment (Recommended)**

**Best for**: Quick deployment, development, testing
**Complexity**: ⭐ (Easiest)

### Quick Start (5 minutes)
```bash
# 1. Copy environment template
cp env.prod.config .env.prod

# 2. Edit your settings
nano .env.prod

# 3. Deploy with one command
./deploy.sh deploy
```

### What this gives you:
- ✅ Complete app with database and Redis
- ✅ Automatic migrations and setup
- ✅ Health checks and monitoring
- ✅ Easy to start/stop/restart
- ✅ Works on any machine with Docker

---

## 🖥️ **Option 2: Traditional Server Deployment**

**Best for**: Production servers, VPS, dedicated hosting
**Complexity**: ⭐⭐ (Medium)

### Quick Start (10 minutes)
```bash
# 1. Setup production environment
./setup-production-env.sh

# 2. Deploy application
./deploy.sh deploy
```

### What this gives you:
- ✅ Native performance
- ✅ Systemd service management
- ✅ Nginx reverse proxy
- ✅ SSL certificates
- ✅ Firewall configuration

---

## ☁️ **Option 3: Cloud Platform Deployment**

**Best for**: AWS, Google Cloud, Azure, Heroku
**Complexity**: ⭐⭐ (Medium)

### Quick Start (15 minutes)
```bash
# 1. Setup cloud environment
./setup-cloud-env.sh

# 2. Deploy to cloud
./deploy-cloud.sh
```

---

## 🔧 **Simplified Environment Management**

### Single Environment File Approach
Instead of multiple `.env` files, use **ONE** environment file:

```bash
# Copy the template
cp env.prod.config .env

# Edit your settings
nano .env

# Deploy
./deploy.sh deploy
```

### Environment Variables You Need:
```bash
# Required (change these)
DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional (can use defaults)
DB_HOST=postgres
DB_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 🚀 **Recommended: Docker Deployment**

### Step 1: Setup Environment
```bash
# Copy and edit environment
cp env.prod.config .env
nano .env
```

### Step 2: Deploy
```bash
# One command deployment
./deploy.sh deploy
```

### Step 3: Verify
```bash
# Check status
./deploy.sh status

# Test API
curl http://localhost:5900/api/v1/db-test
```

### Step 4: Access
- **API**: http://localhost:5900
- **Docs**: http://localhost:5900/api/docs
- **Health**: http://localhost:5900/api/v1/db-test

---

## 🛠️ **Common Commands**

```bash
# Start application
./deploy.sh deploy

# Stop application
./deploy.sh stop

# Restart application
./deploy.sh restart

# Check status
./deploy.sh status

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update application
git pull
./deploy.sh deploy
```

---

## 🔍 **Troubleshooting**

### Application Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check environment
cat .env

# Restart everything
./deploy.sh stop
./deploy.sh deploy
```

### Database Issues
```bash
# Reset database
docker-compose -f docker-compose.prod.yml down -v
./deploy.sh deploy
```

### Port Conflicts
```bash
# Check what's using port 5900
lsof -i :5900

# Change port in .env
APP_PORT=5901
```

---

## 📋 **Deployment Checklist**

### Before Deployment
- [ ] Environment file configured (`.env`)
- [ ] Database credentials set
- [ ] JWT secret generated
- [ ] Email settings configured
- [ ] Google OAuth configured

### After Deployment
- [ ] Application starts without errors
- [ ] Database connection works
- [ ] API endpoints respond
- [ ] Health check passes
- [ ] Documentation accessible

---

## 🎯 **Next Steps**

1. **Choose your deployment option** (Docker recommended)
2. **Setup environment file**
3. **Run deployment command**
4. **Verify everything works**
5. **Connect your frontend**

That's it! No more complexity. 🎉
