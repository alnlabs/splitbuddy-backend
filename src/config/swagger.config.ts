import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

/**
 * Swagger Configuration
 * Comprehensive API documentation setup for SplitBuddy
 */
export const swaggerConfig = new DocumentBuilder()
  .setTitle('SplitBuddy API')
  .setDescription(
    `
# SplitBuddy Backend API Documentation

## 🚀 Overview
SplitBuddy is a comprehensive expense splitting and financial management API that allows users to create, manage, and track shared expenses among groups. The API provides robust authentication, expense management, group coordination, and financial tracking capabilities.

## 🔐 Authentication
Most endpoints require Bearer token authentication. Include your JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Authentication Methods
- **Email/Password**: Traditional email and password authentication
- **Google OAuth**: Social login using Google OAuth 2.0
- **Firebase Authentication**: Mobile app authentication using Firebase ID tokens

## 🛠️ Getting Started

### 1. User Registration
\`\`\`bash
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

### 2. User Login
\`\`\`bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
\`\`\`

### 3. Using the API
Include the JWT token in subsequent requests:
\`\`\`bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

## 📋 Core Features

### 🔐 Authentication & User Management
- **User Registration**: Create new accounts with email verification
- **User Login**: Secure authentication with JWT tokens
- **Profile Management**: Update user profiles and preferences
- **Password Management**: Change passwords and reset forgotten passwords
- **Email Verification**: Verify email addresses for account activation
- **Social Login**: Google OAuth and Firebase authentication support

### 💰 Expense Management
- **Expense Creation**: Add new expenses with detailed information
- **Expense Splitting**: Automatically split expenses among group members
- **Expense Tracking**: Monitor who owes what to whom
- **Balance Calculation**: Real-time balance tracking for all users
- **Bulk Operations**: Create, update, and delete multiple expenses at once

### 👥 Group Management
- **Group Creation**: Create expense groups for different activities
- **Member Management**: Add and remove group members
- **Group Settings**: Configure group preferences and rules
- **Group Analytics**: Track group spending patterns and statistics

### 📊 Categories & Payment Methods
- **Expense Categories**: Organize expenses by categories (Food, Transport, etc.)
- **Payment Methods**: Track how expenses were paid (Cash, Card, etc.)
- **Custom Categories**: Create personalized categories for better organization

### 🔔 Notifications
- **Email Notifications**: Automated email reminders and updates
- **In-App Notifications**: Real-time notifications within the application
- **Settlement Reminders**: Remind users about unsettled balances

### 💳 Financial Features
- **Transaction History**: Complete transaction logs and history
- **Balance Tracking**: Real-time balance calculations
- **Settlement Management**: Mark expenses as settled
- **Loan Tracking**: Track personal loans and debts

## 🔧 API Features

### 📄 Pagination
All list endpoints support pagination with the following parameters:
- \`page\`: Page number (1-based, default: 1)
- \`limit\`: Items per page (1-100, default: 10)
- \`sortBy\`: Field to sort by
- \`sortOrder\`: Sort order (ASC/DESC, default: DESC)

### 🔍 Filtering & Search
Advanced filtering capabilities:
- **Date Range**: Filter by start and end dates
- **Amount Range**: Filter by minimum and maximum amounts
- **Category Filter**: Filter by expense categories
- **Group Filter**: Filter by group membership
- **User Filter**: Filter by user participation
- **Text Search**: Search in descriptions and names

### 📊 Response Format
All API responses follow a standardized format:
\`\`\`json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
\`\`\`

### ❌ Error Handling
Comprehensive error responses with detailed information:
\`\`\`json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-15T18:30:00.000Z",
  "path": "/api/v1/auth/register",
  "errorCode": "VALIDATION_ERROR"
}
\`\`\`

## 🌍 Environment Information

### Development Environment
- **Base URL**: http://localhost:5900
- **API Prefix**: /api/v1
- **Documentation**: http://localhost:5900/api/docs

### Test Environment
- **Base URL**: https://api.splitbuddyapp.com
- **API Prefix**: /api/test
- **Documentation**: https://api.splitbuddyapp.com/api/test/docs

### Production Environment
- **Base URL**: https://api.splitbuddyapp.com
- **API Prefix**: /api/v1
- **Documentation**: https://api.splitbuddyapp.com/api/v1/docs

## 📚 API Endpoints

### Authentication Endpoints
- \`POST /auth/register\` - Register a new user
- \`POST /auth/login\` - Login with email and password
- \`POST /auth/google/login\` - Login with Google OAuth
- \`POST /auth/google/signup\` - Signup with Google OAuth
- \`GET /auth/profile\` - Get user profile
- \`PATCH /auth/profile\` - Update user profile
- \`POST /auth/change-password\` - Change password
- \`POST /auth/request-password-reset\` - Request password reset
- \`POST /auth/reset-password\` - Reset password with token
- \`POST /auth/request-email-verification\` - Request email verification
- \`GET /auth/verify-email\` - Verify email with token
- \`POST /auth/logout\` - Logout user

### Expense Endpoints
- \`POST /expense\` - Create a new expense
- \`GET /expense\` - List expenses with filtering and pagination
- \`GET /expense/:id\` - Get expense by ID
- \`PATCH /expense/:id\` - Update expense
- \`DELETE /expense/:id\` - Delete expense
- \`POST /expense/:id/split\` - Split expense among members
- \`GET /expense/:id/splits\` - Get expense splits
- \`POST /expense/bulk-create\` - Create multiple expenses
- \`PATCH /expense/bulk-update\` - Update multiple expenses
- \`DELETE /expense/bulk-delete\` - Delete multiple expenses

### Group Endpoints
- \`POST /group\` - Create a new group
- \`GET /group\` - List user's groups
- \`GET /group/:id\` - Get group by ID
- \`PATCH /group/:id\` - Update group
- \`DELETE /group/:id\` - Delete group

### Category Endpoints
- \`POST /category\` - Create a new category
- \`GET /category\` - List categories
- \`GET /category/:id\` - Get category by ID
- \`PATCH /category/:id\` - Update category
- \`DELETE /category/:id\` - Delete category

### Payment Method Endpoints
- \`POST /payment-method\` - Create a new payment method
- \`GET /payment-method\` - List payment methods
- \`GET /payment-method/:id\` - Get payment method by ID
- \`PATCH /payment-method/:id\` - Update payment method
- \`DELETE /payment-method/:id\` - Delete payment method

## 🔒 Security Features

### Input Validation
- **Comprehensive Validation**: All inputs are validated using class-validator
- **Type Safety**: Strong TypeScript typing for all DTOs
- **Sanitization**: Automatic input sanitization and whitelisting
- **Error Messages**: Clear, user-friendly validation error messages

### Authentication Security
- **JWT Tokens**: Secure JWT-based authentication
- **Token Expiration**: Configurable token expiration times
- **Password Security**: Strong password requirements and hashing
- **Rate Limiting**: Protection against brute force attacks

### Data Protection
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **Input Sanitization**: Protection against injection attacks
- **Error Handling**: Secure error responses without sensitive data exposure

## 📈 Rate Limits
- **Authentication**: 5 requests per minute for login/register
- **General API**: 1000 requests per hour per user
- **Bulk Operations**: 10 requests per minute

## 🆘 Support
For API support and questions:
- **Documentation**: This Swagger UI
- **GitHub**: https://github.com/your-org/splitbuddy-backend
- **Email**: support@splitbuddyapp.com

## 📄 License
This API is licensed under the MIT License.
    `,
  )
  .setVersion('2.0.0')
  .setContact(
    'SplitBuddy Team',
    'https://splitbuddyapp.com',
    'support@splitbuddyapp.com',
  )
  .setLicense(
    'MIT License',
    'https://opensource.org/licenses/MIT',
  )
  .addServer('http://localhost:5900', 'Local Development')
  .addServer('https://api.splitbuddyapp.com/api/test', 'Test Environment')
  .addServer('https://api.splitbuddyapp.com/api/v1', 'Production Environment')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter your JWT token obtained from login or registration',
      in: 'header',
    },
    'JWT-auth',
  )
  .addTag(
    'Authentication',
    'User registration, login, profile management, and authentication operations',
  )
  .addTag(
    'Expenses',
    'Expense creation, management, splitting, and bulk operations',
  )
  .addTag(
    'Groups',
    'Group creation, management, and member coordination',
  )
  .addTag(
    'Categories',
    'Expense category management and organization',
  )
  .addTag(
    'Payment Methods',
    'Payment method management and tracking',
  )
  .addTag(
    'Notifications',
    'Email and in-app notification management',
  )
  .addTag(
    'User Settings',
    'User preferences, settings, and profile customization',
  )
  .addTag(
    'Transactions',
    'Financial transaction management and history',
  )
  .addTag(
    'Loans',
    'Personal loan tracking and management',
  )
  .addTag(
    'External Users',
    'External user management for guest access',
  )
  .addTag(
    'Plans',
    'Subscription plan management and billing',
  )
  .addTag(
    'System',
    'System health, environment testing, and utility endpoints',
  )
  .build();

/**
 * Swagger Custom Options
 * Enhanced UI configuration and features
 */
export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
    requestInterceptor: (request: any) => {
      // Add default headers for better testing
      request.headers = {
        ...request.headers,
        'Content-Type': 'application/json',
      };
      return request;
    },
    responseInterceptor: (response: any) => {
      // Format responses for better readability
      if (response.body) {
        try {
          response.body = JSON.stringify(JSON.parse(response.body), null, 2);
        } catch (e) {
          // If not JSON, leave as is
        }
      }
      return response;
    },
  },
  customSiteTitle: 'SplitBuddy API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50; font-size: 36px; font-weight: bold; }
    .swagger-ui .info .description { font-size: 16px; line-height: 1.8; color: #34495e; }
    .swagger-ui .info .description h1 { color: #2c3e50; font-size: 28px; margin-top: 30px; margin-bottom: 15px; }
    .swagger-ui .info .description h2 { color: #34495e; font-size: 24px; margin-top: 25px; margin-bottom: 12px; }
    .swagger-ui .info .description h3 { color: #34495e; font-size: 20px; margin-top: 20px; margin-bottom: 10px; }
    .swagger-ui .info .description code { background-color: #f8f9fa; color: #e74c3c; padding: 2px 4px; border-radius: 3px; }
    .swagger-ui .info .description pre { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; }
    .swagger-ui .opblock.opblock-post { border-color: #28a745; background: rgba(40, 167, 69, 0.1); }
    .swagger-ui .opblock.opblock-get { border-color: #007bff; background: rgba(0, 123, 255, 0.1); }
    .swagger-ui .opblock.opblock-put { border-color: #ffc107; background: rgba(255, 193, 7, 0.1); }
    .swagger-ui .opblock.opblock-delete { border-color: #dc3545; background: rgba(220, 53, 69, 0.1); }
    .swagger-ui .opblock.opblock-patch { border-color: #6f42c1; background: rgba(111, 66, 193, 0.1); }
    .swagger-ui .btn.execute { background-color: #28a745; border-color: #28a745; }
    .swagger-ui .btn.execute:hover { background-color: #218838; border-color: #1e7e34; }
    .swagger-ui .scheme-container { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; }
    .swagger-ui .auth-wrapper { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; }
    .swagger-ui .model-box { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; }
    .swagger-ui .response-col_status { font-weight: bold; }
    .swagger-ui .response-col_status.response-200 { color: #28a745; }
    .swagger-ui .response-col_status.response-400 { color: #ffc107; }
    .swagger-ui .response-col_status.response-401 { color: #dc3545; }
    .swagger-ui .response-col_status.response-500 { color: #dc3545; }
    .swagger-ui .model { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; margin: 10px 0; }
    .swagger-ui .model-title { color: #2c3e50; font-weight: bold; }
    .swagger-ui .parameter__name { font-weight: bold; color: #2c3e50; }
    .swagger-ui .parameter__type { color: #6c757d; font-style: italic; }
    .swagger-ui .parameter__deprecated { color: #dc3545; }
    .swagger-ui .parameter__required { color: #dc3545; font-weight: bold; }
    .swagger-ui .response__examples { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 10px; }
    .swagger-ui .response__examples__title { font-weight: bold; color: #2c3e50; }
    .swagger-ui .response__examples__content { background-color: white; border: 1px solid #e9ecef; border-radius: 3px; padding: 10px; }
  `,
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
  ],
};
