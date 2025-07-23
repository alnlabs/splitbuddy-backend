import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from '../entities/user-settings.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepo: Repository<UserSettings>,
  ) {}

  async getByUserId(userId: string) {
    return this.settingsRepo.findOne({ where: { userId } });
  }

  async createOrUpdate(userId: string, dto: Partial<UserSettings>) {
    let settings = await this.getByUserId(userId);
    if (!settings) {
      settings = this.settingsRepo.create({ ...dto, userId });
    } else {
      Object.assign(settings, dto);
    }
    await this.settingsRepo.save(settings);
    return settings;
  }
}
