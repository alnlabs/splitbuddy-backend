import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroup } from '../entities/user-group.entity';
import { UserGroupMember } from '../entities/user-group-member.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly groupRepo: Repository<UserGroup>,
    @InjectRepository(UserGroupMember)
    private readonly groupMemberRepo: Repository<UserGroupMember>,
  ) {}

  async create(dto: any) {
    const group = this.groupRepo.create(dto);
    const savedGroup = await this.groupRepo.save(group);

    // If members are provided, create them
    if (dto.members && Array.isArray(dto.members)) {
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
    await this.groupRepo.delete(id);
    return { deleted: true };
  }
}
