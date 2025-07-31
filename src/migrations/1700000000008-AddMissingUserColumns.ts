import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingUserColumns1700000000008 implements MigrationInterface {
  name = 'AddMissingUserColumns1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "phone" character varying,
      ADD COLUMN "middle_name" character varying,
      ADD COLUMN "gender" character varying,
      ADD COLUMN "nationality" character varying,
      ADD COLUMN "profile_picture" bytea,
      ADD COLUMN "address" character varying,
      ADD COLUMN "city" character varying,
      ADD COLUMN "state" character varying,
      ADD COLUMN "country" character varying,
      ADD COLUMN "zip_code" character varying,
      ADD COLUMN "social_security_number" character varying,
      ADD COLUMN "security_question" character varying,
      ADD COLUMN "security_answer" character varying,
      ADD COLUMN "two_factor_enabled" boolean NOT NULL DEFAULT false,
      ADD COLUMN "two_factor_method" character varying,
      ADD COLUMN "facebook_profile_url" text,
      ADD COLUMN "twitter_profile_url" text,
      ADD COLUMN "linkedin_profile_url" text,
      ADD COLUMN "github_profile_url" text,
      ADD COLUMN "website_url" text,
      ADD COLUMN "last_login_at" TIMESTAMP,
      ADD COLUMN "failed_login_attempts" integer NOT NULL DEFAULT 0,
      ADD COLUMN "enabled" boolean NOT NULL DEFAULT false,
      ADD COLUMN "locked" boolean NOT NULL DEFAULT false,
      ADD COLUMN "token" text,
      ADD COLUMN "reset_password_token" text,
      ADD COLUMN "reset_password_expires" TIMESTAMP,
      ADD COLUMN "activation_token" text,
      ADD COLUMN "activated" boolean NOT NULL DEFAULT false,
      ADD COLUMN "login_type" character varying NOT NULL DEFAULT 'LOCAL',
      ADD COLUMN "google_token" text,
      ADD COLUMN "client_id" uuid,
      ADD COLUMN "app_id" uuid
    `);

    // Add unique constraints
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD CONSTRAINT "UQ_users_token" UNIQUE ("token"),
      ADD CONSTRAINT "UQ_users_activation_token" UNIQUE ("activation_token")
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_users_client_id"
      FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD CONSTRAINT "FK_users_app_id"
      FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create indexes for new columns
    await queryRunner.query(
      `CREATE INDEX "IDX_users_phone" ON "users" ("phone")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_activated" ON "users" ("activated")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_enabled" ON "users" ("enabled")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_users_enabled"`);
    await queryRunner.query(`DROP INDEX "IDX_users_activated"`);
    await queryRunner.query(`DROP INDEX "IDX_users_phone"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_app_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_client_id"`,
    );

    // Drop unique constraints
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_activation_token"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_token"`,
    );

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "app_id",
      DROP COLUMN "client_id",
      DROP COLUMN "google_token",
      DROP COLUMN "login_type",
      DROP COLUMN "activated",
      DROP COLUMN "activation_token",
      DROP COLUMN "reset_password_expires",
      DROP COLUMN "reset_password_token",
      DROP COLUMN "token",
      DROP COLUMN "locked",
      DROP COLUMN "enabled",
      DROP COLUMN "failed_login_attempts",
      DROP COLUMN "last_login_at",
      DROP COLUMN "website_url",
      DROP COLUMN "github_profile_url",
      DROP COLUMN "linkedin_profile_url",
      DROP COLUMN "twitter_profile_url",
      DROP COLUMN "facebook_profile_url",
      DROP COLUMN "two_factor_method",
      DROP COLUMN "two_factor_enabled",
      DROP COLUMN "security_answer",
      DROP COLUMN "security_question",
      DROP COLUMN "social_security_number",
      DROP COLUMN "zip_code",
      DROP COLUMN "country",
      DROP COLUMN "state",
      DROP COLUMN "city",
      DROP COLUMN "address",
      DROP COLUMN "profile_picture",
      DROP COLUMN "nationality",
      DROP COLUMN "gender",
      DROP COLUMN "middle_name",
      DROP COLUMN "phone"
    `);
  }
} 