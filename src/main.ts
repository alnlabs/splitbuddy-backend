import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalResponseMiddleware } from './global-response.middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env, logEnvironment } from './config/env.config';

// Debug: Log environment variables
logEnvironment();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix based on environment
  const isTestEnv =
    process.env.NODE_ENV === 'test' || process.env.CURRENT_ENV === 'test';
  const globalPrefix = isTestEnv ? 'api/test' : 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  console.log(`🚀 Starting SplitBuddy API with prefix: /${globalPrefix}`);

  // Enable CORS
  app.enableCors({
    origin: env.app.corsOrigin || true, // Use CORS_ORIGIN from env or allow all for development
    credentials: true,
  });

  app.use(globalResponseMiddleware);

  // Add request logging middleware
  app.use((req: any, res: any, next: any) => {
    console.log(`[Request] ${req.method} ${req.url}`, {
      body: req.body,
      headers: req.headers,
    });
    next();
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SplitBuddy API')
    .setDescription(
      `
      # SplitBuddy Backend API Documentation

      ## Overview
      SplitBuddy is a comprehensive expense splitting and financial management API that allows users to:
      - Create and manage expense groups
      - Track expenses and split them among group members
      - Manage categories and payment methods
      - Handle user authentication and profiles
      - Send notifications and reminders

      ## Authentication
      Most endpoints require Bearer token authentication. Include your JWT token in the Authorization header:
      \`Authorization: Bearer <your-token>\`

      ## Getting Started
      1. Register a new user using \`POST /auth/register\`
      2. Login to get your JWT token using \`POST /auth/login\`
      3. Use the token to access protected endpoints

      ## Features
      - **Authentication**: JWT-based auth with Google OAuth support
      - **Expense Management**: Create, update, delete, and split expenses
      - **Group Management**: Create groups and manage members
      - **Categories & Payment Methods**: Organize expenses by categories and payment methods
      - **Balance Tracking**: Track who owes what to whom
      - **Notifications**: Email and in-app notifications
      - **Bulk Operations**: Create, update, and delete multiple records at once

      ## Environment
      - **Development**: http://localhost:5900
      - **Test**: https://api.splitbuddyapp.com/api/test
      - **Production**: https://api.splitbuddyapp.com/api/v1
    `,
    )
    .setVersion('1.0')
    .addServer('http://localhost:5900', 'Local Development')
    .addServer('https://api.splitbuddyapp.com/api/test', 'Test Environment')
    .addServer('https://api.splitbuddyapp.com/api/v1', 'Production Environment')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag(
      'Authentication',
      'User registration, login, and profile management',
    )
    .addTag('Expenses', 'Expense creation, management, and splitting')
    .addTag('Groups', 'Group creation and management')
    .addTag('Categories', 'Expense category management')
    .addTag('Payment Methods', 'Payment method management')
    .addTag('Notifications', 'Email and in-app notifications')
    .addTag('User Settings', 'User preferences and settings')
    .addTag('Transactions', 'Financial transaction management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'SplitBuddy API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
      .swagger-ui .info .description { font-size: 16px; line-height: 1.6; }
    `,
  });

  await app.listen(env.app.port, '0.0.0.0');
}
bootstrap();
