import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalResponseMiddleware } from './global-response.middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// @ts-ignore
const env = require('../env.js');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(globalResponseMiddleware);

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

  await app.listen(env.APP_PORT || 5900);
}
bootstrap();
