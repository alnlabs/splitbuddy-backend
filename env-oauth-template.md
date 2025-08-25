# Updated Environment Variables with Platform-Specific OAuth

## New OAuth Environment Variables

### Web OAuth Configuration

```bash
# Web Client ID (for web applications)
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com

# Web Callback URL
GOOGLE_WEB_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback
```

### Android OAuth Configuration

```bash
# Android Client ID (for Android apps)
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Android Callback URL
GOOGLE_ANDROID_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect
```

### iOS OAuth Configuration

```bash
# iOS Client ID (for iOS apps)
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com

# iOS Callback URL
GOOGLE_IOS_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect
```

### Shared OAuth Configuration

```bash
# Client Secret (shared across all platforms)
GOOGLE_CLIENT_SECRET=your-client-secret

# Backward Compatibility (uses web client ID)
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback
```

## Complete Environment Configuration

### Development Environment (.env.dev)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5434
DB_USERNAME=splitbuddy_user_dev
DB_PASSWORD=SplitBuddy2024!Dev
DB_DATABASE=splitbuddy_dev

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=dev-jwt-secret-not-secure

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Google OAuth Configuration - Web
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_WEB_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback

# Google OAuth Configuration - Android
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Google OAuth Configuration - iOS
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_IOS_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Google OAuth Configuration - Shared
GOOGLE_CLIENT_SECRET=your-client-secret

# Google OAuth Configuration - Backward Compatibility
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CALLBACK_URL=http://localhost:5900/api/v1/auth/google/callback

# App Configuration
APP_PORT=5900
PORT=5900
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Queue Configuration
EMAIL_QUEUE_NAME=email-queue-dev
NOTIFICATION_QUEUE_NAME=notification-queue-dev
```

### Testing Environment (.env.test)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5435
DB_USERNAME=splitbuddy_user_test
DB_PASSWORD=SplitBuddy2024!Test
DB_DATABASE=splitbuddy_test

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6380

# JWT Configuration
JWT_SECRET=test-jwt-secret-not-secure

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=test-email@gmail.com
SMTP_PASS=test-app-password
SMTP_FROM=test-email@gmail.com

# Google OAuth Configuration - Web
GOOGLE_WEB_CLIENT_ID=your-test-web-client-id.apps.googleusercontent.com
GOOGLE_WEB_CALLBACK_URL=http://localhost:5901/api/v1/auth/google/callback

# Google OAuth Configuration - Android
GOOGLE_ANDROID_CLIENT_ID=your-test-android-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Google OAuth Configuration - iOS
GOOGLE_IOS_CLIENT_ID=your-test-ios-client-id.apps.googleusercontent.com
GOOGLE_IOS_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Google OAuth Configuration - Shared
GOOGLE_CLIENT_SECRET=your-test-client-secret

# Google OAuth Configuration - Backward Compatibility
GOOGLE_CLIENT_ID=your-test-web-client-id.apps.googleusercontent.com
GOOGLE_CALLBACK_URL=http://localhost:5901/api/v1/auth/google/callback

# App Configuration
APP_PORT=5901
PORT=5901
NODE_ENV=test
CORS_ORIGIN=http://localhost:3001

# Queue Configuration
EMAIL_QUEUE_NAME=email-queue-test
NOTIFICATION_QUEUE_NAME=notification-queue-test
```

### Production Environment (.env.prod)

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_prod
DB_PASSWORD=SplitBuddy2024!Secure
DB_DATABASE=splitbuddy_prod

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=prod-jwt-secret-very-secure

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=prod-email@gmail.com
SMTP_PASS=prod-app-password
SMTP_FROM=prod-email@gmail.com

# Google OAuth Configuration - Web
GOOGLE_WEB_CLIENT_ID=your-prod-web-client-id.apps.googleusercontent.com
GOOGLE_WEB_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback

# Google OAuth Configuration - Android
GOOGLE_ANDROID_CLIENT_ID=your-prod-android-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Google OAuth Configuration - iOS
GOOGLE_IOS_CLIENT_ID=your-prod-ios-client-id.apps.googleusercontent.com
GOOGLE_IOS_CALLBACK_URL=com.splitbuddy.app:/oauth2redirect

# Google OAuth Configuration - Shared
GOOGLE_CLIENT_SECRET=your-prod-client-secret

# Google OAuth Configuration - Backward Compatibility
GOOGLE_CLIENT_ID=your-prod-web-client-id.apps.googleusercontent.com
GOOGLE_CALLBACK_URL=https://your-domain.com/api/v1/auth/google/callback

# App Configuration
APP_PORT=5900
PORT=5900
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# Queue Configuration
EMAIL_QUEUE_NAME=email-queue-prod
NOTIFICATION_QUEUE_NAME=notification-queue-prod
```

## Usage Instructions

### 1. Update Doppler Configuration

```bash
# Update OAuth configs for development
./scripts/update-oauth-configs.sh --env dev

# Update OAuth configs for testing
./scripts/update-oauth-configs.sh --env test

# Update OAuth configs for production
./scripts/update-oauth-configs.sh --env prod
```

### 2. Use in Your Application

```javascript
// In your auth service, use platform-specific client IDs
const getGoogleClientId = (platform) => {
  switch (platform) {
    case 'web':
      return process.env.GOOGLE_WEB_CLIENT_ID;
    case 'android':
      return process.env.GOOGLE_ANDROID_CLIENT_ID;
    case 'ios':
      return process.env.GOOGLE_IOS_CLIENT_ID;
    default:
      return process.env.GOOGLE_CLIENT_ID; // fallback to web
  }
};

// Get callback URL for platform
const getGoogleCallbackUrl = (platform) => {
  switch (platform) {
    case 'web':
      return process.env.GOOGLE_WEB_CALLBACK_URL;
    case 'android':
      return process.env.GOOGLE_ANDROID_CALLBACK_URL;
    case 'ios':
      return process.env.GOOGLE_IOS_CALLBACK_URL;
    default:
      return process.env.GOOGLE_CALLBACK_URL; // fallback to web
  }
};
```

### 3. Deploy with Updated Configs

```bash
# Deploy to development
./scripts/deploy-with-doppler.sh --env dev

# Deploy to testing
./scripts/deploy-with-doppler.sh --env test

# Deploy to production
./scripts/deploy-with-doppler.sh --env prod
```

## Benefits

1. **Platform-Specific Security**: Each platform has its own client ID
2. **Better Security**: Separate credentials for different platforms
3. **Platform Features**: Android and iOS can use platform-specific OAuth features
4. **Backward Compatibility**: Existing code still works with fallback variables
5. **Easy Management**: All configs managed through Doppler
6. **Environment Isolation**: Different configs for dev, test, and prod
