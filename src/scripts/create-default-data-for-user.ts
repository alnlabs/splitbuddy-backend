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

    // Get user ID from command line arguments
    const userId = process.argv[2];

    if (!userId) {
      console.error('❌ Please provide a user ID as an argument');
      console.log('Usage: npm run create-default-data-for-user <userId>');
      process.exit(1);
    }

    // Find the user
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      console.error(`❌ User with ID ${userId} not found`);
      process.exit(1);
    }

    console.log(`Creating default data for user: ${user.email} (${user.id})`);

    try {
      await defaultDataService.createDefaultDataForUser(user.id);
      console.log(
        `✅ Default data created successfully for user: ${user.email}`,
      );
    } catch (error) {
      console.error(
        `❌ Failed to create default data for user ${user.email}:`,
        error.message,
      );
      process.exit(1);
    }

    console.log('Default data creation completed!');
  } catch (error) {
    console.error('Error creating default data:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
