# SplitBuddy API Test Guide

This guide helps you test if the SplitBuddy backend API is running correctly.

## Quick Health Check

### 1. Basic Health Endpoint

```bash
curl http://localhost:5900/health
```

**Expected Response:** `{"status":"ok"}`

### 2. Database Connection Test

```bash
curl http://localhost:5900/api/v1/db-test
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "connected",
    "message": "Database connection successful"
  }
}
```

### 3. API Documentation

```bash
curl http://localhost:5900/api/docs
```

**Expected Response:** Swagger/OpenAPI documentation page

## Authentication Endpoints

### 4. User Registration

```bash
curl -X POST http://localhost:5900/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 5. User Login

```bash
curl -X POST http://localhost:5900/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

## Category Endpoints

### 6. List Categories

```bash
curl http://localhost:5900/api/v1/categories
```

### 7. Create Category

```bash
curl -X POST http://localhost:5900/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Food & Dining",
    "description": "Expenses related to food and dining",
    "color": "#FF6B6B"
  }'
```

## Group Endpoints

### 8. List Groups

```bash
curl http://localhost:5900/api/v1/groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Create Group

```bash
curl -X POST http://localhost:5900/api/v1/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Roommates",
    "description": "Shared expenses with roommates",
    "currency": "USD"
  }'
```

## Expense Endpoints

### 10. List Expenses

```bash
curl http://localhost:5900/api/v1/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Create Expense

```bash
curl -X POST http://localhost:5900/api/v1/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Grocery Shopping",
    "amount": 50.00,
    "description": "Weekly groceries",
    "categoryId": "category-uuid",
    "groupId": "group-uuid",
    "date": "2024-01-15"
  }'
```

## Payment Method Endpoints

### 12. List Payment Methods

```bash
curl http://localhost:5900/api/v1/payment-methods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 13. Create Payment Method

```bash
curl -X POST http://localhost:5900/api/v1/payment-methods \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Credit Card",
    "type": "CREDIT_CARD",
    "lastFourDigits": "1234"
  }'
```

## Notification Endpoints

### 14. List Notifications

```bash
curl http://localhost:5900/api/v1/notifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 15. Send Email Notification

```bash
curl -X POST http://localhost:5900/api/v1/notifications/send-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "text": "This is a test email from SplitBuddy API"
  }'
```

## Error Status Codes

| Status Code | Meaning               |
| ----------- | --------------------- |
| 200         | Success               |
| 201         | Created               |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 403         | Forbidden             |
| 404         | Not Found             |
| 500         | Internal Server Error |

## Troubleshooting

### If endpoints return 500 errors:

1. Check if database is running: `docker ps | grep postgres`
2. Check if Redis is running: `docker ps | grep redis`
3. Check application logs: `docker-compose -f docker-compose.prod.yml logs app`

### If database connection fails:

1. Verify environment variables are set correctly
2. Check if migrations have been run: `docker-compose -f docker-compose.prod.yml exec app npm run migration:run`

### If authentication fails:

1. Ensure JWT_SECRET is set in environment
2. Check if user registration/login endpoints are working

## Container Status Check

```bash
# Check if all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check container logs
docker-compose -f docker-compose.prod.yml logs app

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Check Redis logs
docker-compose -f docker-compose.prod.yml logs redis
```

## Quick Restart Commands

```bash
# Restart only the API
docker-compose -f docker-compose.prod.yml restart app

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Full redeploy
./deploy.sh production --github
```

## Environment Variables Check

```bash
# Check if environment variables are loaded
docker-compose -f docker-compose.prod.yml exec app env | grep DB_
docker-compose -f docker-compose.prod.yml exec app env | grep REDIS_
```

---

**Note:** Replace `YOUR_JWT_TOKEN` with the actual JWT token received from the login endpoint.
