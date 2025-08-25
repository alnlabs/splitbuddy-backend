import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DopplerService } from './services/doppler.service';
import { createEnvironmentConfig } from './config/env.config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dopplerService: DopplerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-test')
  async testDatabase() {
    return {
      success: true,
      data: {
        status: 'success',
        message: 'Database connection is working!',
      },
      message: null,
      error: null,
    };
  }

  @Get('env-test')
  async testEnvironment() {
    const config = createEnvironmentConfig(this.dopplerService);

    return {
      success: true,
      data: {
        dopplerAvailable: this.dopplerService.isDopplerAvailable(),
        dockerEnv: process.env.DOCKER_ENV,
        nodeEnv: process.env.NODE_ENV,
        database: {
          host: config.database.host,
          port: config.database.port,
          username: config.database.username,
          database: config.database.database,
          password: config.database.password ? '***' : 'undefined',
        },
        redis: config.redis,
        app: config.app,
        google: {
          clientId: config.google.clientId ? '***' : 'undefined',
          clientSecret: config.google.clientSecret ? '***' : 'undefined',
          callbackUrl: config.google.callbackUrl,
          androidClientId: config.google.androidClientId ? '***' : 'undefined',
        },
      },
      message: 'Environment configuration test',
      error: null,
    };
  }
}
