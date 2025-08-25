import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ default: true })
  pushNotifications: boolean;

  @Column({ default: true })
  inAppNotifications: boolean; // Enable in-app notifications

  @Column({ default: true })
  reminders: boolean; // Enable reminders

  @Column({ nullable: true, type: 'uuid' })
  defaultGroupId: string | null; // Default group for new expenses

  @Column({ nullable: true, type: 'uuid' })
  defaultCategoryId: string | null; // Default category for new expenses

  @Column({ nullable: true, type: 'uuid' })
  defaultPaymentMethodId: string | null; // Default payment method

  @Column({ default: false })
  twoFactorAuth: boolean; // Enable two-factor authentication

  @Column({ default: true })
  loginAlerts: boolean; // Alert on new login

  @Column({ default: false })
  biometricLogin: boolean; // Enable biometric login

  @Column({ default: false })
  offlineMode: boolean; // Enable offline mode

  @Column({ default: true })
  exportData: boolean; // Allow data export

  // External User Settings
  @Column({ default: true })
  allowExternalUserCreation: boolean; // Allow creating external users

  @Column({ default: true })
  externalUserNotifications: boolean; // Notifications for external user activities

  @Column({ default: true })
  externalUserPasswordReset: boolean; // Allow password reset for external users

  @Column({ default: true })
  externalUserPhoneVerification: boolean; // Require phone verification for external users

  @Column({ default: 'email' })
  defaultExternalUserContactMethod: string; // email, phone, both

  @Column({ default: false })
  autoMigrateExternalUsers: boolean; // Auto-migrate external users to internal

  @Column({ default: 30 })
  externalUserExpiryDays: number; // Days before external user expires

  @Column({ default: true })
  externalUserReferenceEmailNotifications: boolean; // Notify reference email about external user activities

  @Column({ default: 'friend' })
  defaultExternalUserRelationshipType: string; // Default relationship type for external users

  @Column({ type: 'simple-array', nullable: true })
  allowedExternalUserRelationshipTypes: string[]; // Custom allowed relationship types

  // Loan Settings
  @Column({ default: 'simple' })
  defaultInterestType: string; // simple, compound, none

  @Column({ default: 0 })
  defaultInterestRate: number; // Default interest rate percentage

  @Column({ default: 30 })
  defaultLoanTermDays: number; // Default loan term in days

  @Column({ default: true })
  loanReminders: boolean; // Enable loan due date reminders

  @Column({ default: 7 })
  loanReminderDays: number; // Days before due date to send reminders

  @Column({ default: true })
  lateFeeNotifications: boolean; // Notify about late fees

  @Column({ default: 5 })
  defaultLateFeeRate: number; // Default late fee percentage

  @Column({ default: true })
  autoCalculateInterest: boolean; // Auto-calculate interest on loans

  @Column({ default: true })
  recurringLoanReminders: boolean; // Send recurring reminders for loans

  // Notification Settings
  @Column({ default: true })
  emailDigests: boolean; // Send email digests

  @Column({ default: false })
  smsNotifications: boolean; // Enable SMS notifications

  @Column({ default: true })
  browserNotifications: boolean; // Enable browser notifications

  @Column({ default: '09:00' })
  notificationTime: string; // Preferred time for notifications (HH:MM)

  @Column({ default: 'UTC' })
  notificationTimezone: string; // User's timezone for notifications

  @Column({ default: false })
  weekendNotifications: boolean; // Send notifications on weekends

  // Security Settings
  @Column({ default: true })
  requirePasswordForLargeTransactions: boolean; // Require password for large transactions

  @Column({ default: 1000 })
  largeTransactionThreshold: number; // Amount threshold for password requirement

  @Column({ default: 30 })
  sessionTimeout: number; // Session timeout in minutes

  @Column({ default: true })
  loginLocationAlerts: boolean; // Alert on login from new location

  @Column({ default: true })
  deviceRememberMe: boolean; // Remember trusted devices

  @Column({ default: true })
  suspiciousActivityAlerts: boolean; // Alert on suspicious activity

  // Privacy Settings
  @Column({ default: 'friends' })
  profileVisibility: string; // public, friends, private

  @Column({ default: 'private' })
  transactionHistoryVisibility: string; // public, friends, private

  @Column({ default: false })
  allowDataSharing: boolean; // Allow data sharing with third parties

  @Column({ default: true })
  allowAnalytics: boolean; // Allow analytics data collection

  // App Preferences
  @Column({ default: true })
  autoBackup: boolean; // Enable automatic backups

  @Column({ default: 'daily' })
  backupFrequency: string; // daily, weekly, monthly

  @Column({ default: 365 })
  dataRetentionDays: number; // Days to retain data

  @Column({ type: 'simple-array', default: ['add-expense', 'create-loan'] })
  quickActions: string[]; // Quick action buttons to show

  @Column({ default: 'default' })
  dashboardLayout: string; // Dashboard layout preference

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
