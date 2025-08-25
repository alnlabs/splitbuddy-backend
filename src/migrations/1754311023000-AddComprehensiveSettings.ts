import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComprehensiveSettings1754311023000
  implements MigrationInterface
{
  name = 'AddComprehensiveSettings1754311023000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Loan Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultInterestType" character varying NOT NULL DEFAULT 'simple'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultInterestRate" numeric NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultLoanTermDays" integer NOT NULL DEFAULT 30`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "loanReminders" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "loanReminderDays" integer NOT NULL DEFAULT 7`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "lateFeeNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultLateFeeRate" numeric NOT NULL DEFAULT 5`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "autoCalculateInterest" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "allowRecurringLoans" boolean NOT NULL DEFAULT true`,
    );

    // Notification Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "emailDigest" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "emailDigestFrequency" character varying NOT NULL DEFAULT 'daily'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "smsNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "browserNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "notificationTime" character varying NOT NULL DEFAULT '09:00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "weekendNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "timezone" character varying NOT NULL DEFAULT 'UTC'`,
    );

    // Security Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "requirePasswordForTransactions" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "passwordRequiredAmount" numeric NOT NULL DEFAULT 1000`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "sessionTimeout" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "sessionTimeoutMinutes" integer NOT NULL DEFAULT 30`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "loginLocationAlerts" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "deviceRemembering" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "maxFailedLoginAttempts" integer NOT NULL DEFAULT 5`,
    );

    // Privacy Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "profileVisibility" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "shareTransactionHistory" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "showBalanceInGroups" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "allowDataExport" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "allowAnalytics" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "showActivityFeed" boolean NOT NULL DEFAULT true`,
    );

    // App Preferences
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultView" character varying NOT NULL DEFAULT 'list'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "itemsPerPage" integer NOT NULL DEFAULT 10`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "autoRefresh" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "autoRefreshInterval" integer NOT NULL DEFAULT 30`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "showTutorials" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "showWelcomeScreen" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "dateFormat" character varying NOT NULL DEFAULT 'en'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "timeFormat" character varying NOT NULL DEFAULT '12'`,
    );

    // Financial Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultCurrency" character varying NOT NULL DEFAULT 'INR'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "decimalPlaces" integer NOT NULL DEFAULT 2`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "roundUpAmounts" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "showCurrencySymbol" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "currencyPosition" character varying NOT NULL DEFAULT 'left'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "autoCategorize" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "smartSuggestions" boolean NOT NULL DEFAULT true`,
    );

    // Group Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "allowGroupInvites" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "groupNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "showGroupBalances" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "autoAcceptGroupInvites" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "allowGroupExpenseSharing" boolean NOT NULL DEFAULT true`,
    );

    // Backup & Sync Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "autoBackup" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "backupFrequency" character varying NOT NULL DEFAULT 'daily'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "syncOnWifiOnly" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "syncContacts" boolean NOT NULL DEFAULT true`,
    );

    // Accessibility Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "highContrast" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "largeText" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "screenReader" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "reduceMotion" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "colorBlindMode" boolean NOT NULL DEFAULT false`,
    );

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_user_settings_loan" ON "user_settings" ("loanReminders", "autoCalculateInterest")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_settings_notifications" ON "user_settings" ("emailNotifications", "pushNotifications", "smsNotifications")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_settings_security" ON "user_settings" ("requirePasswordForTransactions", "sessionTimeout")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_settings_security"`);
    await queryRunner.query(`DROP INDEX "IDX_user_settings_notifications"`);
    await queryRunner.query(`DROP INDEX "IDX_user_settings_loan"`);

    // Drop all the new columns (in reverse order)
    // Accessibility Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "colorBlindMode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "reduceMotion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "screenReader"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "largeText"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "highContrast"`,
    );

    // Backup & Sync Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "syncContacts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "syncOnWifiOnly"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "backupFrequency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "autoBackup"`,
    );

    // Group Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "allowGroupExpenseSharing"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "autoAcceptGroupInvites"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "showGroupBalances"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "groupNotifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "allowGroupInvites"`,
    );

    // Financial Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "smartSuggestions"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "autoCategorize"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "currencyPosition"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "showCurrencySymbol"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "roundUpAmounts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "decimalPlaces"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultCurrency"`,
    );

    // App Preferences
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "timeFormat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "dateFormat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "showWelcomeScreen"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "showTutorials"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "autoRefreshInterval"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "autoRefresh"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "itemsPerPage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultView"`,
    );

    // Privacy Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "showActivityFeed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "allowAnalytics"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "allowDataExport"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "showBalanceInGroups"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "shareTransactionHistory"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "profileVisibility"`,
    );

    // Security Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "maxFailedLoginAttempts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "deviceRemembering"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "loginLocationAlerts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "sessionTimeoutMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "sessionTimeout"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "passwordRequiredAmount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "requirePasswordForTransactions"`,
    );

    // Notification Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "timezone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "weekendNotifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "notificationTime"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "browserNotifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "smsNotifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "emailDigestFrequency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "emailDigest"`,
    );

    // Loan Settings
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "allowRecurringLoans"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "autoCalculateInterest"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultLateFeeRate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "lateFeeNotifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "loanReminderDays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "loanReminders"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultLoanTermDays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultInterestRate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultInterestType"`,
    );
  }
}
