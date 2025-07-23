import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalResponseMiddleware } from './global-response.middleware';
// @ts-ignore
const env = require('../env.js');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(globalResponseMiddleware);
  await app.listen(env.APP_PORT || 5900);
}
bootstrap();
