import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: any) {
    const category = this.categoryRepo.create(dto);
    await this.categoryRepo.save(category);
    return category;
  }

  async getById(id: string) {
    return this.categoryRepo.findOne({ where: { id } });
  }

  async list(userId?: string) {
    if (userId) {
      return this.categoryRepo.find({
        where: { authorId: userId },
        order: { name: 'ASC' },
      });
    } else {
      // Return all categories (for admin purposes or if no userId provided)
      return this.categoryRepo.find({ order: { name: 'ASC' } });
    }
  }

  async update(id: string, dto: any) {
    await this.categoryRepo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string) {
    await this.categoryRepo.delete(id);
    return { deleted: true };
  }
}
