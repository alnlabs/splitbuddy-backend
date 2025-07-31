import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') });

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
  };

  // App Configuration
  app: {
    port: number;
    nodeEnv: string;
    corsOrigin: string;
  };

  // Queue Configuration
  queues: {
    email: string;
    notification: string;
  };
}

export const env: EnvironmentConfig = {
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'splitbuddy_db_local',
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
  },

  // SMTP Configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:5900/api/v1/auth/google/callback',
  },

  // App Configuration
  app: {
    port: parseInt(process.env.PORT || process.env.APP_PORT || '5900'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Queue Configuration
  queues: {
    email: process.env.EMAIL_QUEUE_NAME || 'email-queue',
    notification: process.env.NOTIFICATION_QUEUE_NAME || 'notification-queue',
  },
};

// Debug: Log environment variables (without sensitive data)
export const logEnvironment = () => {
  console.log('Environment Configuration:');
  console.log('Database:', {
    host: env.database.host,
    port: env.database.port,
    username: env.database.username,
    database: env.database.database,
    password: env.database.password ? '***' : 'undefined',
  });
  console.log('Redis:', env.redis);
  console.log('App:', env.app);
  console.log('SMTP Host:', env.smtp.host);
  console.log('Google Client ID:', env.google.clientId ? '***' : 'undefined');
  console.log('Queues:', env.queues);
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
