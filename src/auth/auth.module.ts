import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Client } from '../entities/client.entity';
import { App } from '../entities/app.entity';
import { JwtStrategy } from './jwt.strategy';
import { NotificationModule } from '../notification/notification.module';
import { NotificationService } from '../notification/notification.service';
// @ts-ignore
const env = require('../../env.js');

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([User, Client, App]),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, NotificationService],
  exports: [AuthService],
})
export class AuthModule {}
