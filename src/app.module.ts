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
// Environment variables are loaded via dotenv in main.ts

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'splitbuddy_db_local',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
