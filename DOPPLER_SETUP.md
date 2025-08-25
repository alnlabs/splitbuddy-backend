# 🚀 SplitBuddy Backend - Doppler Environment Management

This project uses **Doppler** for environment variable management across all environments (dev, test, prod).

## 📋 **Prerequisites**

1. **Install Doppler CLI**

   ```bash
   curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh | sh
   ```

2. **Login to Doppler**
   ```bash
   doppler login
   ```

## 🏗️ **Project Setup**

### **1. Create Doppler Project**

- Go to [Doppler Dashboard](https://dashboard.doppler.com/)
- Create a new project: `splitbuddy-backend`
- Add environments: `dev`, `test`, `prod`

### **2. Configure OAuth Settings**

```bash
# Update OAuth configs for each environment
./scripts/update-oauth-configs.sh --env dev
./scripts/update-oauth-configs.sh --env test
./scripts/update-oauth-configs.sh --env prod
```

### **3. Set Up All Environments**

```bash
# Set up all environments for your project
./scripts/setup-doppler-environments.sh --project splitbuddy-backend
```

## 🚀 **Deployment Commands**

### **Development Environment**

```bash
# Deploy to development
./scripts/deploy-with-doppler.sh --env dev

# Or use the simple deploy script
./simple-deploy.sh deploy
```

### **Testing Environment**

```bash
# Deploy to testing
./scripts/deploy-with-doppler.sh --env test
```

### **Production Environment**

```bash
# Deploy to production
./scripts/deploy-with-doppler.sh --env prod

# Or use the simple deploy script
./simple-deploy.sh deploy
```

## 🔧 **Available Scripts**

### **Environment Management**

- `./scripts/setup-doppler-environments.sh` - Set up all environments
- `./scripts/update-oauth-configs.sh` - Update OAuth configurations
- `./scripts/sync-common-configs.sh` - Sync common configurations

### **Deployment**

- `./scripts/deploy-with-doppler.sh` - Deploy with environment selection
- `./simple-deploy.sh` - Simple deployment (uses production by default)

### **Utility Commands**

```bash
# Check status
./simple-deploy.sh status

# View logs
./simple-deploy.sh logs

# Restart application
./simple-deploy.sh restart

# Stop application
./simple-deploy.sh stop
```

## 🌍 **Environment Variables**

All environment variables are managed through Doppler:

### **Database Configuration**

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`

### **Redis Configuration**

- `REDIS_HOST`, `REDIS_PORT`

### **JWT Configuration**

- `JWT_SECRET`

### **SMTP Configuration**

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### **Google OAuth Configuration**

- `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`
- `GOOGLE_WEB_CALLBACK_URL`, `GOOGLE_ANDROID_CALLBACK_URL`, `GOOGLE_IOS_CALLBACK_URL`
- `GOOGLE_CLIENT_SECRET`

### **App Configuration**

- `APP_PORT`, `PORT`, `NODE_ENV`, `CORS_ORIGIN`

### **Queue Configuration**

- `EMAIL_QUEUE_NAME`, `NOTIFICATION_QUEUE_NAME`

## 🔐 **Security Benefits**

1. **No Local Environment Files** - All configs stored securely in Doppler
2. **Platform-Specific OAuth** - Separate client IDs for web, Android, iOS
3. **Environment Isolation** - Different configs for dev, test, prod
4. **Team Collaboration** - Share configs securely with team members
5. **Audit Trail** - Track all configuration changes

## 🚨 **Important Notes**

- **No `.env` files needed** - Everything is managed through Doppler
- **Automatic environment switching** - Scripts handle environment selection
- **Backward compatibility** - Existing code works without changes
- **Secure by default** - No sensitive data in version control

## 🔄 **Migration from Local Environment Files**

If you previously used local `.env` files:

1. **Remove local files** (already done)
2. **Set up Doppler** (follow setup steps above)
3. **Migrate configurations** (use the provided scripts)
4. **Update deployment commands** (use Doppler-enabled scripts)

## 📞 **Support**

- **Doppler Documentation**: https://docs.doppler.com/
- **Doppler CLI Reference**: https://docs.doppler.com/docs/cli
- **Project Scripts**: Check individual script files for detailed usage
