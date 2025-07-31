import { Controller, Get, Post, Body } from '@nestjs/common';
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
      const createDataSource = require('./data-source').default;
      const AppDataSource = await createDataSource();
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      await AppDataSource.query('SELECT 1');
      await AppDataSource.destroy();
      return { status: 'success', message: 'Database connection is working!' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @Post('test')
  testEndpoint(@Body() body: any) {
    console.log('[AppController] Test endpoint called with body:', body);
    return { message: 'Test endpoint working', received: body };
  }
}
