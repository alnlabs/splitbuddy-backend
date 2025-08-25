import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupMember } from '../entities/user-group-member.entity';
import { CreateGroupMemberDto, UpdateGroupMemberDto } from './group-member.dto';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(UserGroupMember)
    private readonly groupMemberRepo: Repository<UserGroupMember>,
  ) {}

  async create(dto: CreateGroupMemberDto): Promise<UserGroupMember> {
    const member = this.groupMemberRepo.create(dto);
    await this.groupMemberRepo.save(member);
    return member;
  }

  async getById(id: string): Promise<UserGroupMember | null> {
    return this.groupMemberRepo.findOne({ where: { id } });
  }

  async list(): Promise<UserGroupMember[]> {
    return this.groupMemberRepo.find();
  }

  async update(
    id: string,
    dto: UpdateGroupMemberDto,
  ): Promise<UserGroupMember | null> {
    await this.groupMemberRepo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    await this.groupMemberRepo.delete(id);
    return { deleted: true };
  }
}
