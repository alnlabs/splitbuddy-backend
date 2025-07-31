import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroupMember } from '../entities/user-group-member.entity';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(UserGroupMember)
    private readonly groupMemberRepo: Repository<UserGroupMember>,
  ) {}

  async create(dto: any) {
    const member = this.groupMemberRepo.create(dto);
    await this.groupMemberRepo.save(member);
    return member;
  }

  async getById(id: string) {
    return this.groupMemberRepo.findOne({ where: { id } });
  }

  async list() {
    return this.groupMemberRepo.find();
  }

  async update(id: string, dto: any) {
    await this.groupMemberRepo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string) {
    await this.groupMemberRepo.delete(id);
    return { deleted: true };
  }
}
