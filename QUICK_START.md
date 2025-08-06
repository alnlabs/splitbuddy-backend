# 🚀 SplitBuddy Backend - Quick Start Guide

## ⚡ Super Fast Setup (30 seconds)

```bash
# 1. Setup environment files (one time only)
./setup-env-files.sh

# 2. Start local development
./docker-manager.sh local up

# 3. Test API (wait 10 seconds for startup)
curl http://localhost:5900/api/v1/db-test
```

**That's it! Your backend is running with all visible credentials.** 🎉

## 📋 Available Commands

| Command                              | Description             |
| ------------------------------------ | ----------------------- |
| `./docker-manager.sh local up`       | Start local development |
| `./docker-manager.sh test up`        | Start test environment  |
| `./docker-manager.sh prod up`        | Start production        |
| `./docker-manager.sh [env] down`     | Stop environment        |
| `./docker-manager.sh [env] logs`     | View logs               |
| `./docker-manager.sh [env] status`   | Check status            |
| `./docker-manager.sh [env] test-api` | Test API endpoints      |

## 🔧 Environment Files (All Visible Data)

### `.env.local` - Local Development

- **Database**: `splitbuddy_user_local` / `ngSystems@2019`
- **JWT Secret**: `iv570SrW+9fhKVvRrgW2cjiPXg7e+vR9dJ5xbJ1W4Ww=`
- **SMTP**: `alnlabs1@gmail.com` / `mszo jwpz srgu uhwh`
- **Google OAuth**: `1039447696099-ftbfa65lep53cm928a862bl6m2e9gaq9.apps.googleusercontent.com`

### `.env.test` - Test Environment

- **Database**: `splitbuddy_user_test` / `SplitBuddy2024!Test`
- **JWT Secret**: `test-jwt-secret-key-for-testing-only-not-secure`
- **Port**: `5901` (different from local)

### `.env.prod` - Production Template

- **Database**: `splitbuddy_user_prod` / `SplitBuddy2024!Secure!Prod`
- **⚠️ CHANGE ALL CREDENTIALS BEFORE PRODUCTION USE**

## 🌐 API Endpoints

| Environment | API Base URL          | Swagger Docs                   |
| ----------- | --------------------- | ------------------------------ |
| Local       | http://localhost:5900 | http://localhost:5900/api/docs |
| Test        | http://localhost:5901 | http://localhost:5901/api/docs |
| Production  | http://localhost:5900 | http://localhost:5900/api/docs |

## 🧪 Quick API Test

```bash
# Health check
curl http://localhost:5900/api/v1/db-test

# Register user
curl -X POST http://localhost:5900/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5900/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔄 Database Ports

| Environment | PostgreSQL Port | Redis Port |
| ----------- | --------------- | ---------- |
| Local       | 5432            | 6379       |
| Test        | 5434            | 6380       |
| Production  | 5433            | 6379       |

## 🛠️ Troubleshooting

### Port Already in Use?

```bash
# Stop all Docker containers
docker stop $(docker ps -q)

# Or kill specific ports
sudo lsof -ti:5900 | xargs kill -9
```

### Clean Restart?

```bash
./docker-manager.sh local clean  # Removes all data
./docker-manager.sh local build  # Fresh build
```

### View Logs?

```bash
./docker-manager.sh local logs
# Or specific container
docker logs splitbuddy_backend
```

## 📁 Key Files

- `docker-manager.sh` - Main management script
- `.env.local` - Local development config
- `.env.test` - Test environment config
- `.env.prod` - Production template
- `docker-compose.local.yml` - Local Docker setup
- `docker-compose.test.yml` - Test Docker setup
- `docker-compose.prod.yml` - Production Docker setup

---

**No more config mismatches! Everything is visible and ready to use.** ✨
