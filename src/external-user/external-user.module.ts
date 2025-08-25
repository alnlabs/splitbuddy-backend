import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalUserController } from './external-user.controller';
import { ExternalUserService } from './external-user.service';
import { ExternalUser } from '../entities/external-user.entity';
import { User } from '../entities/user.entity';
import { UserSettings } from '../entities/user-settings.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExternalUser, User, UserSettings])],
  controllers: [ExternalUserController],
  providers: [ExternalUserService],
  exports: [ExternalUserService],
})
export class ExternalUserModule {}
