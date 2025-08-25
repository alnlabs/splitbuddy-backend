import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalUserSettings1754311022000
  implements MigrationInterface
{
  name = 'AddExternalUserSettings1754311022000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add external user settings columns to user_settings table
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "allowExternalUserCreation" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "externalUserNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "externalUserPasswordReset" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "externalUserPhoneVerification" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultExternalUserContactMethod" character varying NOT NULL DEFAULT 'email'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "autoMigrateExternalUsers" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "externalUserExpiryDays" integer NOT NULL DEFAULT 30`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "externalUserReferenceEmailNotifications" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "defaultExternalUserRelationshipType" character varying NOT NULL DEFAULT 'friend'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD COLUMN "allowedExternalUserRelationshipTypes" character varying`,
    );

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_user_settings_external_user" ON "user_settings" ("allowExternalUserCreation", "externalUserNotifications")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_settings_external_user"`);

    // Drop external user settings columns
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "allowedExternalUserRelationshipTypes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultExternalUserRelationshipType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "externalUserReferenceEmailNotifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "externalUserExpiryDays"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "autoMigrateExternalUsers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "defaultExternalUserContactMethod"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "externalUserPhoneVerification"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "externalUserPasswordReset"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "externalUserNotifications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "allowExternalUserCreation"`,
    );
  }
}
