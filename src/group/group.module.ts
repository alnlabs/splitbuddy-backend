import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserGroup } from '../entities/user-group.entity';
import { UserGroupMember } from '../entities/user-group-member.entity';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserGroup,
      UserGroupMember,
      Expense,
      ExpenseSplit,
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}
