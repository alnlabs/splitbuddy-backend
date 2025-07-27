import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalResponseMiddleware } from './global-response.middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(process.cwd(), '.env') });

// Debug: Log environment variables
console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USERNAME:', process.env.DB_USERNAME);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for development
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
    .setDescription('API documentation for SplitBuddy Backend')
    .setVersion('1.0')
    .addServer('http://localhost:5900')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.APP_PORT || 5900, '0.0.0.0');
}
bootstrap();
