# Google Authentication Setup Guide - Backend

This guide will help you configure Google Authentication for the SplitBuddy backend in production.

## 🔧 Environment Variables Required

Add these environment variables to your production environment:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-web-client-secret
GOOGLE_CALLBACK_URL=https://api.splitbuddyapp.com/api/v1/auth/google/callback

# CORS Configuration (important for Google Auth)
CORS_ORIGIN=https://splitbuddyapp.com,https://www.splitbuddyapp.com
```

## 📝 Google Cloud Console Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the following APIs:
   - Google+ API
   - Google Sign-In API
   - Google Identity API

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**

### Step 3: Configure Web Application Client

**Important: The backend uses the Web Client ID for token verification**

Create a **Web Application** OAuth client with these settings:

```
Application type: Web application
Name: SplitBuddy Backend
Authorized JavaScript origins:
  - https://api.splitbuddyapp.com
  - https://splitbuddyapp.com
  - https://www.splitbuddyapp.com

Authorized redirect URIs:
  - https://api.splitbuddyapp.com/api/v1/auth/google/callback
```

### Step 4: Get Credentials

After creating the OAuth client:
1. Copy the **Client ID** → Use as `GOOGLE_CLIENT_ID`
2. Copy the **Client Secret** → Use as `GOOGLE_CLIENT_SECRET`

## 🔍 Backend Implementation Details

### Current Implementation Status

The backend currently has these Google Auth endpoints:

```typescript
POST /api/v1/auth/google/login    # Google login
POST /api/v1/auth/google/verify   # Token verification
```

### Token Verification Process

```typescript
// Current implementation in AuthService
async googleVerify(idToken: string): Promise<any> {
  const ticket = await this.googleClient.verifyIdToken({
    idToken,
    audience: env.google.clientId, // Uses GOOGLE_CLIENT_ID (Web Client)
  });
  return ticket.getPayload();
}
```

### Google Login Flow

```typescript
async googleLogin(googleAuthDto: GoogleAuthDto): Promise<any> {
  const { idToken } = googleAuthDto;
  
  // 1. Verify token with Google
  const payload = await this.googleVerify(idToken);
  const { email, given_name, family_name } = payload;

  // 2. Find or create user
  let user = await this.userRepository.findOne({ where: { email } });
  
  if (!user) {
    // Auto-create user from Google data
    user = await this.userRepository.save({
      email,
      firstName: given_name,
      lastName: family_name,
      username: email,
      loginType: 'GOOGLE',
    });
  }

  // 3. Generate JWT token
  const jwtPayload = { email: user.email, sub: user.id };
  const token = this.jwtService.sign(jwtPayload);

  return {
    access_token: token,
    user: { /* user data */ }
  };
}
```

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid Google token" Error

**Cause**: Backend trying to verify mobile app token with wrong audience

**Solution**: Ensure backend uses the **Web Client ID** for verification:

```bash
# ❌ Wrong - Using Android Client ID
GOOGLE_CLIENT_ID=123456-android-client-id.apps.googleusercontent.com

# ✅ Correct - Using Web Client ID  
GOOGLE_CLIENT_ID=123456-web-client-id.apps.googleusercontent.com
```

### Issue 2: CORS Issues

**Cause**: Frontend domain not in CORS origins

**Solution**: Add all frontend domains to CORS:

```bash
CORS_ORIGIN=https://splitbuddyapp.com,https://www.splitbuddyapp.com,https://app.splitbuddyapp.com
```

### Issue 3: Callback URL Mismatch

**Cause**: Google Console callback URL doesn't match backend

**Solution**: Ensure exact match:
- Google Console: `https://api.splitbuddyapp.com/api/v1/auth/google/callback`
- Environment: `GOOGLE_CALLBACK_URL=https://api.splitbuddyapp.com/api/v1/auth/google/callback`

## 🔒 Security Best Practices

### 1. Environment Variable Security

```bash
# Use secure secrets management
# Never commit these to version control

# Production example:
GOOGLE_CLIENT_ID=123456789-abcdef123456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdef123456789
```

### 2. Token Validation

The backend properly validates tokens with Google's servers:

```typescript
// ✅ Good - Verifies with Google servers
const ticket = await this.googleClient.verifyIdToken({
  idToken,
  audience: env.google.clientId,
});

// ❌ Bad - Never trust tokens without verification
```

### 3. User Creation Security

```typescript
// ✅ Secure user creation
user = this.userRepository.create({
  email: payload.email,           // From verified Google token
  firstName: payload.given_name,  // From verified Google token
  lastName: payload.family_name,  // From verified Google token
  username: payload.email,
  loginType: 'GOOGLE',           // Track login method
  activated: true,               // Google emails are pre-verified
});
```

## 🧪 Testing Google Auth

### 1. Test Token Verification

```bash
# Test with curl
curl -X POST https://api.splitbuddyapp.com/api/v1/auth/google/verify \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-google-id-token"}'
```

### 2. Test Login Flow

```bash
# Test complete login
curl -X POST https://api.splitbuddyapp.com/api/v1/auth/google/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-google-id-token"}'
```

### 3. Validate Environment

```bash
# Check if environment variables are loaded
curl https://api.splitbuddyapp.com/api/v1/db-test
# Should return success if environment is properly configured
```

## 📊 Monitoring & Debugging

### Enable Detailed Logging

Update the backend to log Google Auth events:

```typescript
// Add to AuthService.googleLogin()
console.log('🔐 Google Auth attempt:', { 
  email: payload.email,
  userExists: !!existingUser,
  timestamp: new Date().toISOString()
});
```

### Common Log Messages

```bash
# Success
✅ Google Sign-In configuration completed
✅ Token verification successful
✅ User created/found and logged in

# Errors
❌ GOOGLE_WEB_CLIENT_ID is not defined
❌ Invalid Google token
❌ Google authentication failed
```

## 🚀 Deployment Checklist

- [ ] Google Cloud project created and APIs enabled
- [ ] Web Application OAuth client created
- [ ] `GOOGLE_CLIENT_ID` set to Web Client ID (not Android)
- [ ] `GOOGLE_CLIENT_SECRET` set correctly
- [ ] `GOOGLE_CALLBACK_URL` matches Google Console
- [ ] `CORS_ORIGIN` includes all frontend domains
- [ ] Backend endpoints respond correctly:
  - `POST /api/v1/auth/google/login`
  - `POST /api/v1/auth/google/verify`
- [ ] Test with real Google account
- [ ] Monitor logs for errors

## 🔗 Related Documentation

- [Google Identity Documentation](https://developers.google.com/identity)
- [OAuth 2.0 Setup Guide](https://support.google.com/cloud/answer/6158849)
- [Mobile App Google Auth Setup](../SplitBuddyMobile/GOOGLE_AUTH_MOBILE_SETUP.md)