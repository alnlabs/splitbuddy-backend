import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ExpenseModule } from './expense/expense.module';
import { NotificationModule } from './notification/notification.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { GroupModule } from './group/group.module';
import { GroupMemberModule } from './group-member/group-member.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { TransactionModule } from './transaction/transaction.module';
import { DefaultDataModule } from './services/default-data.module';
import { UserModule } from './user/user.module';
import { PlansModule } from './plans/plans.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { env } from './config/env.config';

const imports = [
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: env.database.host,
    port: env.database.port,
    username: env.database.username,
    password: env.database.password,
    database: env.database.database,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: env.app.nodeEnv !== 'production',
    logging: env.app.nodeEnv === 'development',
  }),
  AuthModule,
  CategoryModule,
  ExpenseModule,
  NotificationModule,
  PaymentMethodModule,
  GroupModule,
  GroupMemberModule,
  UserSettingsModule,
  TransactionModule,
  DefaultDataModule,
  UserModule,
  PlansModule,
];

// Only add BullModule if Redis is configured
if (env.redis.host && env.redis.port) {
  imports.push(
    BullModule.forRoot({
      redis: {
        host: env.redis.host,
        port: env.redis.port,
      },
    })
  );
}

@Module({
  imports,
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
