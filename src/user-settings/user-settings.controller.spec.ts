import { Test, TestingModule } from '@nestjs/testing';
import { UserSettingsController } from './user-settings.controller';
import { UserSettingsService } from './user-settings.service';
import { UserSettings } from '../entities/user-settings.entity';
import {
  UpdateUserSettingsDto,
  ExternalUserSettingsDto,
} from './user-settings.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UserSettingsController', () => {
  let controller: UserSettingsController;
  let service: UserSettingsService;

  const mockUserSettings = {
    id: 'settings-1',
    userId: 'user-1',
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
    allowExternalUserCreation: true,
    externalUserNotifications: true,
    externalUserPasswordReset: true,
    externalUserPhoneVerification: true,
    defaultExternalUserContactMethod: 'email',
    autoMigrateExternalUsers: false,
    externalUserExpiryDays: 30,
    externalUserReferenceEmailNotifications: true,
    defaultExternalUserRelationshipType: 'friend',
    allowedExternalUserRelationshipTypes: ['friend', 'family', 'colleague'],
    defaultInterestType: 'simple',
    defaultInterestRate: 0,
    defaultLoanTermDays: 30,
    loanReminders: true,
    loanReminderDays: 7,
    lateFeeNotifications: true,
    defaultLateFeeRate: 5,
    autoCalculateInterest: true,
    recurringLoanReminders: true,
    emailDigests: true,
    smsNotifications: false,
    browserNotifications: true,
    notificationTime: '09:00',
    notificationTimezone: 'UTC',
    weekendNotifications: false,
    requirePasswordForLargeTransactions: true,
    largeTransactionThreshold: 1000,
    sessionTimeout: 30,
    loginLocationAlerts: true,
    deviceRememberMe: true,
    suspiciousActivityAlerts: true,
    profileVisibility: 'friends',
    transactionHistoryVisibility: 'private',
    allowDataSharing: false,
    allowAnalytics: true,
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetentionDays: 365,
    quickActions: ['add-expense', 'create-loan'],
    dashboardLayout: 'default',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
  };

  const mockUserSettingsService = {
    getByUserId: jest.fn(),
    createOrUpdate: jest.fn(),
    getLoanSettings: jest.fn(),
    getNotificationSettings: jest.fn(),
    getSecuritySettings: jest.fn(),
    getPrivacySettings: jest.fn(),
    getAppPreferences: jest.fn(),
    resetToDefaults: jest.fn(),
    deleteSettings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSettingsController],
      providers: [
        {
          provide: UserSettingsService,
          useValue: mockUserSettingsService,
        },
      ],
    }).compile();

    controller = module.get<UserSettingsController>(UserSettingsController);
    service = module.get<UserSettingsService>(UserSettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByUserId', () => {
    it('should return user settings when they exist', async () => {
      const userId = 'user-1';
      mockUserSettingsService.getByUserId.mockResolvedValue(mockUserSettings);

      const result = await controller.getByUserId(userId);

      expect(result).toEqual(mockUserSettings);
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return default settings when user settings do not exist', async () => {
      const userId = 'user-1';
      const defaultSettings = {
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
        allowExternalUserCreation: true,
        externalUserNotifications: true,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: true,
        defaultExternalUserContactMethod: 'email',
        autoMigrateExternalUsers: false,
        externalUserExpiryDays: 30,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'friend',
        allowedExternalUserRelationshipTypes: ['friend', 'family', 'colleague'],
        defaultInterestType: 'simple',
        defaultInterestRate: 0,
        defaultLoanTermDays: 30,
        loanReminders: true,
        loanReminderDays: 7,
        lateFeeNotifications: true,
        defaultLateFeeRate: 5,
        autoCalculateInterest: true,
        recurringLoanReminders: true,
        emailDigests: true,
        smsNotifications: false,
        browserNotifications: true,
        notificationTime: '09:00',
        notificationTimezone: 'UTC',
        weekendNotifications: false,
        requirePasswordForLargeTransactions: true,
        largeTransactionThreshold: 1000,
        sessionTimeout: 30,
        loginLocationAlerts: true,
        deviceRememberMe: true,
        suspiciousActivityAlerts: true,
        profileVisibility: 'friends',
        transactionHistoryVisibility: 'private',
        allowDataSharing: false,
        allowAnalytics: true,
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        quickActions: ['add-expense', 'create-loan'],
        dashboardLayout: 'default',
      };

      mockUserSettingsService.getByUserId.mockResolvedValue(defaultSettings);

      const result = await controller.getByUserId(userId);

      expect(result).toEqual(defaultSettings);
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors', async () => {
      const userId = 'user-1';
      const error = new Error('Database error');
      mockUserSettingsService.getByUserId.mockRejectedValue(error);

      await expect(controller.getByUserId(userId)).rejects.toThrow(
        'Database error',
      );
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle empty userId', async () => {
      const userId = '';
      const defaultSettings = { userId, theme: 'light', language: 'en' };
      mockUserSettingsService.getByUserId.mockResolvedValue(defaultSettings);

      const result = await controller.getByUserId(userId);

      expect(result).toEqual(defaultSettings);
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update user settings successfully', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {
        theme: 'dark',
        language: 'es',
        emailNotifications: false,
      };

      const updatedSettings = { ...mockUserSettings, ...updateDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.update(userId, updateDto);

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should create new settings when they do not exist', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {
        theme: 'dark',
        currency: 'EUR',
      };

      const newSettings = { ...updateDto, userId, id: 'new-settings-id' };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(newSettings);

      const result = await controller.update(userId, updateDto);

      expect(result).toEqual(newSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle partial updates', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {
        theme: 'dark',
      };

      const updatedSettings = { ...mockUserSettings, theme: 'dark' };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.update(userId, updateDto);

      expect(result.theme).toBe('dark');
      expect(result.language).toBe(mockUserSettings.language); // Should remain unchanged
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle complex nested updates', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {
        allowedExternalUserRelationshipTypes: ['friend', 'family'],
        externalUserExpiryDays: 60,
      };

      const updatedSettings = { ...mockUserSettings, ...updateDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.update(userId, updateDto);

      expect(result.allowedExternalUserRelationshipTypes).toEqual([
        'friend',
        'family',
      ]);
      expect(result.externalUserExpiryDays).toBe(60);
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle empty update DTO', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {};

      mockUserSettingsService.createOrUpdate.mockResolvedValue(
        mockUserSettings,
      );

      const result = await controller.update(userId, updateDto);

      expect(result).toEqual(mockUserSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle service errors', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = { theme: 'dark' };
      const error = new Error('Update failed');
      mockUserSettingsService.createOrUpdate.mockRejectedValue(error);

      await expect(controller.update(userId, updateDto)).rejects.toThrow(
        'Update failed',
      );
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle validation errors', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {
        defaultExternalUserContactMethod: 'invalid' as any,
      };

      // This would typically be caught by validation pipes, but we can test the service error handling
      const error = new BadRequestException('Invalid enum value');
      mockUserSettingsService.createOrUpdate.mockRejectedValue(error);

      await expect(controller.update(userId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });
  });

  describe('updateExternalUserSettings', () => {
    it('should update external user settings successfully', async () => {
      const userId = 'user-1';
      const externalSettingsDto: ExternalUserSettingsDto = {
        allowExternalUserCreation: false,
        externalUserNotifications: false,
        externalUserPasswordReset: false,
        externalUserPhoneVerification: true,
        defaultExternalUserContactMethod: 'phone',
        autoMigrateExternalUsers: true,
        externalUserExpiryDays: 60,
        externalUserReferenceEmailNotifications: false,
        defaultExternalUserRelationshipType: 'colleague',
        allowedExternalUserRelationshipTypes: ['friend', 'family'],
      };

      const updatedSettings = { ...mockUserSettings, ...externalSettingsDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.updateExternalUserSettings(
        userId,
        externalSettingsDto,
      );

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        externalSettingsDto,
      );
    });

    it('should handle partial external user settings updates', async () => {
      const userId = 'user-1';
      const externalSettingsDto: ExternalUserSettingsDto = {
        allowExternalUserCreation: false,
        externalUserNotifications: false,
      };

      const updatedSettings = {
        ...mockUserSettings,
        allowExternalUserCreation: false,
        externalUserNotifications: false,
      };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.updateExternalUserSettings(
        userId,
        externalSettingsDto,
      );

      expect(result.allowExternalUserCreation).toBe(false);
      expect(result.externalUserNotifications).toBe(false);
      expect(result.externalUserPasswordReset).toBe(
        mockUserSettings.externalUserPasswordReset,
      ); // Should remain unchanged
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        externalSettingsDto,
      );
    });

    it('should handle empty external user settings DTO', async () => {
      const userId = 'user-1';
      const externalSettingsDto: ExternalUserSettingsDto = {};

      mockUserSettingsService.createOrUpdate.mockResolvedValue(
        mockUserSettings,
      );

      const result = await controller.updateExternalUserSettings(
        userId,
        externalSettingsDto,
      );

      expect(result).toEqual(mockUserSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        externalSettingsDto,
      );
    });

    it('should handle service errors for external user settings', async () => {
      const userId = 'user-1';
      const externalSettingsDto: ExternalUserSettingsDto = {
        allowExternalUserCreation: false,
      };
      const error = new Error('External settings update failed');
      mockUserSettingsService.createOrUpdate.mockRejectedValue(error);

      await expect(
        controller.updateExternalUserSettings(userId, externalSettingsDto),
      ).rejects.toThrow('External settings update failed');
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        externalSettingsDto,
      );
    });
  });

  describe('getExternalUserSettings', () => {
    it('should return external user settings successfully', async () => {
      const userId = 'user-1';
      const externalUserSettings = {
        allowExternalUserCreation: true,
        externalUserNotifications: true,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: true,
        defaultExternalUserContactMethod: 'email',
        autoMigrateExternalUsers: false,
        externalUserExpiryDays: 30,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'friend',
        allowedExternalUserRelationshipTypes: ['friend', 'family', 'colleague'],
      };

      mockUserSettingsService.getByUserId.mockResolvedValue({
        ...mockUserSettings,
        ...externalUserSettings,
      });

      const result = await controller.getExternalUserSettings(userId);

      expect(result).toEqual(externalUserSettings);
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return default external user settings when user settings do not exist', async () => {
      const userId = 'user-1';
      const defaultSettings = {
        userId,
        allowExternalUserCreation: true,
        externalUserNotifications: true,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: true,
        defaultExternalUserContactMethod: 'email',
        autoMigrateExternalUsers: false,
        externalUserExpiryDays: 30,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'friend',
        allowedExternalUserRelationshipTypes: ['friend', 'family', 'colleague'],
      };

      mockUserSettingsService.getByUserId.mockResolvedValue(defaultSettings);

      const result = await controller.getExternalUserSettings(userId);

      expect(result).toEqual({
        allowExternalUserCreation: true,
        externalUserNotifications: true,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: true,
        defaultExternalUserContactMethod: 'email',
        autoMigrateExternalUsers: false,
        externalUserExpiryDays: 30,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'friend',
        allowedExternalUserRelationshipTypes: ['friend', 'family', 'colleague'],
      });
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors for external user settings', async () => {
      const userId = 'user-1';
      const error = new Error('External user settings error');
      mockUserSettingsService.getByUserId.mockRejectedValue(error);

      await expect(controller.getExternalUserSettings(userId)).rejects.toThrow(
        'External user settings error',
      );
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });

    it('should handle partial external user settings', async () => {
      const userId = 'user-1';
      const partialSettings = {
        userId,
        allowExternalUserCreation: false,
        externalUserNotifications: false,
        // Other properties will be undefined
      };

      mockUserSettingsService.getByUserId.mockResolvedValue(partialSettings);

      const result = await controller.getExternalUserSettings(userId);

      expect(result.allowExternalUserCreation).toBe(false);
      expect(result.externalUserNotifications).toBe(false);
      expect(result.externalUserPasswordReset).toBeUndefined();
      expect(service.getByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined values in update DTOs', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {
        defaultGroupId: undefined,
        defaultCategoryId: undefined,
      };

      const updatedSettings = { ...mockUserSettings, ...updateDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.update(userId, updateDto);

      expect(result.defaultGroupId).toBeUndefined();
      expect(result.defaultCategoryId).toBeUndefined();
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle undefined userId', async () => {
      const userId = undefined as any;
      const updateDto: UpdateUserSettingsDto = { theme: 'dark' };

      const updatedSettings = { ...updateDto, userId: undefined };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.update(userId, updateDto);

      expect(result.userId).toBeUndefined();
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle large update payloads', async () => {
      const userId = 'user-1';
      const updateDto: UpdateUserSettingsDto = {
        theme: 'dark',
        language: 'es',
        currency: 'EUR',
        emailNotifications: false,
        pushNotifications: false,
        inAppNotifications: false,
        reminders: false,
        twoFactorAuth: true,
        loginAlerts: false,
        biometricLogin: true,
        offlineMode: true,
        exportData: false,
        allowExternalUserCreation: false,
        externalUserNotifications: false,
        externalUserPasswordReset: false,
        externalUserPhoneVerification: false,
        defaultExternalUserContactMethod: 'phone',
        autoMigrateExternalUsers: true,
        externalUserExpiryDays: 60,
        externalUserReferenceEmailNotifications: false,
        defaultExternalUserRelationshipType: 'colleague',
        allowedExternalUserRelationshipTypes: ['friend', 'family'],
      };

      const updatedSettings = { ...mockUserSettings, ...updateDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.update(userId, updateDto);

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(userId, updateDto);
    });
  });

  describe('Loan Settings Endpoints', () => {
    it('should get loan settings successfully', async () => {
      const userId = 'user-1';
      const loanSettings = {
        defaultInterestType: 'simple',
        defaultInterestRate: 5.5,
        defaultLoanTermDays: 30,
        loanReminders: true,
        loanReminderDays: 7,
        lateFeeNotifications: true,
        defaultLateFeeRate: 5,
        autoCalculateInterest: true,
        recurringLoanReminders: true,
      };

      mockUserSettingsService.getLoanSettings.mockResolvedValue(loanSettings);

      const result = await controller.getLoanSettings(userId);

      expect(result).toEqual(loanSettings);
      expect(service.getLoanSettings).toHaveBeenCalledWith(userId);
    });

    it('should update loan settings successfully', async () => {
      const userId = 'user-1';
      const loanSettingsDto = {
        defaultInterestType: 'compound' as const,
        defaultInterestRate: 10,
        defaultLoanTermDays: 60,
      };

      const updatedSettings = { ...mockUserSettings, ...loanSettingsDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.updateLoanSettings(
        userId,
        loanSettingsDto,
      );

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        loanSettingsDto,
      );
    });

    it('should handle service errors for loan settings', async () => {
      const userId = 'user-1';
      const error = new Error('Loan settings error');
      mockUserSettingsService.getLoanSettings.mockRejectedValue(error);

      await expect(controller.getLoanSettings(userId)).rejects.toThrow(
        'Loan settings error',
      );
      expect(service.getLoanSettings).toHaveBeenCalledWith(userId);
    });
  });

  describe('Notification Settings Endpoints', () => {
    it('should get notification settings successfully', async () => {
      const userId = 'user-1';
      const notificationSettings = {
        emailNotifications: true,
        pushNotifications: false,
        inAppNotifications: true,
        reminders: false,
        emailDigests: true,
        smsNotifications: false,
        browserNotifications: true,
        notificationTime: '09:00',
        notificationTimezone: 'UTC',
        weekendNotifications: false,
      };

      mockUserSettingsService.getNotificationSettings.mockResolvedValue(
        notificationSettings,
      );

      const result = await controller.getNotificationSettings(userId);

      expect(result).toEqual(notificationSettings);
      expect(service.getNotificationSettings).toHaveBeenCalledWith(userId);
    });

    it('should update notification settings successfully', async () => {
      const userId = 'user-1';
      const notificationSettingsDto = {
        emailNotifications: false,
        pushNotifications: true,
        notificationTime: '18:00',
      };

      const updatedSettings = {
        ...mockUserSettings,
        ...notificationSettingsDto,
      };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.updateNotificationSettings(
        userId,
        notificationSettingsDto,
      );

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        notificationSettingsDto,
      );
    });

    it('should handle service errors for notification settings', async () => {
      const userId = 'user-1';
      const error = new Error('Notification settings error');
      mockUserSettingsService.getNotificationSettings.mockRejectedValue(error);

      await expect(controller.getNotificationSettings(userId)).rejects.toThrow(
        'Notification settings error',
      );
      expect(service.getNotificationSettings).toHaveBeenCalledWith(userId);
    });
  });

  describe('Security Settings Endpoints', () => {
    it('should get security settings successfully', async () => {
      const userId = 'user-1';
      const securitySettings = {
        twoFactorAuth: true,
        loginAlerts: false,
        biometricLogin: true,
        requirePasswordForLargeTransactions: true,
        largeTransactionThreshold: 1000,
        sessionTimeout: 30,
        loginLocationAlerts: true,
        deviceRememberMe: true,
        suspiciousActivityAlerts: false,
      };

      mockUserSettingsService.getSecuritySettings.mockResolvedValue(
        securitySettings,
      );

      const result = await controller.getSecuritySettings(userId);

      expect(result).toEqual(securitySettings);
      expect(service.getSecuritySettings).toHaveBeenCalledWith(userId);
    });

    it('should update security settings successfully', async () => {
      const userId = 'user-1';
      const securitySettingsDto = {
        twoFactorAuth: true,
        biometricLogin: true,
        sessionTimeout: 60,
      };

      const updatedSettings = { ...mockUserSettings, ...securitySettingsDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.updateSecuritySettings(
        userId,
        securitySettingsDto,
      );

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        securitySettingsDto,
      );
    });

    it('should handle service errors for security settings', async () => {
      const userId = 'user-1';
      const error = new Error('Security settings error');
      mockUserSettingsService.getSecuritySettings.mockRejectedValue(error);

      await expect(controller.getSecuritySettings(userId)).rejects.toThrow(
        'Security settings error',
      );
      expect(service.getSecuritySettings).toHaveBeenCalledWith(userId);
    });
  });

  describe('Privacy Settings Endpoints', () => {
    it('should get privacy settings successfully', async () => {
      const userId = 'user-1';
      const privacySettings = {
        profileVisibility: 'friends' as const,
        transactionHistoryVisibility: 'private' as const,
        allowDataSharing: false,
        allowAnalytics: true,
      };

      mockUserSettingsService.getPrivacySettings.mockResolvedValue(
        privacySettings,
      );

      const result = await controller.getPrivacySettings(userId);

      expect(result).toEqual(privacySettings);
      expect(service.getPrivacySettings).toHaveBeenCalledWith(userId);
    });

    it('should update privacy settings successfully', async () => {
      const userId = 'user-1';
      const privacySettingsDto = {
        profileVisibility: 'public' as const,
        allowDataSharing: true,
      };

      const updatedSettings = { ...mockUserSettings, ...privacySettingsDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.updatePrivacySettings(
        userId,
        privacySettingsDto,
      );

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        privacySettingsDto,
      );
    });

    it('should handle service errors for privacy settings', async () => {
      const userId = 'user-1';
      const error = new Error('Privacy settings error');
      mockUserSettingsService.getPrivacySettings.mockRejectedValue(error);

      await expect(controller.getPrivacySettings(userId)).rejects.toThrow(
        'Privacy settings error',
      );
      expect(service.getPrivacySettings).toHaveBeenCalledWith(userId);
    });
  });

  describe('App Preferences Endpoints', () => {
    it('should get app preferences successfully', async () => {
      const userId = 'user-1';
      const appPreferences = {
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        offlineMode: false,
        exportData: true,
        autoBackup: true,
        backupFrequency: 'daily' as const,
        dataRetentionDays: 365,
        quickActions: ['add-expense', 'create-loan'],
        dashboardLayout: 'default',
      };

      mockUserSettingsService.getAppPreferences.mockResolvedValue(
        appPreferences,
      );

      const result = await controller.getAppPreferences(userId);

      expect(result).toEqual(appPreferences);
      expect(service.getAppPreferences).toHaveBeenCalledWith(userId);
    });

    it('should update app preferences successfully', async () => {
      const userId = 'user-1';
      const appPreferencesDto = {
        theme: 'light',
        language: 'es',
        backupFrequency: 'weekly' as const,
      };

      const updatedSettings = { ...mockUserSettings, ...appPreferencesDto };
      mockUserSettingsService.createOrUpdate.mockResolvedValue(updatedSettings);

      const result = await controller.updateAppPreferences(
        userId,
        appPreferencesDto,
      );

      expect(result).toEqual(updatedSettings);
      expect(service.createOrUpdate).toHaveBeenCalledWith(
        userId,
        appPreferencesDto,
      );
    });

    it('should handle service errors for app preferences', async () => {
      const userId = 'user-1';
      const error = new Error('App preferences error');
      mockUserSettingsService.getAppPreferences.mockRejectedValue(error);

      await expect(controller.getAppPreferences(userId)).rejects.toThrow(
        'App preferences error',
      );
      expect(service.getAppPreferences).toHaveBeenCalledWith(userId);
    });
  });

  describe('Reset to Defaults Endpoint', () => {
    it('should reset settings to defaults successfully', async () => {
      const userId = 'user-1';
      const defaultSettings = {
        userId,
        theme: 'light',
        language: 'en',
        currency: 'INR',
        // ... other default values
      };

      mockUserSettingsService.resetToDefaults.mockResolvedValue(
        defaultSettings,
      );

      const result = await controller.resetToDefaults(userId);

      expect(result).toEqual(defaultSettings);
      expect(service.resetToDefaults).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors for reset to defaults', async () => {
      const userId = 'user-1';
      const error = new Error('Reset to defaults error');
      mockUserSettingsService.resetToDefaults.mockRejectedValue(error);

      await expect(controller.resetToDefaults(userId)).rejects.toThrow(
        'Reset to defaults error',
      );
      expect(service.resetToDefaults).toHaveBeenCalledWith(userId);
    });
  });

  describe('Delete Settings Endpoint', () => {
    it('should delete settings successfully', async () => {
      const userId = 'user-1';

      mockUserSettingsService.deleteSettings.mockResolvedValue(undefined);

      const result = await controller.deleteSettings(userId);

      expect(result).toEqual({ message: 'User settings deleted successfully' });
      expect(service.deleteSettings).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors for delete settings', async () => {
      const userId = 'user-1';
      const error = new Error('Delete settings error');
      mockUserSettingsService.deleteSettings.mockRejectedValue(error);

      await expect(controller.deleteSettings(userId)).rejects.toThrow(
        'Delete settings error',
      );
      expect(service.deleteSettings).toHaveBeenCalledWith(userId);
    });
  });
});
