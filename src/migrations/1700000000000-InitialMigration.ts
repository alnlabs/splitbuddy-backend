import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "first_name" character varying,
        "last_name" character varying,
        "phone" character varying,
        "middle_name" character varying,
        "date_of_birth" character varying,
        "gender" character varying,
        "nationality" character varying,
        "address" character varying,
        "city" character varying,
        "state" character varying,
        "country" character varying,
        "zip_code" character varying,
        "facebook_profile_url" character varying,
        "twitter_profile_url" character varying,
        "linkedin_profile_url" character varying,
        "github_profile_url" character varying,
        "website_url" character varying,
        "is_email_verified" boolean NOT NULL DEFAULT false,
        "is_phone_verified" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create user_groups table
    await queryRunner.query(`
      CREATE TABLE "user_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_name" character varying NOT NULL,
        "description" character varying,
        "currency" character varying NOT NULL DEFAULT 'USD',
        "author_id" uuid NOT NULL,
        "is_shared" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_groups" PRIMARY KEY ("id")
      )
    `);

    // Create user_group_members table
    await queryRunner.query(`
      CREATE TABLE "user_group_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_id" uuid NOT NULL,
        "user_id" uuid,
        "email" character varying NOT NULL,
        "full_name" character varying,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "is_registered" boolean NOT NULL DEFAULT false,
        "invited_at" TIMESTAMP,
        "accepted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_group_members" PRIMARY KEY ("id")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "color" character varying,
        "icon" character varying,
        "author_id" uuid NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // Create payment_methods table
    await queryRunner.query(`
      CREATE TABLE "payment_methods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "type" character varying NOT NULL DEFAULT 'CASH',
        "author_id" uuid NOT NULL,
        "is_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_methods" PRIMARY KEY ("id")
      )
    `);

    // Create expenses table
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_id" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "description" character varying,
        "date" TIMESTAMP NOT NULL,
        "category_id" uuid NOT NULL,
        "payment_method_id" uuid NOT NULL,
        "added_by" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "is_settled" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id")
      )
    `);

    // Create expense_splits table
    await queryRunner.query(`
      CREATE TABLE "expense_splits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "expense_id" uuid NOT NULL,
        "user_id" uuid,
        "email" character varying,
        "full_name" character varying,
        "amount" numeric(10,2) NOT NULL,
        "share_type" character varying NOT NULL DEFAULT 'EQUAL',
        "percentage" numeric(5,2),
        "notes" character varying,
        "is_settled" boolean NOT NULL DEFAULT false,
        "settled_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expense_splits" PRIMARY KEY ("id")
      )
    `);

    // Create transactions table
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "date" TIMESTAMP NOT NULL,
        "description" character varying,
        "counterparty" character varying,
        "interest_rate" numeric(5,2),
        "asset_type" character varying,
        "group_id" uuid,
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "recipient" character varying NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Create user_settings table
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "theme" character varying DEFAULT 'light',
        "language" character varying DEFAULT 'en',
        "currency" character varying DEFAULT 'USD',
        "email_notifications" boolean NOT NULL DEFAULT true,
        "push_notifications" boolean NOT NULL DEFAULT true,
        "in_app_notifications" boolean NOT NULL DEFAULT true,
        "reminders" boolean NOT NULL DEFAULT true,
        "default_group_id" uuid,
        "default_category_id" uuid,
        "default_payment_method_id" uuid,
        "two_factor_auth" boolean NOT NULL DEFAULT false,
        "login_alerts" boolean NOT NULL DEFAULT true,
        "biometric_login" boolean NOT NULL DEFAULT false,
        "offline_mode" boolean NOT NULL DEFAULT false,
        "cloud_sync" boolean NOT NULL DEFAULT true,
        "export_data" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_settings" PRIMARY KEY ("id")
      )
    `);

    // Create plans table
    await queryRunner.query(`
      CREATE TABLE "plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "amount" numeric(10,2) NOT NULL,
        "duration" integer NOT NULL,
        "category" character varying,
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plans" PRIMARY KEY ("id")
      )
    `);

    // Create chit_funds table
    await queryRunner.query(`
      CREATE TABLE "chit_funds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "total_amount" numeric(10,2) NOT NULL,
        "monthly_amount" numeric(10,2) NOT NULL,
        "duration" integer NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP,
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "group_id" uuid NOT NULL,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chit_funds" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_groups" ADD CONSTRAINT "FK_user_groups_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_payment_methods_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_category_id"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_payment_method_id"
      FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_added_by"
      FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expense_splits" ADD CONSTRAINT "FK_expense_splits_expense_id"
      FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expense_splits" ADD CONSTRAINT "FK_expense_splits_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings" ADD CONSTRAINT "FK_user_settings_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "plans" ADD CONSTRAINT "FK_plans_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "chit_funds" ADD CONSTRAINT "FK_chit_funds_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "chit_funds" ADD CONSTRAINT "FK_chit_funds_created_by"
      FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_username" ON "users" ("username")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_groups_author_id" ON "user_groups" ("author_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_group_members_group_id" ON "user_group_members" ("group_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_group_members_user_id" ON "user_group_members" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_group_id" ON "expenses" ("group_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_added_by" ON "expenses" ("added_by")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_expense_splits_expense_id" ON "expense_splits" ("expense_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_user_id" ON "transactions" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient" ON "notifications" ("recipient")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_settings_user_id" ON "user_settings" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_plans_user_id" ON "plans" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_chit_funds_group_id" ON "chit_funds" ("group_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_chit_funds_group_id"`);
    await queryRunner.query(`DROP INDEX "IDX_plans_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_settings_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_recipient"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_expense_splits_expense_id"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_added_by"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_group_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_group_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_groups_author_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_username"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "plans" DROP CONSTRAINT "FK_plans_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_user_settings_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_splits" DROP CONSTRAINT "FK_expense_splits_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expense_splits" DROP CONSTRAINT "FK_expense_splits_expense_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_added_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_payment_method_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_payment_methods_author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" DROP CONSTRAINT "FK_user_groups_author_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "chit_funds"`);
    await queryRunner.query(`DROP TABLE "plans"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "expense_splits"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TABLE "payment_methods"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "user_group_members"`);
    await queryRunner.query(`DROP TABLE "user_groups"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
