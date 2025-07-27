import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserGroup } from '../entities/user-group.entity';
import { UserGroupMember } from '../entities/user-group-member.entity';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly groupRepo: Repository<UserGroup>,
    @InjectRepository(UserGroupMember)
    private readonly groupMemberRepo: Repository<UserGroupMember>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(ExpenseSplit)
    private readonly expenseSplitRepo: Repository<ExpenseSplit>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: any) {
    const group = this.groupRepo.create(dto);
    const savedGroup = await this.groupRepo.save(group);

    // If members are provided and group is shared, create them
    if (dto.members && Array.isArray(dto.members) && dto.isShared !== false) {
      const memberPromises = dto.members.map((member: any) => {
        const groupMember = this.groupMemberRepo.create({
          groupId: (savedGroup as any).id,
          email: member.email,
          fullName: member.fullName,
          status: 'INVITED',
          isRegistered: false,
          invitedAt: new Date(),
        });
        return this.groupMemberRepo.save(groupMember);
      });

      await Promise.all(memberPromises);
    }

    // Return the group with members
    return this.getById((savedGroup as any).id);
  }

  async getById(id: string) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) return null;

    // Get members for this group
    const members = await this.groupMemberRepo.find({
      where: { groupId: group.id },
      order: { createdAt: 'ASC' },
    });

    return {
      ...group,
      members: members.map((member) => ({
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        email: member.email,
        fullName: member.fullName,
        status: member.status,
        invitedAt: member.invitedAt,
        acceptedAt: member.acceptedAt,
        registered: member.isRegistered,
      })),
    };
  }

  async list() {
    // Get all groups
    const groups = await this.groupRepo.find({ order: { groupName: 'ASC' } });

    // For each group, get its members
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const members = await this.groupMemberRepo.find({
          where: { groupId: group.id },
          order: { createdAt: 'ASC' },
        });

        return {
          ...group,
          members: members.map((member) => ({
            id: member.id,
            groupId: member.groupId,
            userId: member.userId,
            email: member.email,
            fullName: member.fullName,
            status: member.status,
            invitedAt: member.invitedAt,
            acceptedAt: member.acceptedAt,
            registered: member.isRegistered,
          })),
        };
      }),
    );

    return groupsWithMembers;
  }

  async update(id: string, dto: any) {
    await this.groupRepo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string) {
    console.log(`🔍 GroupService: Starting deletion for group ${id}`);

    // Use a transaction to ensure all operations are atomic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // First, get all expenses for this group
      const expenses = await queryRunner.manager.find(Expense, {
        where: { groupId: id },
      });
      console.log(
        `🔍 GroupService: Found ${expenses.length} expenses for group ${id}`,
      );

      // Delete expense splits for all expenses in this group
      for (const expense of expenses) {
        const splitResult = await queryRunner.manager.delete(ExpenseSplit, {
          expenseId: expense.id,
        });
        console.log(
          `🔍 GroupService: Deleted splits for expense ${expense.id}:`,
          splitResult,
        );
      }

      // Delete all expenses for this group
      const expenseResult = await queryRunner.manager.delete(Expense, {
        groupId: id,
      });
      console.log(
        `🔍 GroupService: Deleted expenses for group ${id}:`,
        expenseResult,
      );

      // Delete all group members
      const memberResult = await queryRunner.manager.delete(UserGroupMember, {
        groupId: id,
      });
      console.log(
        `🔍 GroupService: Deleted members for group ${id}:`,
        memberResult,
      );

      // Finally delete the group itself
      const groupResult = await queryRunner.manager.delete(UserGroup, { id });
      console.log(`🔍 GroupService: Deleted group ${id}:`, groupResult);

      // Commit the transaction
      await queryRunner.commitTransaction();

      const response = {
        success: true,
        data: {
          deleted: true,
          message: `Group and all related data (${expenses.length} expenses, ${expenses.length} expense splits, and all members) have been deleted successfully.`,
        },
        message: `Group and all related data (${expenses.length} expenses, ${expenses.length} expense splits, and all members) have been deleted successfully.`,
        error: null,
      };

      console.log(
        `✅ GroupService: Deletion completed for group ${id}:`,
        response,
      );
      return response;
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      console.error(`❌ GroupService: Error deleting group ${id}:`, error);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }
}
