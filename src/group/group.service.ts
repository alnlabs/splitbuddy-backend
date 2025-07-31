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

    // If members are provided, create them (for both shared and unshared groups)
    if (dto.members && Array.isArray(dto.members)) {
      const memberPromises = dto.members.map(async (member: any) => {
        // For unshared groups, check if the user exists in the users table
        let isRegistered = false;
        let userId = null;

        if (!dto.isShared) {
          // For unshared groups, only allow existing registered users
          const existingUser = await this.dataSource
            .createQueryBuilder()
            .select(['id', 'email'])
            .from('users', 'u')
            .where('u.email = :email', { email: member.email })
            .getRawOne();

          if (existingUser) {
            isRegistered = true;
            userId = existingUser.id;
          } else {
            // Skip this member if they're not a registered user for unshared groups
            console.log(
              `Skipping member ${member.email} - not a registered user for unshared group`,
            );
            return null;
          }
        }

        const groupMember = this.groupMemberRepo.create({
          groupId: (savedGroup as any).id,
          email: member.email,
          fullName: member.fullName,
          status: isRegistered ? 'ACCEPTED' : 'INVITED',
          isRegistered: isRegistered,
          userId: userId,
          invitedAt: new Date(),
        });
        return this.groupMemberRepo.save(groupMember);
      });

      const results = await Promise.all(memberPromises);
      // Filter out null results (skipped members)
      const validMembers = results.filter((result) => result !== null);
      console.log(
        `Created ${validMembers.length} members for group ${(savedGroup as any).id}`,
      );
    }

    // Return the group with members
    return this.getById((savedGroup as any).id);
  }

  async getById(id: string) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) return null;

    let members: any[] = [];

    if (group.isShared) {
      // For shared groups, get all members from user_group_members table
      const groupMembers = await this.groupMemberRepo.find({
        where: { groupId: group.id },
        order: { createdAt: 'ASC' },
      });

      members = groupMembers.map((member) => ({
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        email: member.email,
        fullName: member.fullName,
        status: member.status,
        invitedAt: member.invitedAt,
        acceptedAt: member.acceptedAt,
        registered: member.isRegistered,
      }));
    } else {
      // For unshared (Personal) groups, show the group owner/creator + any added members
      // First, get the group owner from users table
      const user = await this.dataSource
        .createQueryBuilder()
        .select(['id', 'email', 'first_name', 'last_name'])
        .from('users', 'u')
        .where('u.id = :userId', { userId: group.authorId })
        .getRawOne();

      if (user) {
        members = [
          {
            id: `owner-${group.id}`,
            groupId: group.id,
            userId: user.id,
            email: user.email,
            fullName:
              `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
              user.email,
            status: 'ACCEPTED',
            invitedAt: group.createdAt,
            acceptedAt: group.createdAt,
            registered: true,
          },
        ];
      }

      // Also get any additional members from user_group_members table
      const groupMembers = await this.groupMemberRepo.find({
        where: { groupId: group.id },
        order: { createdAt: 'ASC' },
      });

      const additionalMembers = groupMembers.map((member) => ({
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        email: member.email,
        fullName: member.fullName,
        status: member.status,
        invitedAt: member.invitedAt,
        acceptedAt: member.acceptedAt,
        registered: member.isRegistered,
      }));

      // Combine owner with additional members
      members = [...members, ...additionalMembers];
    }

    return {
      ...group,
      members,
    };
  }

  async list() {
    // Get all groups
    const groups = await this.groupRepo.find({ order: { groupName: 'ASC' } });

    // For each group, get its members based on group type
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        let members: any[] = [];

        if (group.isShared) {
          // For shared groups, get all members from user_group_members table
          const groupMembers = await this.groupMemberRepo.find({
            where: { groupId: group.id },
            order: { createdAt: 'ASC' },
          });

          members = groupMembers.map((member) => ({
            id: member.id,
            groupId: member.groupId,
            userId: member.userId,
            email: member.email,
            fullName: member.fullName,
            status: member.status,
            invitedAt: member.invitedAt,
            acceptedAt: member.acceptedAt,
            registered: member.isRegistered,
          }));
        } else {
          // For unshared (Personal) groups, show the group owner/creator + any added members
          // First, get the group owner from users table
          const user = await this.dataSource
            .createQueryBuilder()
            .select(['id', 'email', 'first_name', 'last_name'])
            .from('users', 'u')
            .where('u.id = :userId', { userId: group.authorId })
            .getRawOne();

          if (user) {
            members = [
              {
                id: `owner-${group.id}`,
                groupId: group.id,
                userId: user.id,
                email: user.email,
                fullName:
                  `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
                  user.email,
                status: 'ACCEPTED',
                invitedAt: group.createdAt,
                acceptedAt: group.createdAt,
                registered: true,
              },
            ];
          }

          // Also get any additional members from user_group_members table
          const groupMembers = await this.groupMemberRepo.find({
            where: { groupId: group.id },
            order: { createdAt: 'ASC' },
          });

          const additionalMembers = groupMembers.map((member) => ({
            id: member.id,
            groupId: member.groupId,
            userId: member.userId,
            email: member.email,
            fullName: member.fullName,
            status: member.status,
            invitedAt: member.invitedAt,
            acceptedAt: member.acceptedAt,
            registered: member.isRegistered,
          }));

          // Combine owner with additional members
          members = [...members, ...additionalMembers];
        }

        return {
          ...group,
          members,
        };
      }),
    );

    return groupsWithMembers;
  }

  async update(id: string, dto: any) {
    await this.groupRepo.update(id, dto);
    return this.getById(id);
  }

  // Member CRUD operations
  async addMember(groupId: string, memberData: any) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }

    // For unshared groups, check if user exists
    if (!group.isShared) {
      const existingUser = await this.dataSource
        .createQueryBuilder()
        .select(['id', 'email'])
        .from('users', 'u')
        .where('u.email = :email', { email: memberData.email })
        .getRawOne();

      if (!existingUser) {
        throw new Error('Cannot add unregistered users to unshared groups');
      }

      memberData.userId = existingUser.id;
      memberData.isRegistered = true;
      memberData.status = 'ACCEPTED';
    }

    const member = this.groupMemberRepo.create({
      groupId,
      email: memberData.email,
      fullName: memberData.fullName,
      userId: memberData.userId,
      status: memberData.status || 'INVITED',
      isRegistered: memberData.isRegistered || false,
      invitedAt: new Date(),
    });

    return this.groupMemberRepo.save(member);
  }

  async updateMember(memberId: string, memberData: any) {
    const member = await this.groupMemberRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new Error('Member not found');
    }

    await this.groupMemberRepo.update(memberId, memberData);
    return this.groupMemberRepo.findOne({ where: { id: memberId } });
  }

  async removeMember(memberId: string) {
    const member = await this.groupMemberRepo.findOne({
      where: { id: memberId },
    });
    if (!member) {
      throw new Error('Member not found');
    }

    // Check if this is the group owner (for unshared groups)
    const group = await this.groupRepo.findOne({
      where: { id: member.groupId },
    });
    if (group && !group.isShared && member.userId === group.authorId) {
      throw new Error('Cannot remove the group owner from unshared groups');
    }

    await this.groupMemberRepo.delete(memberId);
    return { success: true, message: 'Member removed successfully' };
  }

  async getMembers(groupId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }

    let members: any[] = [];

    if (group.isShared) {
      // For shared groups, get all members from user_group_members table
      const groupMembers = await this.groupMemberRepo.find({
        where: { groupId: group.id },
        order: { createdAt: 'ASC' },
      });

      members = groupMembers.map((member) => ({
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        email: member.email,
        fullName: member.fullName,
        status: member.status,
        invitedAt: member.invitedAt,
        acceptedAt: member.acceptedAt,
        registered: member.isRegistered,
      }));
    } else {
      // For unshared groups, show owner + additional members
      const user = await this.dataSource
        .createQueryBuilder()
        .select(['id', 'email', 'first_name', 'last_name'])
        .from('users', 'u')
        .where('u.id = :userId', { userId: group.authorId })
        .getRawOne();

      if (user) {
        members = [
          {
            id: `owner-${group.id}`,
            groupId: group.id,
            userId: user.id,
            email: user.email,
            fullName:
              `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
              user.email,
            status: 'ACCEPTED',
            invitedAt: group.createdAt,
            acceptedAt: group.createdAt,
            registered: true,
            isOwner: true,
          },
        ];
      }

      // Get additional members
      const groupMembers = await this.groupMemberRepo.find({
        where: { groupId: group.id },
        order: { createdAt: 'ASC' },
      });

      const additionalMembers = groupMembers.map((member) => ({
        id: member.id,
        groupId: member.groupId,
        userId: member.userId,
        email: member.email,
        fullName: member.fullName,
        status: member.status,
        invitedAt: member.invitedAt,
        acceptedAt: member.acceptedAt,
        registered: member.isRegistered,
        isOwner: false,
      }));

      members = [...members, ...additionalMembers];
    }

    return members;
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
