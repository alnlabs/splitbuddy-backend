// Environment configuration for SplitBuddy Backend
// Uses Doppler SDK for environment variable management
// Falls back to process.env for local development

import { DopplerService } from '../services/doppler.service';

export interface EnvironmentConfig {
  // Database Configuration
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };

  // Redis Configuration
  redis: {
    host: string;
    port: number;
  };

  // JWT Configuration
  jwt: {
    secret: string;
  };

  // SMTP Configuration
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };

  // Google OAuth Configuration
  google: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
    androidClientId: string;
  };

  // App Configuration
  app: {
    port: number;
    nodeEnv: string;
    corsOrigin: string;
    corsCredentials: boolean;
    corsMaxAge: number;
  };

  // Queue Configuration
  queues: {
    email: string;
    notification: string;
  };
}

// Create a function to get environment configuration with Doppler support
export function createEnvironmentConfig(
  dopplerService?: DopplerService,
): EnvironmentConfig {
  const getEnv = (key: string, fallback: string = ''): string => {
    if (dopplerService && dopplerService.isDopplerAvailable()) {
      return dopplerService.getSecret(key, fallback);
    }
    return process.env[key] || fallback;
  };

  return {
    // Database Configuration
    database: {
      host: getEnv('DB_HOST', 'localhost'),
      port: parseInt(getEnv('DB_PORT', '5432')),
      username: getEnv('DB_USERNAME', 'postgres'),
      password: getEnv('DB_PASSWORD', 'postgres'),
      database: getEnv('DB_DATABASE', 'splitbuddy_db_local'),
    },

    // Redis Configuration
    redis: {
      host: getEnv('REDIS_HOST', 'localhost'),
      port: parseInt(getEnv('REDIS_PORT', '6379')),
    },

    // JWT Configuration
    jwt: {
      secret: getEnv('JWT_SECRET', 'fallback-secret-key'),
    },

    // SMTP Configuration
    smtp: {
      host: getEnv('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(getEnv('SMTP_PORT', '587')),
      user: getEnv('SMTP_USER', ''),
      pass: getEnv('SMTP_PASS', ''),
      from: getEnv('SMTP_FROM', ''),
    },

    // Google OAuth Configuration
    google: {
      clientId: getEnv('GOOGLE_CLIENT_ID', ''),
      clientSecret: getEnv('GOOGLE_CLIENT_SECRET', ''),
      callbackUrl: getEnv(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:5900/api/v1/auth/google/callback',
      ),
      androidClientId: getEnv('GOOGLE_ANDROID_CLIENT_ID', ''),
    },

    // App Configuration
    app: {
      port: parseInt(getEnv('PORT', getEnv('APP_PORT', '5900'))),
      nodeEnv: getEnv('NODE_ENV', 'development'),
      corsOrigin: getEnv(
        'CORS_ORIGIN',
        'http://localhost:3000,http://localhost:3001,http://localhost:8080,http://localhost:4700,http://localhost:5300,http://localhost:5400,http://localhost:5500,http://localhost:5600,http://localhost:5700',
      ),
      corsCredentials: getEnv('CORS_CREDENTIALS', 'false') === 'true',
      corsMaxAge: parseInt(getEnv('CORS_MAX_AGE', '86400')),
    },

    // Queue Configuration
    queues: {
      email: getEnv('EMAIL_QUEUE_NAME', 'email-queue'),
      notification: getEnv('NOTIFICATION_QUEUE_NAME', 'notification-queue'),
    },
  };
}

// Default environment configuration (for backward compatibility)
export const env: EnvironmentConfig = createEnvironmentConfig();

// Debug: Log environment variables (without sensitive data)
export const logEnvironment = (dopplerService?: DopplerService) => {
  const config = createEnvironmentConfig(dopplerService);

  console.log('Environment Configuration:');
  console.log('Database:', {
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    database: config.database.database,
    password: config.database.password ? '***' : 'undefined',
  });
  console.log('Redis:', config.redis);
  console.log('App:', config.app);
  console.log('SMTP Host:', config.smtp.host);
  console.log(
    'Google Client ID:',
    config.google.clientId ? '***' : 'undefined',
  );
  console.log('Queues:', config.queues);

  if (dopplerService) {
    console.log(
      'Doppler Status:',
      dopplerService.isDopplerAvailable() ? 'Available' : 'Not Available',
    );
  }
};

// Export individual variables for backward compatibility
export const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  REDIS_HOST,
  REDIS_PORT,
  JWT_SECRET,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  APP_PORT,
  PORT,
  NODE_ENV,
  CORS_ORIGIN,
  EMAIL_QUEUE_NAME,
  NOTIFICATION_QUEUE_NAME,
} = {
  DB_HOST: env.database.host,
  DB_PORT: env.database.port.toString(),
  DB_USERNAME: env.database.username,
  DB_PASSWORD: env.database.password,
  DB_DATABASE: env.database.database,
  REDIS_HOST: env.redis.host,
  REDIS_PORT: env.redis.port.toString(),
  JWT_SECRET: env.jwt.secret,
  SMTP_HOST: env.smtp.host,
  SMTP_PORT: env.smtp.port.toString(),
  SMTP_USER: env.smtp.user,
  SMTP_PASS: env.smtp.pass,
  SMTP_FROM: env.smtp.from,
  GOOGLE_CLIENT_ID: env.google.clientId,
  GOOGLE_CLIENT_SECRET: env.google.clientSecret,
  GOOGLE_CALLBACK_URL: env.google.callbackUrl,
  APP_PORT: env.app.port.toString(),
  PORT: env.app.port.toString(),
  NODE_ENV: env.app.nodeEnv,
  CORS_ORIGIN: env.app.corsOrigin,
  EMAIL_QUEUE_NAME: env.queues.email,
  NOTIFICATION_QUEUE_NAME: env.queues.notification,
};
