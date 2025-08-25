import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';
import { NotificationService } from '../notification/notification.service';
import { UserGroupMember } from '../entities/user-group-member.entity';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(ExpenseSplit)
    private readonly splitRepo: Repository<ExpenseSplit>,
    @InjectRepository(UserGroupMember)
    private readonly groupMemberRepo: Repository<UserGroupMember>,
    private readonly notificationService: NotificationService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: any) {
    const expense = this.expenseRepo.create(dto);
    await this.expenseRepo.save(expense);
    // Notify group members (except creator)
    const members = await this.groupMemberRepo.find({
      where: { groupId: dto.groupId, status: 'ACTIVE' },
    });
    const notifyMembers = members.filter((m) => m.userId !== dto.addedBy);
    for (const member of notifyMembers) {
      const content = `A new expense was added to your group: ${dto.description || 'No description'} (Amount: ${dto.amount})`;
      if (member.userId) {
        await this.notificationService.sendInApp(member.userId, content);
      }
      if (member.email) {
        await this.notificationService.sendEmail(
          member.email,
          'New Group Expense',
          content,
        );
      }
    }
    return expense;
  }

  async getById(id: string) {
    return this.expenseRepo.findOne({ where: { id } });
  }

  async list(
    groupId?: string,
    userId?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: any = {};
    if (groupId) where.groupId = groupId;
    if (userId) where.addedBy = userId;

    // Ensure page and limit are within valid ranges
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));

    const skip = (page - 1) * limit;

    const [items, total] = await this.expenseRepo.findAndCount({
      where,
      order: { date: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async update(id: string, dto: any) {
    await this.expenseRepo.update(id, dto);
    const expense = await this.getById(id);
    // Notify group members (except updater)
    if (expense) {
      const members = await this.groupMemberRepo.find({
        where: { groupId: expense.groupId, status: 'ACTIVE' },
      });
      const notifyMembers = members.filter((m) => m.userId !== dto.addedBy);
      for (const member of notifyMembers) {
        const content = `An expense was updated in your group: ${expense.description || 'No description'} (Amount: ${expense.amount})`;
        if (member.userId) {
          await this.notificationService.sendInApp(member.userId, content);
        }
        if (member.email) {
          await this.notificationService.sendEmail(
            member.email,
            'Group Expense Updated',
            content,
          );
        }
      }
    }
    return expense;
  }

  async delete(id: string) {
    const expense = await this.getById(id);
    await this.expenseRepo.delete(id);
    // Notify group members
    if (expense) {
      const members = await this.groupMemberRepo.find({
        where: { groupId: expense.groupId, status: 'ACTIVE' },
      });
      for (const member of members) {
        const content = `An expense was deleted from your group: ${expense.description || 'No description'} (Amount: ${expense.amount})`;
        if (member.userId) {
          await this.notificationService.sendInApp(member.userId, content);
        }
        if (member.email) {
          await this.notificationService.sendEmail(
            member.email,
            'Group Expense Deleted',
            content,
          );
        }
      }
    }
    return { deleted: true };
  }

  async bulkCreate(expenses: any[]) {
    if (Array.isArray(expenses[0])) {
      throw new Error(
        'Input to bulkCreate must be a flat array of expense objects',
      );
    }
    return this.expenseRepo.save(
      expenses.map((dto) => this.expenseRepo.create(dto)).flat(),
    );
  }

  async bulkUpdate(updates: { id: string; data: any }[]) {
    const results = [];
    for (const { id, data } of updates) {
      await this.expenseRepo.update(id, data);
      results.push(await this.getById(id));
    }
    return results;
  }

  async bulkDelete(ids: string[]) {
    await this.expenseRepo.delete(ids);
    return { deleted: ids };
  }

  async splitExpense(expenseId: string, splits: any[]) {
    if (Array.isArray(splits[0])) {
      throw new Error(
        'Input to splitExpense must be a flat array of split objects',
      );
    }

    // Get the expense to check the group type
    const expense = await this.expenseRepo.findOne({
      where: { id: expenseId },
    });
    if (!expense) {
      throw new Error('Expense not found');
    }

    // Check if the group is unshared (Personal)
    const group = await this.dataSource
      .createQueryBuilder()
      .select(['id', 'is_shared'])
      .from('user_groups', 'g')
      .where('g.id = :groupId', { groupId: expense.groupId })
      .getRawOne();

    if (group && !group.is_shared) {
      throw new Error(
        'Cannot split expenses in unshared (Personal) groups. These groups are for tracking purposes only.',
      );
    }

    const splitEntities = splits.map((split) =>
      this.splitRepo.create({ ...split, expenseId }),
    );
    const savedSplits = await this.splitRepo.save(splitEntities.flat());
    // Notify each user assigned a split
    for (const split of savedSplits) {
      const content = `You have been assigned a split for an expense. Amount: ${split.amount}`;
      if (split.userId) {
        await this.notificationService.sendInApp(split.userId, content);
      }
      if (split.email) {
        await this.notificationService.sendEmail(
          split.email,
          'New Split Assigned',
          content,
        );
      }
    }
    return savedSplits;
  }

  async getExpenseSplits(expenseId: string) {
    return this.splitRepo.find({ where: { expenseId } });
  }

  async settleSplit(splitId: string) {
    const split = await this.splitRepo.findOne({ where: { id: splitId } });
    if (!split) throw new Error('Split not found');
    split.isSettled = true;
    await this.splitRepo.save(split);
    // Notify the user whose split was settled
    if (split.userId) {
      await this.notificationService.sendInApp(
        split.userId,
        'Your split has been settled.',
      );
    }
    if (split.email) {
      await this.notificationService.sendEmail(
        split.email,
        'Split Settled',
        'Your split has been settled.',
      );
    }
    return split;
  }

  async getUserSplits(userId: string) {
    return this.splitRepo.find({ where: { userId } });
  }

  async listByCategory(categoryId: string) {
    return this.expenseRepo.find({
      where: { categoryId },
      order: { date: 'DESC' },
    });
  }

  async listByDateRange(start: string, end: string) {
    return this.expenseRepo
      .createQueryBuilder('expense')
      .where('expense.date >= :start', { start })
      .andWhere('expense.date <= :end', { end })
      .orderBy('expense.date', 'DESC')
      .getMany();
  }

  async listUnsettled(groupId?: string, userId?: string) {
    const qb = this.splitRepo
      .createQueryBuilder('split')
      .where('split.isSettled = false');
    if (groupId) {
      qb.andWhere('split.groupId = :groupId', { groupId });
    }
    if (userId) {
      qb.andWhere('split.userId = :userId', { userId });
    }
    return qb.getMany();
  }

  async groupBalances(groupId: string) {
    // Example: sum of unsettled splits per user in group
    return this.splitRepo
      .createQueryBuilder('split')
      .select('split.userId', 'userId')
      .addSelect('SUM(split.amount)', 'totalOwed')
      .where('split.groupId = :groupId', { groupId })
      .andWhere('split.isSettled = false')
      .groupBy('split.userId')
      .getRawMany();
  }

  async userBalances(userId: string) {
    // Example: sum of unsettled splits for user
    return this.splitRepo
      .createQueryBuilder('split')
      .select('split.groupId', 'groupId')
      .addSelect('SUM(split.amount)', 'totalOwed')
      .where('split.userId = :userId', { userId })
      .andWhere('split.isSettled = false')
      .groupBy('split.groupId')
      .getRawMany();
  }

  async remindUnsettled() {
    const unsettled = await this.splitRepo.find({
      where: { isSettled: false },
    });
    const notified: string[] = [];
    for (const split of unsettled) {
      const content = `Reminder: You have an unsettled split for an expense. Amount: ${split.amount}`;
      if (split.userId) {
        await this.notificationService.sendInApp(split.userId, content);
        notified.push(split.userId);
      }
      if (split.email) {
        await this.notificationService.sendEmail(
          split.email,
          'Unsettled Split Reminder',
          content,
        );
        notified.push(split.email);
      }
    }
    return { reminded: notified };
  }
}
