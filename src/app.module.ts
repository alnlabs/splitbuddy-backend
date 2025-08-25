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
import { LoanModule } from './loan/loan.module';
import { DefaultDataModule } from './services/default-data.module';
import { UserModule } from './user/user.module';
import { PlansModule } from './plans/plans.module';
import { ExternalUserModule } from './external-user/external-user.module';
import { DopplerModule } from './services/doppler.module';
import { DopplerService } from './services/doppler.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { env, createEnvironmentConfig } from './config/env.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DopplerModule],
      useFactory: async (dopplerService: DopplerService) => {
        const config = createEnvironmentConfig(dopplerService);
        return {
          type: 'postgres',
          host: config.database.host,
          port: config.database.port,
          username: config.database.username,
          password: config.database.password,
          database: config.database.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.app.nodeEnv !== 'production',
          logging: config.app.nodeEnv === 'development',
        };
      },
      inject: [DopplerService],
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
    LoanModule,
    DefaultDataModule,
    UserModule,
    PlansModule,
    ExternalUserModule,
    DopplerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ENV_CONFIG',
      useFactory: (dopplerService: DopplerService) => {
        return createEnvironmentConfig(dopplerService);
      },
      inject: [DopplerService],
    },
  ],
})
export class AppModule {}
