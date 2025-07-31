import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSettingsAndInvitationsTable1700000000005 implements MigrationInterface {
  name = 'CreateUserSettingsAndInvitationsTable1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_settings table
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'USD',
        "timezone" character varying NOT NULL DEFAULT 'UTC',
        "language" character varying NOT NULL DEFAULT 'en',
        "notification_preferences" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_settings" PRIMARY KEY ("id")
      )
    `);

    // Create invitations table
    await queryRunner.query(`
      CREATE TABLE "invitations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "group_id" uuid NOT NULL,
        "invited_by" uuid NOT NULL,
        "token" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "expires_at" TIMESTAMP NOT NULL,
        "accepted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_invitations" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_settings" ADD CONSTRAINT "FK_user_settings_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "invitations" ADD CONSTRAINT "FK_invitations_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "invitations" ADD CONSTRAINT "FK_invitations_invited_by"
      FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_invitations_token" ON "invitations" ("token")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_invitations_email" ON "invitations" ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_invitations_email"`);
    await queryRunner.query(`DROP INDEX "IDX_invitations_token"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_invitations_invited_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_invitations_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_user_settings_user_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "invitations"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
  }
} 