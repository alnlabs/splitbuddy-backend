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
        currency: 'INR',
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
        exportData: true,
        // External User Settings
        allowExternalUserCreation: true,
        externalUserNotifications: true,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: true,
        defaultExternalUserContactMethod: 'email',
        autoMigrateExternalUsers: false,
        externalUserExpiryDays: 30,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'friend',
        allowedExternalUserRelationshipTypes: [
          'friend',
          'family',
          'colleague',
          'business',
          'other',
        ],
        // Loan Settings
        defaultInterestType: 'simple',
        defaultInterestRate: 0,
        defaultLoanTermDays: 30,
        loanReminders: true,
        loanReminderDays: 7,
        lateFeeNotifications: true,
        defaultLateFeeRate: 5,
        autoCalculateInterest: true,
        recurringLoanReminders: true,
        // Notification Settings
        emailDigests: true,
        smsNotifications: false,
        browserNotifications: true,
        notificationTime: '09:00',
        notificationTimezone: 'UTC',
        weekendNotifications: false,
        // Security Settings
        requirePasswordForLargeTransactions: true,
        largeTransactionThreshold: 1000,
        sessionTimeout: 30,
        loginLocationAlerts: true,
        deviceRememberMe: true,
        suspiciousActivityAlerts: true,
        // Privacy Settings
        profileVisibility: 'friends',
        transactionHistoryVisibility: 'private',
        allowDataSharing: false,
        allowAnalytics: true,
        // App Preferences
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        quickActions: ['add-expense', 'create-loan'],
        dashboardLayout: 'default',
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

  async getLoanSettings(userId: string) {
    const settings = await this.getByUserId(userId);
    return {
      defaultInterestType: settings.defaultInterestType,
      defaultInterestRate: settings.defaultInterestRate,
      defaultLoanTermDays: settings.defaultLoanTermDays,
      loanReminders: settings.loanReminders,
      loanReminderDays: settings.loanReminderDays,
      lateFeeNotifications: settings.lateFeeNotifications,
      defaultLateFeeRate: settings.defaultLateFeeRate,
      autoCalculateInterest: settings.autoCalculateInterest,
      recurringLoanReminders: settings.recurringLoanReminders,
    };
  }

  async getNotificationSettings(userId: string) {
    const settings = await this.getByUserId(userId);
    return {
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      inAppNotifications: settings.inAppNotifications,
      reminders: settings.reminders,
      emailDigests: settings.emailDigests,
      smsNotifications: settings.smsNotifications,
      browserNotifications: settings.browserNotifications,
      notificationTime: settings.notificationTime,
      notificationTimezone: settings.notificationTimezone,
      weekendNotifications: settings.weekendNotifications,
    };
  }

  async getSecuritySettings(userId: string) {
    const settings = await this.getByUserId(userId);
    return {
      twoFactorAuth: settings.twoFactorAuth,
      loginAlerts: settings.loginAlerts,
      biometricLogin: settings.biometricLogin,
      requirePasswordForLargeTransactions:
        settings.requirePasswordForLargeTransactions,
      largeTransactionThreshold: settings.largeTransactionThreshold,
      sessionTimeout: settings.sessionTimeout,
      loginLocationAlerts: settings.loginLocationAlerts,
      deviceRememberMe: settings.deviceRememberMe,
      suspiciousActivityAlerts: settings.suspiciousActivityAlerts,
    };
  }

  async getPrivacySettings(userId: string) {
    const settings = await this.getByUserId(userId);
    return {
      profileVisibility: settings.profileVisibility,
      transactionHistoryVisibility: settings.transactionHistoryVisibility,
      allowDataSharing: settings.allowDataSharing,
      allowAnalytics: settings.allowAnalytics,
    };
  }

  async getAppPreferences(userId: string) {
    const settings = await this.getByUserId(userId);
    return {
      theme: settings.theme,
      language: settings.language,
      currency: settings.currency,
      offlineMode: settings.offlineMode,
      exportData: settings.exportData,
      autoBackup: settings.autoBackup,
      backupFrequency: settings.backupFrequency,
      dataRetentionDays: settings.dataRetentionDays,
      quickActions: settings.quickActions,
      dashboardLayout: settings.dashboardLayout,
    };
  }

  async validateSettings(
    settings: Partial<UserSettings>,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Handle null or undefined settings
    if (!settings) {
      return {
        isValid: true,
        errors: [],
      };
    }

    // Validate interest rate
    if (
      settings.defaultInterestRate !== undefined &&
      (settings.defaultInterestRate < 0 || settings.defaultInterestRate > 100)
    ) {
      errors.push('Default interest rate must be between 0 and 100');
    }

    // Validate loan term days
    if (
      settings.defaultLoanTermDays !== undefined &&
      settings.defaultLoanTermDays <= 0
    ) {
      errors.push('Default loan term days must be greater than 0');
    }

    // Validate loan reminder days
    if (
      settings.loanReminderDays !== undefined &&
      (settings.loanReminderDays < 0 || settings.loanReminderDays > 30)
    ) {
      errors.push('Loan reminder days must be between 0 and 30');
    }

    // Validate late fee rate
    if (
      settings.defaultLateFeeRate !== undefined &&
      (settings.defaultLateFeeRate < 0 || settings.defaultLateFeeRate > 50)
    ) {
      errors.push('Default late fee rate must be between 0 and 50');
    }

    // Validate session timeout
    if (
      settings.sessionTimeout !== undefined &&
      (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440)
    ) {
      errors.push('Session timeout must be between 5 and 1440 minutes');
    }

    // Validate large transaction threshold
    if (
      settings.largeTransactionThreshold !== undefined &&
      settings.largeTransactionThreshold < 0
    ) {
      errors.push('Large transaction threshold must be non-negative');
    }

    // Validate data retention days
    if (
      settings.dataRetentionDays !== undefined &&
      (settings.dataRetentionDays < 30 || settings.dataRetentionDays > 3650)
    ) {
      errors.push('Data retention days must be between 30 and 3650');
    }

    // Validate external user expiry days
    if (
      settings.externalUserExpiryDays !== undefined &&
      (settings.externalUserExpiryDays < 1 ||
        settings.externalUserExpiryDays > 365)
    ) {
      errors.push('External user expiry days must be between 1 and 365');
    }

    // Validate notification time format
    if (settings.notificationTime !== undefined) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(settings.notificationTime)) {
        errors.push('Notification time must be in HH:MM format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async resetToDefaults(userId: string): Promise<UserSettings> {
    const defaultSettings = await this.getByUserId(userId);
    return this.createOrUpdate(userId, defaultSettings);
  }

  async deleteSettings(userId: string): Promise<void> {
    await this.settingsRepo.delete({ userId });
  }
}
