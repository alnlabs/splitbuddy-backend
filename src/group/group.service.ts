import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroup } from '../entities/user-group.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(UserGroup)
    private readonly groupRepo: Repository<UserGroup>,
  ) {}

  async create(dto: any) {
    const group = this.groupRepo.create(dto);
    await this.groupRepo.save(group);
    return group;
  }

  async getById(id: string) {
    return this.groupRepo.findOne({ where: { id } });
  }

  async list() {
    return this.groupRepo.find({ order: { groupName: 'ASC' } });
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
