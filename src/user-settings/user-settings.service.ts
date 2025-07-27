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
    const settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      // Return default settings if none exist
      return {
        userId,
        theme: 'light',
        language: 'en',
        currency: 'USD',
        emailNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
        reminders: true,
        defaultGroupId: null,
        defaultCategoryId: null,
        defaultPaymentMethodId: null,
        twoFactorAuth: false,
        loginAlerts: true,
        biometricLogin: false,
        offlineMode: false,
        cloudSync: true,
        exportData: false,
      };
    }
    return settings;
  }

  async createOrUpdate(userId: string, dto: Partial<UserSettings>) {
    let settings = await this.settingsRepo.findOne({ where: { userId } });
    if (!settings) {
      settings = this.settingsRepo.create({ ...dto, userId });
    } else {
      Object.assign(settings, dto);
    }
    await this.settingsRepo.save(settings);
    return settings;
  }
}
