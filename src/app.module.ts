import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { ExpenseModule } from './expense/expense.module';
import { CategoryModule } from './category/category.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { GroupModule } from './group/group.module';
import { GroupMemberModule } from './group-member/group-member.module';
// @ts-ignore
const env = require('../env.js');

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false, // use migrations!
      logging: true,
    }),
    AuthModule,
    NotificationModule,
    ExpenseModule,
    CategoryModule,
    PaymentMethodModule,
    GroupModule,
    GroupMemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
