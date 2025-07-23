import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';
import { Category } from '../entities/category.entity';
import { Payment } from '../entities/payment.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { UserGroup } from '../entities/user-group.entity';
import { UserGroupMember } from '../entities/user-group-member.entity';
import { User } from '../entities/user.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    TypeOrmModule.forFeature([
      Expense,
      ExpenseSplit,
      Category,
      Payment,
      PaymentMethod,
      UserGroup,
      UserGroupMember,
      User,
    ]),
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
