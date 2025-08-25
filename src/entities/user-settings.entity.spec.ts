import { UserSettings } from './user-settings.entity';

describe('UserSettings Entity', () => {
  let userSettings: UserSettings;

  beforeEach(() => {
    userSettings = new UserSettings();
  });

  describe('Entity Structure', () => {
    it('should be defined', () => {
      expect(userSettings).toBeDefined();
    });

    it('should have all required properties', () => {
      expect(userSettings).toHaveProperty('id');
      expect(userSettings).toHaveProperty('userId');
      expect(userSettings).toHaveProperty('theme');
      expect(userSettings).toHaveProperty('language');
      expect(userSettings).toHaveProperty('currency');
      expect(userSettings).toHaveProperty('emailNotifications');
      expect(userSettings).toHaveProperty('pushNotifications');
      expect(userSettings).toHaveProperty('inAppNotifications');
      expect(userSettings).toHaveProperty('reminders');
      expect(userSettings).toHaveProperty('defaultGroupId');
      expect(userSettings).toHaveProperty('defaultCategoryId');
      expect(userSettings).toHaveProperty('defaultPaymentMethodId');
      expect(userSettings).toHaveProperty('twoFactorAuth');
      expect(userSettings).toHaveProperty('loginAlerts');
      expect(userSettings).toHaveProperty('biometricLogin');
      expect(userSettings).toHaveProperty('offlineMode');
      expect(userSettings).toHaveProperty('exportData');
      expect(userSettings).toHaveProperty('createdAt');
      expect(userSettings).toHaveProperty('updatedAt');
    });

    it('should have external user settings properties', () => {
      expect(userSettings).toHaveProperty('allowExternalUserCreation');
      expect(userSettings).toHaveProperty('externalUserNotifications');
      expect(userSettings).toHaveProperty('externalUserPasswordReset');
      expect(userSettings).toHaveProperty('externalUserPhoneVerification');
      expect(userSettings).toHaveProperty('defaultExternalUserContactMethod');
      expect(userSettings).toHaveProperty('autoMigrateExternalUsers');
      expect(userSettings).toHaveProperty('externalUserExpiryDays');
      expect(userSettings).toHaveProperty(
        'externalUserReferenceEmailNotifications',
      );
      expect(userSettings).toHaveProperty(
        'defaultExternalUserRelationshipType',
      );
      expect(userSettings).toHaveProperty(
        'allowedExternalUserRelationshipTypes',
      );
    });

    it('should have loan settings properties', () => {
      expect(userSettings).toHaveProperty('defaultInterestType');
      expect(userSettings).toHaveProperty('defaultInterestRate');
      expect(userSettings).toHaveProperty('defaultLoanTermDays');
      expect(userSettings).toHaveProperty('loanReminders');
      expect(userSettings).toHaveProperty('loanReminderDays');
      expect(userSettings).toHaveProperty('lateFeeNotifications');
      expect(userSettings).toHaveProperty('defaultLateFeeRate');
      expect(userSettings).toHaveProperty('autoCalculateInterest');
      expect(userSettings).toHaveProperty('recurringLoanReminders');
    });

    it('should have notification settings properties', () => {
      expect(userSettings).toHaveProperty('emailDigests');
      expect(userSettings).toHaveProperty('smsNotifications');
      expect(userSettings).toHaveProperty('browserNotifications');
      expect(userSettings).toHaveProperty('notificationTime');
      expect(userSettings).toHaveProperty('notificationTimezone');
      expect(userSettings).toHaveProperty('weekendNotifications');
    });

    it('should have security settings properties', () => {
      expect(userSettings).toHaveProperty(
        'requirePasswordForLargeTransactions',
      );
      expect(userSettings).toHaveProperty('largeTransactionThreshold');
      expect(userSettings).toHaveProperty('sessionTimeout');
      expect(userSettings).toHaveProperty('loginLocationAlerts');
      expect(userSettings).toHaveProperty('deviceRememberMe');
      expect(userSettings).toHaveProperty('suspiciousActivityAlerts');
    });

    it('should have privacy settings properties', () => {
      expect(userSettings).toHaveProperty('profileVisibility');
      expect(userSettings).toHaveProperty('transactionHistoryVisibility');
      expect(userSettings).toHaveProperty('allowDataSharing');
      expect(userSettings).toHaveProperty('allowAnalytics');
    });

    it('should have app preferences properties', () => {
      expect(userSettings).toHaveProperty('autoBackup');
      expect(userSettings).toHaveProperty('backupFrequency');
      expect(userSettings).toHaveProperty('dataRetentionDays');
      expect(userSettings).toHaveProperty('quickActions');
      expect(userSettings).toHaveProperty('dashboardLayout');
    });
  });

  describe('Default Values', () => {
    it('should have undefined values when instantiated (TypeORM behavior)', () => {
      const defaultSettings = new UserSettings();

      // TypeORM entities don't automatically initialize default values
      // Defaults are only applied when saved to database
      expect(defaultSettings.theme).toBeUndefined();
      expect(defaultSettings.language).toBeUndefined();
      expect(defaultSettings.currency).toBeUndefined();
      expect(defaultSettings.emailNotifications).toBeUndefined();
      expect(defaultSettings.pushNotifications).toBeUndefined();
      expect(defaultSettings.inAppNotifications).toBeUndefined();
      expect(defaultSettings.reminders).toBeUndefined();
      expect(defaultSettings.twoFactorAuth).toBeUndefined();
      expect(defaultSettings.loginAlerts).toBeUndefined();
      expect(defaultSettings.biometricLogin).toBeUndefined();
      expect(defaultSettings.offlineMode).toBeUndefined();
      expect(defaultSettings.exportData).toBeUndefined();
    });

    it('should have undefined values for external user settings when instantiated', () => {
      const defaultSettings = new UserSettings();

      expect(defaultSettings.allowExternalUserCreation).toBeUndefined();
      expect(defaultSettings.externalUserNotifications).toBeUndefined();
      expect(defaultSettings.externalUserPasswordReset).toBeUndefined();
      expect(defaultSettings.externalUserPhoneVerification).toBeUndefined();
      expect(defaultSettings.defaultExternalUserContactMethod).toBeUndefined();
      expect(defaultSettings.autoMigrateExternalUsers).toBeUndefined();
      expect(defaultSettings.externalUserExpiryDays).toBeUndefined();
      expect(
        defaultSettings.externalUserReferenceEmailNotifications,
      ).toBeUndefined();
      expect(
        defaultSettings.defaultExternalUserRelationshipType,
      ).toBeUndefined();
    });

    it('should have undefined values for loan settings when instantiated', () => {
      const defaultSettings = new UserSettings();

      expect(defaultSettings.defaultInterestType).toBeUndefined();
      expect(defaultSettings.defaultInterestRate).toBeUndefined();
      expect(defaultSettings.defaultLoanTermDays).toBeUndefined();
      expect(defaultSettings.loanReminders).toBeUndefined();
      expect(defaultSettings.loanReminderDays).toBeUndefined();
      expect(defaultSettings.lateFeeNotifications).toBeUndefined();
      expect(defaultSettings.defaultLateFeeRate).toBeUndefined();
      expect(defaultSettings.autoCalculateInterest).toBeUndefined();
      expect(defaultSettings.recurringLoanReminders).toBeUndefined();
    });

    it('should have undefined values for notification settings when instantiated', () => {
      const defaultSettings = new UserSettings();

      expect(defaultSettings.emailDigests).toBeUndefined();
      expect(defaultSettings.smsNotifications).toBeUndefined();
      expect(defaultSettings.browserNotifications).toBeUndefined();
      expect(defaultSettings.notificationTime).toBeUndefined();
      expect(defaultSettings.notificationTimezone).toBeUndefined();
      expect(defaultSettings.weekendNotifications).toBeUndefined();
    });

    it('should have undefined values for security settings when instantiated', () => {
      const defaultSettings = new UserSettings();

      expect(
        defaultSettings.requirePasswordForLargeTransactions,
      ).toBeUndefined();
      expect(defaultSettings.largeTransactionThreshold).toBeUndefined();
      expect(defaultSettings.sessionTimeout).toBeUndefined();
      expect(defaultSettings.loginLocationAlerts).toBeUndefined();
      expect(defaultSettings.deviceRememberMe).toBeUndefined();
      expect(defaultSettings.suspiciousActivityAlerts).toBeUndefined();
    });

    it('should have undefined values for privacy settings when instantiated', () => {
      const defaultSettings = new UserSettings();

      expect(defaultSettings.profileVisibility).toBeUndefined();
      expect(defaultSettings.transactionHistoryVisibility).toBeUndefined();
      expect(defaultSettings.allowDataSharing).toBeUndefined();
      expect(defaultSettings.allowAnalytics).toBeUndefined();
    });

    it('should have undefined values for app preferences when instantiated', () => {
      const defaultSettings = new UserSettings();

      expect(defaultSettings.autoBackup).toBeUndefined();
      expect(defaultSettings.backupFrequency).toBeUndefined();
      expect(defaultSettings.dataRetentionDays).toBeUndefined();
      expect(defaultSettings.quickActions).toBeUndefined();
      expect(defaultSettings.dashboardLayout).toBeUndefined();
    });
  });

  describe('Property Assignment', () => {
    it('should allow setting all properties', () => {
      const testData = {
        id: 'test-id',
        userId: 'user-123',
        theme: 'dark',
        language: 'es',
        currency: 'EUR',
        emailNotifications: false,
        pushNotifications: false,
        inAppNotifications: false,
        reminders: false,
        defaultGroupId: 'group-1',
        defaultCategoryId: 'category-1',
        defaultPaymentMethodId: 'payment-1',
        twoFactorAuth: true,
        loginAlerts: false,
        biometricLogin: true,
        offlineMode: true,
        exportData: false,
        allowExternalUserCreation: false,
        externalUserNotifications: false,
        externalUserPasswordReset: false,
        externalUserPhoneVerification: false,
        defaultExternalUserContactMethod: 'phone' as const,
        autoMigrateExternalUsers: true,
        externalUserExpiryDays: 60,
        externalUserReferenceEmailNotifications: false,
        defaultExternalUserRelationshipType: 'colleague',
        allowedExternalUserRelationshipTypes: ['friend', 'family'],
        defaultInterestType: 'compound',
        defaultInterestRate: 5.5,
        defaultLoanTermDays: 90,
        loanReminders: false,
        loanReminderDays: 3,
        lateFeeNotifications: false,
        defaultLateFeeRate: 10,
        autoCalculateInterest: false,
        recurringLoanReminders: false,
        emailDigests: false,
        smsNotifications: true,
        browserNotifications: false,
        notificationTime: '18:00',
        notificationTimezone: 'America/New_York',
        weekendNotifications: true,
        requirePasswordForLargeTransactions: false,
        largeTransactionThreshold: 5000,
        sessionTimeout: 60,
        loginLocationAlerts: false,
        deviceRememberMe: false,
        suspiciousActivityAlerts: false,
        profileVisibility: 'public',
        transactionHistoryVisibility: 'friends',
        allowDataSharing: true,
        allowAnalytics: false,
        autoBackup: false,
        backupFrequency: 'weekly',
        dataRetentionDays: 180,
        quickActions: ['add-expense'],
        dashboardLayout: 'compact',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      Object.assign(userSettings, testData);

      expect(userSettings.id).toBe(testData.id);
      expect(userSettings.userId).toBe(testData.userId);
      expect(userSettings.theme).toBe(testData.theme);
      expect(userSettings.language).toBe(testData.language);
      expect(userSettings.currency).toBe(testData.currency);
      expect(userSettings.emailNotifications).toBe(testData.emailNotifications);
      expect(userSettings.pushNotifications).toBe(testData.pushNotifications);
      expect(userSettings.inAppNotifications).toBe(testData.inAppNotifications);
      expect(userSettings.reminders).toBe(testData.reminders);
      expect(userSettings.defaultGroupId).toBe(testData.defaultGroupId);
      expect(userSettings.defaultCategoryId).toBe(testData.defaultCategoryId);
      expect(userSettings.defaultPaymentMethodId).toBe(
        testData.defaultPaymentMethodId,
      );
      expect(userSettings.twoFactorAuth).toBe(testData.twoFactorAuth);
      expect(userSettings.loginAlerts).toBe(testData.loginAlerts);
      expect(userSettings.biometricLogin).toBe(testData.biometricLogin);
      expect(userSettings.offlineMode).toBe(testData.offlineMode);
      expect(userSettings.exportData).toBe(testData.exportData);
      expect(userSettings.allowExternalUserCreation).toBe(
        testData.allowExternalUserCreation,
      );
      expect(userSettings.externalUserNotifications).toBe(
        testData.externalUserNotifications,
      );
      expect(userSettings.externalUserPasswordReset).toBe(
        testData.externalUserPasswordReset,
      );
      expect(userSettings.externalUserPhoneVerification).toBe(
        testData.externalUserPhoneVerification,
      );
      expect(userSettings.defaultExternalUserContactMethod).toBe(
        testData.defaultExternalUserContactMethod,
      );
      expect(userSettings.autoMigrateExternalUsers).toBe(
        testData.autoMigrateExternalUsers,
      );
      expect(userSettings.externalUserExpiryDays).toBe(
        testData.externalUserExpiryDays,
      );
      expect(userSettings.externalUserReferenceEmailNotifications).toBe(
        testData.externalUserReferenceEmailNotifications,
      );
      expect(userSettings.defaultExternalUserRelationshipType).toBe(
        testData.defaultExternalUserRelationshipType,
      );
      expect(userSettings.allowedExternalUserRelationshipTypes).toEqual(
        testData.allowedExternalUserRelationshipTypes,
      );
      expect(userSettings.defaultInterestType).toBe(
        testData.defaultInterestType,
      );
      expect(userSettings.defaultInterestRate).toBe(
        testData.defaultInterestRate,
      );
      expect(userSettings.defaultLoanTermDays).toBe(
        testData.defaultLoanTermDays,
      );
      expect(userSettings.loanReminders).toBe(testData.loanReminders);
      expect(userSettings.loanReminderDays).toBe(testData.loanReminderDays);
      expect(userSettings.lateFeeNotifications).toBe(
        testData.lateFeeNotifications,
      );
      expect(userSettings.defaultLateFeeRate).toBe(testData.defaultLateFeeRate);
      expect(userSettings.autoCalculateInterest).toBe(
        testData.autoCalculateInterest,
      );
      expect(userSettings.recurringLoanReminders).toBe(
        testData.recurringLoanReminders,
      );
      expect(userSettings.emailDigests).toBe(testData.emailDigests);
      expect(userSettings.smsNotifications).toBe(testData.smsNotifications);
      expect(userSettings.browserNotifications).toBe(
        testData.browserNotifications,
      );
      expect(userSettings.notificationTime).toBe(testData.notificationTime);
      expect(userSettings.notificationTimezone).toBe(
        testData.notificationTimezone,
      );
      expect(userSettings.weekendNotifications).toBe(
        testData.weekendNotifications,
      );
      expect(userSettings.requirePasswordForLargeTransactions).toBe(
        testData.requirePasswordForLargeTransactions,
      );
      expect(userSettings.largeTransactionThreshold).toBe(
        testData.largeTransactionThreshold,
      );
      expect(userSettings.sessionTimeout).toBe(testData.sessionTimeout);
      expect(userSettings.loginLocationAlerts).toBe(
        testData.loginLocationAlerts,
      );
      expect(userSettings.deviceRememberMe).toBe(testData.deviceRememberMe);
      expect(userSettings.suspiciousActivityAlerts).toBe(
        testData.suspiciousActivityAlerts,
      );
      expect(userSettings.profileVisibility).toBe(testData.profileVisibility);
      expect(userSettings.transactionHistoryVisibility).toBe(
        testData.transactionHistoryVisibility,
      );
      expect(userSettings.allowDataSharing).toBe(testData.allowDataSharing);
      expect(userSettings.allowAnalytics).toBe(testData.allowAnalytics);
      expect(userSettings.autoBackup).toBe(testData.autoBackup);
      expect(userSettings.backupFrequency).toBe(testData.backupFrequency);
      expect(userSettings.dataRetentionDays).toBe(testData.dataRetentionDays);
      expect(userSettings.quickActions).toEqual(testData.quickActions);
      expect(userSettings.dashboardLayout).toBe(testData.dashboardLayout);
      expect(userSettings.createdAt).toEqual(testData.createdAt);
      expect(userSettings.updatedAt).toEqual(testData.updatedAt);
    });
  });

  describe('Nullable Properties', () => {
    it('should allow null values for nullable properties', () => {
      userSettings.defaultGroupId = null;
      userSettings.defaultCategoryId = null;
      userSettings.defaultPaymentMethodId = null;
      userSettings.allowedExternalUserRelationshipTypes = [];

      expect(userSettings.defaultGroupId).toBeNull();
      expect(userSettings.defaultCategoryId).toBeNull();
      expect(userSettings.defaultPaymentMethodId).toBeNull();
      expect(userSettings.allowedExternalUserRelationshipTypes).toEqual([]);
    });
  });

  describe('Array Properties', () => {
    it('should handle array properties correctly', () => {
      const testArray = ['friend', 'family', 'colleague'];
      userSettings.allowedExternalUserRelationshipTypes = testArray;
      userSettings.quickActions = [
        'add-expense',
        'create-loan',
        'view-balance',
      ];

      expect(userSettings.allowedExternalUserRelationshipTypes).toEqual(
        testArray,
      );
      expect(userSettings.quickActions).toEqual([
        'add-expense',
        'create-loan',
        'view-balance',
      ]);
    });

    it('should handle empty arrays', () => {
      userSettings.allowedExternalUserRelationshipTypes = [];
      userSettings.quickActions = [];

      expect(userSettings.allowedExternalUserRelationshipTypes).toEqual([]);
      expect(userSettings.quickActions).toEqual([]);
    });
  });

  describe('Date Properties', () => {
    it('should handle date properties correctly', () => {
      const testDate = new Date('2023-12-25T10:30:00Z');
      userSettings.createdAt = testDate;
      userSettings.updatedAt = testDate;

      expect(userSettings.createdAt).toEqual(testDate);
      expect(userSettings.updatedAt).toEqual(testDate);
    });

    it('should handle date properties correctly', () => {
      const testDate = new Date('2023-12-25T10:30:00Z');
      userSettings.createdAt = testDate;
      userSettings.updatedAt = testDate;

      expect(userSettings.createdAt).toEqual(testDate);
      expect(userSettings.updatedAt).toEqual(testDate);
    });
  });

  describe('Validation Scenarios', () => {
    it('should handle edge cases for numeric properties', () => {
      userSettings.defaultInterestRate = 0;
      userSettings.defaultInterestRate = 100;
      userSettings.defaultInterestRate = -5;
      userSettings.defaultInterestRate = 15.75;

      expect(userSettings.defaultInterestRate).toBe(15.75);
    });

    it('should handle edge cases for string properties', () => {
      userSettings.theme = '';
      userSettings.theme = 'dark';
      userSettings.theme = 'custom-theme-with-spaces';

      expect(userSettings.theme).toBe('custom-theme-with-spaces');
    });

    it('should handle edge cases for boolean properties', () => {
      userSettings.emailNotifications = true;
      userSettings.emailNotifications = false;
      userSettings.emailNotifications = true;

      expect(userSettings.emailNotifications).toBe(true);
    });
  });

  describe('Entity Methods', () => {
    it('should be able to create a new instance', () => {
      const newSettings = new UserSettings();
      expect(newSettings).toBeInstanceOf(UserSettings);
    });

    it('should be able to clone settings', () => {
      userSettings.userId = 'user-123';
      userSettings.theme = 'dark';
      userSettings.language = 'es';

      const clonedSettings = Object.assign(new UserSettings(), userSettings);

      expect(clonedSettings.userId).toBe(userSettings.userId);
      expect(clonedSettings.theme).toBe(userSettings.theme);
      expect(clonedSettings.language).toBe(userSettings.language);
    });
  });
});
