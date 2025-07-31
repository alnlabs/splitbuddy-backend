import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DefaultDataService } from '../services/default-data.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const defaultDataService = app.get(DefaultDataService);
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    // Get all users
    const users = await userRepository.find();
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Creating default data for user: ${user.email} (${user.id})`);
      try {
        await defaultDataService.createDefaultDataForUser(user.id);
        console.log(`✅ Default data created for user: ${user.email}`);
      } catch (error) {
        console.error(
          `❌ Failed to create default data for user ${user.email}:`,
          error.message,
        );
      }
    }

    console.log('Default data creation completed!');
  } catch (error) {
    console.error('Error creating default data:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
