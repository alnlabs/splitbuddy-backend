import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('db-test')
  async dbTest() {
    try {
      const AppDataSource = require('./data-source').default;
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      await AppDataSource.query('SELECT 1');
      return { status: 'success', message: 'Database connection is working!' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
