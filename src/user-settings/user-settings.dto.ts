import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsIn,
} from 'class-validator';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @IsOptional()
  @IsString()
  defaultGroupId?: string;

  @IsOptional()
  @IsString()
  defaultCategoryId?: string;

  @IsOptional()
  @IsString()
  defaultPaymentMethodId?: string;

  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @IsOptional()
  @IsBoolean()
  loginAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  biometricLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  offlineMode?: boolean;

  @IsOptional()
  @IsBoolean()
  exportData?: boolean;

  // External User Settings
  @IsOptional()
  @IsBoolean()
  allowExternalUserCreation?: boolean;

  @IsOptional()
  @IsBoolean()
  externalUserNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  externalUserPasswordReset?: boolean;

  @IsOptional()
  @IsBoolean()
  externalUserPhoneVerification?: boolean;

  @IsOptional()
  @IsEnum(['email', 'phone', 'both'])
  defaultExternalUserContactMethod?: 'email' | 'phone' | 'both';

  @IsOptional()
  @IsBoolean()
  autoMigrateExternalUsers?: boolean;

  @IsOptional()
  @IsNumber()
  externalUserExpiryDays?: number;

  @IsOptional()
  @IsBoolean()
  externalUserReferenceEmailNotifications?: boolean;

  @IsOptional()
  @IsString()
  defaultExternalUserRelationshipType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedExternalUserRelationshipTypes?: string[];

  // Loan Settings
  @IsOptional()
  @IsEnum(['simple', 'compound', 'none'])
  defaultInterestType?: 'simple' | 'compound' | 'none';

  @IsOptional()
  @IsNumber()
  defaultInterestRate?: number;

  @IsOptional()
  @IsNumber()
  defaultLoanTermDays?: number;

  @IsOptional()
  @IsBoolean()
  loanReminders?: boolean;

  @IsOptional()
  @IsNumber()
  loanReminderDays?: number;

  @IsOptional()
  @IsBoolean()
  lateFeeNotifications?: boolean;

  @IsOptional()
  @IsNumber()
  defaultLateFeeRate?: number;

  @IsOptional()
  @IsBoolean()
  autoCalculateInterest?: boolean;

  @IsOptional()
  @IsBoolean()
  recurringLoanReminders?: boolean;

  // Notification Settings
  @IsOptional()
  @IsBoolean()
  emailDigests?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  browserNotifications?: boolean;

  @IsOptional()
  @IsString()
  notificationTime?: string;

  @IsOptional()
  @IsString()
  notificationTimezone?: string;

  @IsOptional()
  @IsBoolean()
  weekendNotifications?: boolean;

  // Security Settings
  @IsOptional()
  @IsBoolean()
  requirePasswordForLargeTransactions?: boolean;

  @IsOptional()
  @IsNumber()
  largeTransactionThreshold?: number;

  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @IsOptional()
  @IsBoolean()
  loginLocationAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  deviceRememberMe?: boolean;

  @IsOptional()
  @IsBoolean()
  suspiciousActivityAlerts?: boolean;

  // Privacy Settings
  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  profileVisibility?: 'public' | 'friends' | 'private';

  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  transactionHistoryVisibility?: 'public' | 'friends' | 'private';

  @IsOptional()
  @IsBoolean()
  allowDataSharing?: boolean;

  @IsOptional()
  @IsBoolean()
  allowAnalytics?: boolean;

  // App Preferences
  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  backupFrequency?: 'daily' | 'weekly' | 'monthly';

  @IsOptional()
  @IsNumber()
  dataRetentionDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quickActions?: string[];

  @IsOptional()
  @IsString()
  dashboardLayout?: string;
}

export class ExternalUserSettingsDto {
  @IsOptional()
  @IsBoolean()
  allowExternalUserCreation?: boolean;

  @IsOptional()
  @IsBoolean()
  externalUserNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  externalUserPasswordReset?: boolean;

  @IsOptional()
  @IsBoolean()
  externalUserPhoneVerification?: boolean;

  @IsOptional()
  @IsEnum(['email', 'phone', 'both'])
  defaultExternalUserContactMethod?: 'email' | 'phone' | 'both';

  @IsOptional()
  @IsBoolean()
  autoMigrateExternalUsers?: boolean;

  @IsOptional()
  @IsNumber()
  externalUserExpiryDays?: number;

  @IsOptional()
  @IsBoolean()
  externalUserReferenceEmailNotifications?: boolean;

  @IsOptional()
  @IsString()
  defaultExternalUserRelationshipType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedExternalUserRelationshipTypes?: string[];
}

export class LoanSettingsDto {
  @IsOptional()
  @IsEnum(['simple', 'compound', 'none'])
  defaultInterestType?: 'simple' | 'compound' | 'none';

  @IsOptional()
  @IsNumber()
  defaultInterestRate?: number;

  @IsOptional()
  @IsNumber()
  defaultLoanTermDays?: number;

  @IsOptional()
  @IsBoolean()
  loanReminders?: boolean;

  @IsOptional()
  @IsNumber()
  loanReminderDays?: number;

  @IsOptional()
  @IsBoolean()
  lateFeeNotifications?: boolean;

  @IsOptional()
  @IsNumber()
  defaultLateFeeRate?: number;

  @IsOptional()
  @IsBoolean()
  autoCalculateInterest?: boolean;

  @IsOptional()
  @IsBoolean()
  recurringLoanReminders?: boolean;
}

export class NotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @IsOptional()
  @IsBoolean()
  emailDigests?: boolean;

  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  browserNotifications?: boolean;

  @IsOptional()
  @IsString()
  notificationTime?: string;

  @IsOptional()
  @IsString()
  notificationTimezone?: string;

  @IsOptional()
  @IsBoolean()
  weekendNotifications?: boolean;
}

export class SecuritySettingsDto {
  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @IsOptional()
  @IsBoolean()
  loginAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  biometricLogin?: boolean;

  @IsOptional()
  @IsBoolean()
  requirePasswordForLargeTransactions?: boolean;

  @IsOptional()
  @IsNumber()
  largeTransactionThreshold?: number;

  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @IsOptional()
  @IsBoolean()
  loginLocationAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  deviceRememberMe?: boolean;

  @IsOptional()
  @IsBoolean()
  suspiciousActivityAlerts?: boolean;
}

export class PrivacySettingsDto {
  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  profileVisibility?: 'public' | 'friends' | 'private';

  @IsOptional()
  @IsEnum(['public', 'friends', 'private'])
  transactionHistoryVisibility?: 'public' | 'friends' | 'private';

  @IsOptional()
  @IsBoolean()
  allowDataSharing?: boolean;

  @IsOptional()
  @IsBoolean()
  allowAnalytics?: boolean;
}

export class AppPreferencesDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  offlineMode?: boolean;

  @IsOptional()
  @IsBoolean()
  exportData?: boolean;

  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  backupFrequency?: 'daily' | 'weekly' | 'monthly';

  @IsOptional()
  @IsNumber()
  dataRetentionDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  quickActions?: string[];

  @IsOptional()
  @IsString()
  dashboardLayout?: string;
}
