import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserSettingsTable1754311016000 implements MigrationInterface {
  name = 'FixUserSettingsTable1754311016000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the foreign key constraint exists and drop it
    const foreignKeyExists = await queryRunner.hasColumn(
      'user_settings',
      'user_id',
    );
    if (foreignKeyExists) {
      // Drop the foreign key constraint if it exists
      await queryRunner.query(`
        ALTER TABLE "user_settings" DROP CONSTRAINT IF EXISTS "FK_user_settings_user_id"
      `);

      // Rename user_id column to userId
      await queryRunner.query(`
        ALTER TABLE "user_settings" RENAME COLUMN "user_id" TO "userId"
      `);

      // Change the data type from uuid to character varying
      await queryRunner.query(`
        ALTER TABLE "user_settings" ALTER COLUMN "userId" TYPE character varying
      `);
    }

    // Add missing columns that exist in the entity but not in the old migration
    const hasThemeColumn = await queryRunner.hasColumn(
      'user_settings',
      'theme',
    );
    if (!hasThemeColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "theme" character varying NOT NULL DEFAULT 'light'
      `);
    }

    const hasEmailNotificationsColumn = await queryRunner.hasColumn(
      'user_settings',
      'emailNotifications',
    );
    if (!hasEmailNotificationsColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "emailNotifications" boolean NOT NULL DEFAULT true
      `);
    }

    const hasPushNotificationsColumn = await queryRunner.hasColumn(
      'user_settings',
      'pushNotifications',
    );
    if (!hasPushNotificationsColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "pushNotifications" boolean NOT NULL DEFAULT true
      `);
    }

    const hasInAppNotificationsColumn = await queryRunner.hasColumn(
      'user_settings',
      'inAppNotifications',
    );
    if (!hasInAppNotificationsColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "inAppNotifications" boolean NOT NULL DEFAULT true
      `);
    }

    const hasRemindersColumn = await queryRunner.hasColumn(
      'user_settings',
      'reminders',
    );
    if (!hasRemindersColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "reminders" boolean NOT NULL DEFAULT true
      `);
    }

    const hasDefaultGroupIdColumn = await queryRunner.hasColumn(
      'user_settings',
      'defaultGroupId',
    );
    if (!hasDefaultGroupIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "defaultGroupId" character varying
      `);
    }

    const hasDefaultCategoryIdColumn = await queryRunner.hasColumn(
      'user_settings',
      'defaultCategoryId',
    );
    if (!hasDefaultCategoryIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "defaultCategoryId" character varying
      `);
    }

    const hasDefaultPaymentMethodIdColumn = await queryRunner.hasColumn(
      'user_settings',
      'defaultPaymentMethodId',
    );
    if (!hasDefaultPaymentMethodIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "defaultPaymentMethodId" character varying
      `);
    }

    const hasTwoFactorAuthColumn = await queryRunner.hasColumn(
      'user_settings',
      'twoFactorAuth',
    );
    if (!hasTwoFactorAuthColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "twoFactorAuth" boolean NOT NULL DEFAULT false
      `);
    }

    const hasLoginAlertsColumn = await queryRunner.hasColumn(
      'user_settings',
      'loginAlerts',
    );
    if (!hasLoginAlertsColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "loginAlerts" boolean NOT NULL DEFAULT false
      `);
    }

    const hasBiometricLoginColumn = await queryRunner.hasColumn(
      'user_settings',
      'biometricLogin',
    );
    if (!hasBiometricLoginColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "biometricLogin" boolean NOT NULL DEFAULT false
      `);
    }

    const hasOfflineModeColumn = await queryRunner.hasColumn(
      'user_settings',
      'offlineMode',
    );
    if (!hasOfflineModeColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "offlineMode" boolean NOT NULL DEFAULT false
      `);
    }

    const hasCloudSyncColumn = await queryRunner.hasColumn(
      'user_settings',
      'cloudSync',
    );
    if (!hasCloudSyncColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "cloudSync" boolean NOT NULL DEFAULT false
      `);
    }

    const hasExportDataColumn = await queryRunner.hasColumn(
      'user_settings',
      'exportData',
    );
    if (!hasExportDataColumn) {
      await queryRunner.query(`
        ALTER TABLE "user_settings" ADD COLUMN "exportData" boolean NOT NULL DEFAULT false
      `);
    }

    // Update currency default to INR to match entity
    await queryRunner.query(`
      ALTER TABLE "user_settings" ALTER COLUMN "currency" SET DEFAULT 'INR'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration is designed to fix production issues
    // The down migration would be complex and potentially dangerous
    // So we'll leave it empty to prevent accidental rollback
    console.log('Down migration not implemented for safety reasons');
  }
}
