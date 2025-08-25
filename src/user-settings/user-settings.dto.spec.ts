import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  UpdateUserSettingsDto,
  ExternalUserSettingsDto,
  LoanSettingsDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  PrivacySettingsDto,
  AppPreferencesDto,
} from './user-settings.dto';

describe('UserSettings DTOs', () => {
  describe('UpdateUserSettingsDto', () => {
    it('should be defined', () => {
      const dto = new UpdateUserSettingsDto();
      expect(dto).toBeDefined();
    });

    it('should validate with valid data', async () => {
      const validData = {
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        emailNotifications: true,
        pushNotifications: false,
        inAppNotifications: true,
        reminders: false,
        defaultGroupId: 'group-123',
        defaultCategoryId: 'category-456',
        defaultPaymentMethodId: 'payment-789',
        twoFactorAuth: true,
        loginAlerts: false,
        biometricLogin: true,
        offlineMode: false,
        exportData: true,
        allowExternalUserCreation: true,
        externalUserNotifications: false,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: false,
        defaultExternalUserContactMethod: 'email',
        autoMigrateExternalUsers: true,
        externalUserExpiryDays: 30,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'friend',
        allowedExternalUserRelationshipTypes: ['friend', 'family', 'colleague'],
        defaultInterestType: 'simple',
        defaultInterestRate: 5.5,
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

      const dto = plainToClass(UpdateUserSettingsDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const partialData = {
        theme: 'light',
        emailNotifications: false,
      };

      const dto = plainToClass(UpdateUserSettingsDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with empty object', async () => {
      const emptyData = {};

      const dto = plainToClass(UpdateUserSettingsDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('String validation', () => {
      it('should accept valid string values', async () => {
        const data = {
          theme: 'dark',
          language: 'es',
          currency: 'EUR',
          defaultGroupId: 'group-123',
          defaultCategoryId: 'category-456',
          defaultPaymentMethodId: 'payment-789',
          defaultExternalUserRelationshipType: 'colleague',
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept empty strings', async () => {
        const data = {
          theme: '',
          language: '',
          currency: '',
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Boolean validation', () => {
      it('should accept boolean values', async () => {
        const data = {
          emailNotifications: true,
          pushNotifications: false,
          inAppNotifications: true,
          reminders: false,
          twoFactorAuth: true,
          loginAlerts: false,
          biometricLogin: true,
          offlineMode: false,
          exportData: true,
          allowExternalUserCreation: false,
          externalUserNotifications: true,
          externalUserPasswordReset: false,
          externalUserPhoneVerification: true,
          autoMigrateExternalUsers: false,
          externalUserReferenceEmailNotifications: true,
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Number validation', () => {
      it('should accept valid number values', async () => {
        const data = {
          externalUserExpiryDays: 30,
          defaultInterestRate: 5.5,
          defaultLoanTermDays: 30,
          loanReminderDays: 7,
          defaultLateFeeRate: 5,
          largeTransactionThreshold: 1000,
          sessionTimeout: 30,
          dataRetentionDays: 365,
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept zero values', async () => {
        const data = {
          externalUserExpiryDays: 0,
          defaultInterestRate: 0,
          defaultLateFeeRate: 0,
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept negative values', async () => {
        const data = {
          externalUserExpiryDays: -1,
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Array validation', () => {
      it('should accept valid string arrays', async () => {
        const data = {
          allowedExternalUserRelationshipTypes: [
            'friend',
            'family',
            'colleague',
          ],
          quickActions: ['add-expense', 'create-loan', 'view-balance'],
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept empty arrays', async () => {
        const data = {
          allowedExternalUserRelationshipTypes: [],
          quickActions: [],
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should reject arrays with non-string elements', async () => {
        const data = {
          allowedExternalUserRelationshipTypes: ['friend', 123, 'colleague'],
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
      });
    });

    describe('Enum validation', () => {
      it('should accept valid enum values for defaultExternalUserContactMethod', async () => {
        const validValues = ['email', 'phone', 'both'];

        for (const value of validValues) {
          const data = {
            defaultExternalUserContactMethod: value,
          };

          const dto = plainToClass(UpdateUserSettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for defaultExternalUserContactMethod', async () => {
        const data = {
          defaultExternalUserContactMethod: 'invalid',
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });

      it('should accept valid enum values for defaultInterestType', async () => {
        const validValues = ['simple', 'compound', 'none'];

        for (const value of validValues) {
          const data = {
            defaultInterestType: value,
          };

          const dto = plainToClass(UpdateUserSettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for defaultInterestType', async () => {
        const data = {
          defaultInterestType: 'invalid',
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });

      it('should accept valid enum values for profileVisibility', async () => {
        const validValues = ['public', 'friends', 'private'];

        for (const value of validValues) {
          const data = {
            profileVisibility: value,
          };

          const dto = plainToClass(UpdateUserSettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for profileVisibility', async () => {
        const data = {
          profileVisibility: 'invalid',
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });

      it('should accept valid enum values for backupFrequency', async () => {
        const validValues = ['daily', 'weekly', 'monthly'];

        for (const value of validValues) {
          const data = {
            backupFrequency: value,
          };

          const dto = plainToClass(UpdateUserSettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for backupFrequency', async () => {
        const data = {
          backupFrequency: 'invalid',
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('Edge cases', () => {
      it('should handle null values', async () => {
        const data = {
          theme: null,
          emailNotifications: null,
          externalUserExpiryDays: null,
          allowedExternalUserRelationshipTypes: null,
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        // Null values should be allowed since all properties are optional
        expect(errors).toHaveLength(0);
      });

      it('should handle undefined values', async () => {
        const data = {
          theme: undefined,
          emailNotifications: undefined,
          externalUserExpiryDays: undefined,
          allowedExternalUserRelationshipTypes: undefined,
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        // Undefined values should be allowed since all properties are optional
        expect(errors).toHaveLength(0);
      });

      it('should handle mixed data types', async () => {
        const data = {
          theme: 'dark',
          emailNotifications: true,
          externalUserExpiryDays: 30,
          allowedExternalUserRelationshipTypes: ['friend', 'family'],
          defaultExternalUserContactMethod: 'email',
          defaultInterestType: 'simple',
          profileVisibility: 'friends',
          backupFrequency: 'daily',
        };

        const dto = plainToClass(UpdateUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('ExternalUserSettingsDto', () => {
    it('should be defined', () => {
      const dto = new ExternalUserSettingsDto();
      expect(dto).toBeDefined();
    });

    it('should validate with valid data', async () => {
      const validData = {
        allowExternalUserCreation: true,
        externalUserNotifications: false,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: false,
        defaultExternalUserContactMethod: 'phone',
        autoMigrateExternalUsers: true,
        externalUserExpiryDays: 60,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'colleague',
        allowedExternalUserRelationshipTypes: ['friend', 'family'],
      };

      const dto = plainToClass(ExternalUserSettingsDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const partialData = {
        allowExternalUserCreation: true,
        externalUserNotifications: false,
      };

      const dto = plainToClass(ExternalUserSettingsDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with empty object', async () => {
      const emptyData = {};

      const dto = plainToClass(ExternalUserSettingsDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('Boolean validation', () => {
      it('should accept boolean values', async () => {
        const data = {
          allowExternalUserCreation: true,
          externalUserNotifications: false,
          externalUserPasswordReset: true,
          externalUserPhoneVerification: false,
          autoMigrateExternalUsers: true,
          externalUserReferenceEmailNotifications: false,
        };

        const dto = plainToClass(ExternalUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Number validation', () => {
      it('should accept valid number values', async () => {
        const data = {
          externalUserExpiryDays: 30,
        };

        const dto = plainToClass(ExternalUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('String validation', () => {
      it('should accept valid string values', async () => {
        const data = {
          defaultExternalUserRelationshipType: 'friend',
        };

        const dto = plainToClass(ExternalUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Array validation', () => {
      it('should accept valid string arrays', async () => {
        const data = {
          allowedExternalUserRelationshipTypes: [
            'friend',
            'family',
            'colleague',
          ],
        };

        const dto = plainToClass(ExternalUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Enum validation', () => {
      it('should accept valid enum values for defaultExternalUserContactMethod', async () => {
        const validValues = ['email', 'phone', 'both'];

        for (const value of validValues) {
          const data = {
            defaultExternalUserContactMethod: value,
          };

          const dto = plainToClass(ExternalUserSettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for defaultExternalUserContactMethod', async () => {
        const data = {
          defaultExternalUserContactMethod: 'invalid',
        };

        const dto = plainToClass(ExternalUserSettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('Edge cases', () => {
      it('should handle null values', async () => {
        const data = {
          allowExternalUserCreation: null,
          externalUserExpiryDays: null,
          allowedExternalUserRelationshipTypes: null,
        };

        const dto = plainToClass(ExternalUserSettingsDto, data);
        const errors = await validate(dto);

        // Null values should be allowed since all properties are optional
        expect(errors).toHaveLength(0);
      });

      it('should handle undefined values', async () => {
        const data = {
          allowExternalUserCreation: undefined,
          externalUserExpiryDays: undefined,
          allowedExternalUserRelationshipTypes: undefined,
        };

        const dto = plainToClass(ExternalUserSettingsDto, data);
        const errors = await validate(dto);

        // Undefined values should be allowed since all properties are optional
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('LoanSettingsDto', () => {
    it('should be defined', () => {
      const dto = new LoanSettingsDto();
      expect(dto).toBeDefined();
    });

    it('should validate with valid data', async () => {
      const validData = {
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

      const dto = plainToClass(LoanSettingsDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const partialData = {
        defaultInterestType: 'compound',
        defaultInterestRate: 10,
      };

      const dto = plainToClass(LoanSettingsDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with empty object', async () => {
      const emptyData = {};

      const dto = plainToClass(LoanSettingsDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('Enum validation', () => {
      it('should accept valid enum values for defaultInterestType', async () => {
        const validValues = ['simple', 'compound', 'none'];

        for (const value of validValues) {
          const data = {
            defaultInterestType: value,
          };

          const dto = plainToClass(LoanSettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for defaultInterestType', async () => {
        const data = {
          defaultInterestType: 'invalid',
        };

        const dto = plainToClass(LoanSettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('Number validation', () => {
      it('should accept valid number values', async () => {
        const data = {
          defaultInterestRate: 5.5,
          defaultLoanTermDays: 30,
          loanReminderDays: 7,
          defaultLateFeeRate: 5,
        };

        const dto = plainToClass(LoanSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept zero values', async () => {
        const data = {
          defaultInterestRate: 0,
          defaultLateFeeRate: 0,
        };

        const dto = plainToClass(LoanSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Boolean validation', () => {
      it('should accept boolean values', async () => {
        const data = {
          loanReminders: true,
          lateFeeNotifications: false,
          autoCalculateInterest: true,
          recurringLoanReminders: false,
        };

        const dto = plainToClass(LoanSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('NotificationSettingsDto', () => {
    it('should be defined', () => {
      const dto = new NotificationSettingsDto();
      expect(dto).toBeDefined();
    });

    it('should validate with valid data', async () => {
      const validData = {
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

      const dto = plainToClass(NotificationSettingsDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const partialData = {
        emailNotifications: true,
        pushNotifications: false,
      };

      const dto = plainToClass(NotificationSettingsDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with empty object', async () => {
      const emptyData = {};

      const dto = plainToClass(NotificationSettingsDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('Boolean validation', () => {
      it('should accept boolean values', async () => {
        const data = {
          emailNotifications: true,
          pushNotifications: false,
          inAppNotifications: true,
          reminders: false,
          emailDigests: true,
          smsNotifications: false,
          browserNotifications: true,
          weekendNotifications: false,
        };

        const dto = plainToClass(NotificationSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('String validation', () => {
      it('should accept valid string values', async () => {
        const data = {
          notificationTime: '09:00',
          notificationTimezone: 'UTC',
        };

        const dto = plainToClass(NotificationSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept empty strings', async () => {
        const data = {
          notificationTime: '',
          notificationTimezone: '',
        };

        const dto = plainToClass(NotificationSettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('SecuritySettingsDto', () => {
    it('should be defined', () => {
      const dto = new SecuritySettingsDto();
      expect(dto).toBeDefined();
    });

    it('should validate with valid data', async () => {
      const validData = {
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

      const dto = plainToClass(SecuritySettingsDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const partialData = {
        twoFactorAuth: true,
        loginAlerts: false,
      };

      const dto = plainToClass(SecuritySettingsDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with empty object', async () => {
      const emptyData = {};

      const dto = plainToClass(SecuritySettingsDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('Boolean validation', () => {
      it('should accept boolean values', async () => {
        const data = {
          twoFactorAuth: true,
          loginAlerts: false,
          biometricLogin: true,
          requirePasswordForLargeTransactions: false,
          loginLocationAlerts: true,
          deviceRememberMe: false,
          suspiciousActivityAlerts: true,
        };

        const dto = plainToClass(SecuritySettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Number validation', () => {
      it('should accept valid number values', async () => {
        const data = {
          largeTransactionThreshold: 1000,
          sessionTimeout: 30,
        };

        const dto = plainToClass(SecuritySettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept zero values', async () => {
        const data = {
          largeTransactionThreshold: 0,
          sessionTimeout: 0,
        };

        const dto = plainToClass(SecuritySettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('PrivacySettingsDto', () => {
    it('should be defined', () => {
      const dto = new PrivacySettingsDto();
      expect(dto).toBeDefined();
    });

    it('should validate with valid data', async () => {
      const validData = {
        profileVisibility: 'friends',
        transactionHistoryVisibility: 'private',
        allowDataSharing: false,
        allowAnalytics: true,
      };

      const dto = plainToClass(PrivacySettingsDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const partialData = {
        profileVisibility: 'public',
        allowDataSharing: false,
      };

      const dto = plainToClass(PrivacySettingsDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with empty object', async () => {
      const emptyData = {};

      const dto = plainToClass(PrivacySettingsDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('Enum validation', () => {
      it('should accept valid enum values for profileVisibility', async () => {
        const validValues = ['public', 'friends', 'private'];

        for (const value of validValues) {
          const data = {
            profileVisibility: value,
          };

          const dto = plainToClass(PrivacySettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for profileVisibility', async () => {
        const data = {
          profileVisibility: 'invalid',
        };

        const dto = plainToClass(PrivacySettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });

      it('should accept valid enum values for transactionHistoryVisibility', async () => {
        const validValues = ['public', 'friends', 'private'];

        for (const value of validValues) {
          const data = {
            transactionHistoryVisibility: value,
          };

          const dto = plainToClass(PrivacySettingsDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for transactionHistoryVisibility', async () => {
        const data = {
          transactionHistoryVisibility: 'invalid',
        };

        const dto = plainToClass(PrivacySettingsDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });

    describe('Boolean validation', () => {
      it('should accept boolean values', async () => {
        const data = {
          allowDataSharing: true,
          allowAnalytics: false,
        };

        const dto = plainToClass(PrivacySettingsDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('AppPreferencesDto', () => {
    it('should be defined', () => {
      const dto = new AppPreferencesDto();
      expect(dto).toBeDefined();
    });

    it('should validate with valid data', async () => {
      const validData = {
        theme: 'dark',
        language: 'en',
        currency: 'USD',
        offlineMode: false,
        exportData: true,
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        quickActions: ['add-expense', 'create-loan'],
        dashboardLayout: 'default',
      };

      const dto = plainToClass(AppPreferencesDto, validData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with partial data', async () => {
      const partialData = {
        theme: 'light',
        language: 'es',
      };

      const dto = plainToClass(AppPreferencesDto, partialData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate with empty object', async () => {
      const emptyData = {};

      const dto = plainToClass(AppPreferencesDto, emptyData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    describe('String validation', () => {
      it('should accept valid string values', async () => {
        const data = {
          theme: 'dark',
          language: 'es',
          currency: 'EUR',
          dashboardLayout: 'compact',
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept empty strings', async () => {
        const data = {
          theme: '',
          language: '',
          currency: '',
          dashboardLayout: '',
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Boolean validation', () => {
      it('should accept boolean values', async () => {
        const data = {
          offlineMode: true,
          exportData: false,
          autoBackup: true,
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Number validation', () => {
      it('should accept valid number values', async () => {
        const data = {
          dataRetentionDays: 365,
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept zero values', async () => {
        const data = {
          dataRetentionDays: 0,
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });
    });

    describe('Array validation', () => {
      it('should accept valid string arrays', async () => {
        const data = {
          quickActions: ['add-expense', 'create-loan', 'view-balance'],
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should accept empty arrays', async () => {
        const data = {
          quickActions: [],
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should reject arrays with non-string elements', async () => {
        const data = {
          quickActions: ['add-expense', 123, 'create-loan'],
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
      });
    });

    describe('Enum validation', () => {
      it('should accept valid enum values for backupFrequency', async () => {
        const validValues = ['daily', 'weekly', 'monthly'];

        for (const value of validValues) {
          const data = {
            backupFrequency: value,
          };

          const dto = plainToClass(AppPreferencesDto, data);
          const errors = await validate(dto);

          expect(errors).toHaveLength(0);
        }
      });

      it('should reject invalid enum values for backupFrequency', async () => {
        const data = {
          backupFrequency: 'invalid',
        };

        const dto = plainToClass(AppPreferencesDto, data);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isEnum');
      });
    });
  });

  describe('DTO Comparison', () => {
    it('should have similar structure for overlapping properties', () => {
      const updateDto = new UpdateUserSettingsDto();
      const externalDto = new ExternalUserSettingsDto();

      // Check that ExternalUserSettingsDto properties are a subset of UpdateUserSettingsDto
      const externalProperties = [
        'allowExternalUserCreation',
        'externalUserNotifications',
        'externalUserPasswordReset',
        'externalUserPhoneVerification',
        'defaultExternalUserContactMethod',
        'autoMigrateExternalUsers',
        'externalUserExpiryDays',
        'externalUserReferenceEmailNotifications',
        'defaultExternalUserRelationshipType',
        'allowedExternalUserRelationshipTypes',
      ];

      externalProperties.forEach((property) => {
        expect(updateDto).toHaveProperty(property);
        expect(externalDto).toHaveProperty(property);
      });
    });

    it('should have consistent property types across DTOs', () => {
      const updateDto = new UpdateUserSettingsDto();
      const loanDto = new LoanSettingsDto();
      const notificationDto = new NotificationSettingsDto();
      const securityDto = new SecuritySettingsDto();
      const privacyDto = new PrivacySettingsDto();
      const appDto = new AppPreferencesDto();

      // Check that loan properties in UpdateUserSettingsDto match LoanSettingsDto
      const loanProperties = [
        'defaultInterestType',
        'defaultInterestRate',
        'defaultLoanTermDays',
        'loanReminders',
        'loanReminderDays',
        'lateFeeNotifications',
        'defaultLateFeeRate',
        'autoCalculateInterest',
        'recurringLoanReminders',
      ];

      loanProperties.forEach((property) => {
        expect(updateDto).toHaveProperty(property);
        expect(loanDto).toHaveProperty(property);
      });

      // Check that notification properties in UpdateUserSettingsDto match NotificationSettingsDto
      const notificationProperties = [
        'emailNotifications',
        'pushNotifications',
        'inAppNotifications',
        'reminders',
        'emailDigests',
        'smsNotifications',
        'browserNotifications',
        'notificationTime',
        'notificationTimezone',
        'weekendNotifications',
      ];

      notificationProperties.forEach((property) => {
        expect(updateDto).toHaveProperty(property);
        expect(notificationDto).toHaveProperty(property);
      });
    });
  });

  describe('DTO Validation Edge Cases', () => {
    it('should handle very large numbers', async () => {
      const data = {
        externalUserExpiryDays: Number.MAX_SAFE_INTEGER,
        defaultInterestRate: Number.MAX_SAFE_INTEGER,
        defaultLoanTermDays: Number.MAX_SAFE_INTEGER,
        loanReminderDays: Number.MAX_SAFE_INTEGER,
        defaultLateFeeRate: Number.MAX_SAFE_INTEGER,
        largeTransactionThreshold: Number.MAX_SAFE_INTEGER,
        sessionTimeout: Number.MAX_SAFE_INTEGER,
        dataRetentionDays: Number.MAX_SAFE_INTEGER,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Large numbers should be accepted by basic validation
      expect(errors).toHaveLength(0);
    });

    it('should handle very long strings', async () => {
      const longString = 'a'.repeat(10000);
      const data = {
        theme: longString,
        language: longString,
        currency: longString,
        defaultGroupId: longString,
        defaultCategoryId: longString,
        defaultPaymentMethodId: longString,
        defaultExternalUserRelationshipType: longString,
        notificationTime: longString,
        notificationTimezone: longString,
        // Exclude enum fields that would fail validation
        // profileVisibility: longString,
        // transactionHistoryVisibility: longString,
        // backupFrequency: longString,
        dashboardLayout: longString,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Long strings should be accepted by basic validation (except for enum fields)
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in strings', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      const data = {
        theme: specialChars,
        language: specialChars,
        currency: specialChars,
        defaultGroupId: specialChars,
        defaultCategoryId: specialChars,
        defaultPaymentMethodId: specialChars,
        defaultExternalUserRelationshipType: specialChars,
        notificationTime: specialChars,
        notificationTimezone: specialChars,
        // Exclude enum fields that would fail validation
        // profileVisibility: specialChars,
        // transactionHistoryVisibility: specialChars,
        // backupFrequency: specialChars,
        dashboardLayout: specialChars,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Special characters should be accepted by basic validation (except for enum fields)
      expect(errors).toHaveLength(0);
    });

    it('should handle unicode characters', async () => {
      const unicodeString = '🎉🚀💻中文日本語한국어';
      const data = {
        theme: unicodeString,
        language: unicodeString,
        currency: unicodeString,
        defaultGroupId: unicodeString,
        defaultCategoryId: unicodeString,
        defaultPaymentMethodId: unicodeString,
        defaultExternalUserRelationshipType: unicodeString,
        notificationTime: unicodeString,
        notificationTimezone: unicodeString,
        // Exclude enum fields that would fail validation
        // profileVisibility: unicodeString,
        // transactionHistoryVisibility: unicodeString,
        // backupFrequency: unicodeString,
        dashboardLayout: unicodeString,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Unicode characters should be accepted by basic validation (except for enum fields)
      expect(errors).toHaveLength(0);
    });

    it('should handle very large arrays', async () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
      const data = {
        allowedExternalUserRelationshipTypes: largeArray,
        quickActions: largeArray,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Large arrays should be accepted by basic validation
      expect(errors).toHaveLength(0);
    });

    it('should handle arrays with mixed data types', async () => {
      const mixedArray = ['string', 123, true, null, undefined, {}];
      const data = {
        allowedExternalUserRelationshipTypes: mixedArray,
        quickActions: mixedArray,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Should reject arrays with non-string elements
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should handle negative numbers for numeric fields', async () => {
      const data = {
        externalUserExpiryDays: -1,
        defaultInterestRate: -5.5,
        defaultLoanTermDays: -30,
        loanReminderDays: -7,
        defaultLateFeeRate: -10,
        largeTransactionThreshold: -1000,
        sessionTimeout: -30,
        dataRetentionDays: -365,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Negative numbers should be accepted by basic validation
      expect(errors).toHaveLength(0);
    });

    it('should handle decimal numbers for integer fields', async () => {
      const data = {
        externalUserExpiryDays: 30.5,
        defaultLoanTermDays: 30.7,
        loanReminderDays: 7.3,
        largeTransactionThreshold: 1000.99,
        sessionTimeout: 30.1,
        dataRetentionDays: 365.5,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Decimal numbers should be accepted by basic validation
      expect(errors).toHaveLength(0);
    });

    it('should handle boolean values for non-boolean fields', async () => {
      const data = {
        theme: true,
        language: false,
        currency: true,
        defaultGroupId: false,
        defaultCategoryId: true,
        defaultPaymentMethodId: false,
        defaultExternalUserRelationshipType: true,
        notificationTime: false,
        notificationTimezone: true,
        profileVisibility: false,
        transactionHistoryVisibility: true,
        backupFrequency: false,
        dashboardLayout: true,
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Should reject boolean values for string fields
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle string values for boolean fields', async () => {
      const data = {
        emailNotifications: 'true',
        pushNotifications: 'false',
        inAppNotifications: 'yes',
        reminders: 'no',
        twoFactorAuth: '1',
        loginAlerts: '0',
        biometricLogin: 'on',
        offlineMode: 'off',
        exportData: 'enabled',
        allowExternalUserCreation: 'disabled',
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Should reject string values for boolean fields
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle string values for numeric fields', async () => {
      const data = {
        externalUserExpiryDays: '30',
        defaultInterestRate: '5.5',
        defaultLoanTermDays: '30',
        loanReminderDays: '7',
        defaultLateFeeRate: '10',
        largeTransactionThreshold: '1000',
        sessionTimeout: '30',
        dataRetentionDays: '365',
      };

      const dto = plainToClass(UpdateUserSettingsDto, data);
      const errors = await validate(dto);

      // Should reject string values for numeric fields
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
