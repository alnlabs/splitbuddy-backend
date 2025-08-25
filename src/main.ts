import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalResponseMiddleware } from './global-response.middleware';
import { SwaggerModule } from '@nestjs/swagger';
import { env, logEnvironment } from './config/env.config';
import { ValidationPipe } from '@nestjs/common';
import { swaggerConfig, swaggerCustomOptions } from './config/swagger.config';

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

  // Global validation pipe for enhanced DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 400,
    }),
  );

  // Enhanced CORS Configuration
  const corsOrigins = env.app.corsOrigin
    ? env.app.corsOrigin.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'http://localhost:4700',
        'http://localhost:5300',
        'http://localhost:5400',
        'http://localhost:5500',
        'http://localhost:5600',
        'http://localhost:5700',
      ];

  console.log('🌐 CORS Configuration:', {
    origins: corsOrigins,
    credentials: env.app.corsCredentials,
    maxAge: env.app.corsMaxAge,
    environment: env.app.nodeEnv,
  });

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        return callback(null, true);
      }

      // For development, allow all origins
      if (env.app.nodeEnv === 'development') {
        return callback(null, true);
      }

      console.log(`🚫 CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: env.app.corsCredentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'Cache-Control',
      'Pragma',
      'X-Requested-With',
      'X-HTTP-Method-Override',
    ],
    exposedHeaders: ['Content-Length', 'X-Total-Count', 'X-Pagination-Count'],
    maxAge: env.app.corsMaxAge,
  });

  // Add security headers to prevent CORS issues with popups
  app.use((req: any, res: any, next: any) => {
    // Remove Cross-Origin-Opener-Policy header to allow popups for OAuth
    res.removeHeader('Cross-Origin-Opener-Policy');

    // Set permissive headers for OAuth flows
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    next();
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

  // Enhanced Swagger setup with comprehensive documentation
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [],
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api/docs', app, document, swaggerCustomOptions);

  console.log(`📚 Swagger documentation available at: http://localhost:${env.app.port}/api/docs`);

  await app.listen(env.app.port, '0.0.0.0');
}
bootstrap();
