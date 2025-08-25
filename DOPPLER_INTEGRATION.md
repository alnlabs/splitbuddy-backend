# Doppler Integration Guide for SplitBuddy Backend

This guide explains how to use Doppler for environment variable management in the SplitBuddy backend project.

## Overview

The SplitBuddy backend now supports two approaches for environment variable management:

1. **Doppler SDK Integration** (Recommended): Uses the Doppler Node.js SDK to fetch secrets directly in the application
2. **Doppler CLI Integration**: Uses the Doppler CLI to inject environment variables at runtime

## Prerequisites

1. **Doppler Account**: Sign up at [doppler.com](https://doppler.com)
2. **Doppler CLI**: Install the CLI following the [official guide](https://docs.doppler.com/docs/install-cli)
3. **Doppler Project**: Create a project in Doppler dashboard

## Setup

### 1. Install Doppler CLI (if not already installed)

```bash
# macOS
brew install dopplerhq/cli/doppler

# Or use the shell script
(curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sh
```

### 2. Authenticate with Doppler

```bash
doppler login
```

### 3. Setup Project Configuration

```bash
# Navigate to your project directory
cd /path/to/splitbuddy-backend

# Setup Doppler for this project
doppler setup
```

### 4. Configure Environments

Create the following environments in your Doppler project:

- `dev` - Development environment
- `test` - Testing environment
- `prod` - Production environment

## Usage

### Method 1: Doppler SDK (Recommended)

The application automatically uses the Doppler SDK when `DOPPLER_TOKEN` is available.

#### Environment Variables Required:

```bash
# Required for Doppler SDK
DOPPLER_TOKEN=dp.xxx.yyy
DOPPLER_PROJECT=splitbuddy-backend  # Optional, defaults to 'splitbuddy-backend'
DOPPLER_CONFIG=dev                   # Optional, defaults to 'dev'
```

#### Start the Application:

```bash
# Start with Doppler SDK (requires DOPPLER_TOKEN)
npm run start:dev

# Or use the convenience script
npm run start:doppler:dev
```

### Method 2: Doppler CLI

#### Start with CLI Injection:

```bash
# Development
doppler run --project=splitbuddy-backend --config=dev -- npm run start:dev

# Or use the convenience script
npm run start:doppler:dev
```

#### Docker with Doppler:

```bash
# Development
npm run docker:doppler:dev

# Production
npm run docker:doppler:prod
```

## Environment Variables

The following environment variables are managed by Doppler:

### Database Configuration

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name

### Redis Configuration

- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port

### JWT Configuration

- `JWT_SECRET` - JWT secret key

### SMTP Configuration

- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From email address

### Google OAuth Configuration

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_CALLBACK_URL` - OAuth callback URL
- `GOOGLE_ANDROID_CLIENT_ID` - Android client ID

### App Configuration

- `PORT` / `APP_PORT` - Application port
- `NODE_ENV` - Node environment
- `CORS_ORIGIN` - CORS origins
- `CORS_CREDENTIALS` - CORS credentials
- `CORS_MAX_AGE` - CORS max age

### Queue Configuration

- `EMAIL_QUEUE_NAME` - Email queue name
- `NOTIFICATION_QUEUE_NAME` - Notification queue name

## Docker Integration

### Development

```bash
# Start with Doppler
npm run docker:doppler:dev

# Or manually
doppler run -- docker-compose -f docker-compose.dev.yml up --build -d
```

### Production

```bash
# Start with Doppler
npm run docker:doppler:prod

# Or manually
doppler run -- docker-compose -f docker-compose.prod.yml up --build -d
```

## Fallback Behavior

The application gracefully falls back to local environment variables when:

1. `DOPPLER_TOKEN` is not provided
2. Doppler SDK fails to initialize
3. Doppler CLI is not available

This ensures the application works in all environments, including local development without Doppler.

## Troubleshooting

### Common Issues

1. **"DOPPLER_TOKEN not found"**
   - Ensure you have set the `DOPPLER_TOKEN` environment variable
   - Verify the token is valid in your Doppler dashboard

2. **"Not authenticated with Doppler"**
   - Run `doppler login` to authenticate
   - Check your authentication status with `doppler me`

3. **"Project not found"**
   - Verify the project exists in your Doppler dashboard
   - Check the project name in `doppler.yaml` or `DOPPLER_PROJECT` env var

4. **"Config not found"**
   - Ensure the config (dev/test/prod) exists in your project
   - Create the config in the Doppler dashboard if needed

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will show detailed logs about Doppler initialization and secret fetching.

## Security Best Practices

1. **Never commit secrets**: All secrets are stored in Doppler, not in the codebase
2. **Use different tokens**: Use different service tokens for different environments
3. **Rotate tokens regularly**: Regularly rotate your Doppler service tokens
4. **Limit access**: Use Doppler's access controls to limit who can access secrets
5. **Audit access**: Regularly review access logs in Doppler dashboard

## Migration from .env Files

If you're migrating from `.env` files:

1. **Export existing variables**: Export your current environment variables to Doppler
2. **Update scripts**: Use the new Doppler-enabled scripts
3. **Remove .env files**: Delete local `.env` files (they're already in `.gitignore`)
4. **Test thoroughly**: Test all environments to ensure everything works

## Additional Resources

- [Doppler Documentation](https://docs.doppler.com/)
- [Doppler CLI Guide](https://docs.doppler.com/docs/cli)
- [Doppler Node.js SDK](https://docs.doppler.com/docs/sdk-javascript)
- [Doppler Docker Integration](https://docs.doppler.com/docs/docker)
