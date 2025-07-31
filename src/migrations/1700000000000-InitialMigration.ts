import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "first_name" character varying,
        "last_name" character varying,
        "date_of_birth" character varying,
        "is_email_verified" boolean NOT NULL DEFAULT false,
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
        "name" character varying NOT NULL,
        "description" character varying,
        "author_id" uuid NOT NULL,
        "is_shared" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_groups" PRIMARY KEY ("id")
      )
    `);

    // Create user_group_members table
    await queryRunner.query(`
      CREATE TABLE "user_group_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "group_id" uuid NOT NULL,
        "role" character varying NOT NULL DEFAULT 'member',
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
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
        "user_id" uuid,
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
        "type" character varying NOT NULL,
        "user_id" uuid,
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
        "amount" decimal(10,2) NOT NULL,
        "description" character varying,
        "date" TIMESTAMP NOT NULL,
        "category_id" uuid,
        "payment_method_id" uuid,
        "group_id" uuid,
        "added_by" uuid NOT NULL,
        "author_id" uuid NOT NULL,
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
        "user_id" uuid NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "percentage" decimal(5,2),
        "share_type" character varying NOT NULL DEFAULT 'equal',
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
        "from_user_id" uuid NOT NULL,
        "to_user_id" uuid NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "description" character varying,
        "transaction_type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "group_id" uuid,
        "expense_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions" PRIMARY KEY ("id")
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "message" character varying NOT NULL,
        "type" character varying NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP,
        "data" jsonb,
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

    // Create payments table
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "payer_id" uuid NOT NULL,
        "payee_id" uuid NOT NULL,
        "amount" decimal(10,2) NOT NULL,
        "description" character varying,
        "payment_method_id" uuid,
        "status" character varying NOT NULL DEFAULT 'pending',
        "paid_at" TIMESTAMP,
        "group_id" uuid,
        "expense_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id")
      )
    `);

    // Create settings table
    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying NOT NULL,
        "value" jsonb NOT NULL,
        "description" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settings" PRIMARY KEY ("id")
      )
    `);

    // Create clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying,
        "phone" character varying,
        "address" character varying,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_clients" PRIMARY KEY ("id")
      )
    `);

    // Create chit_funds table
    await queryRunner.query(`
      CREATE TABLE "chit_funds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "total_amount" decimal(10,2) NOT NULL,
        "monthly_amount" decimal(10,2) NOT NULL,
        "duration_months" integer NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "group_id" uuid,
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
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_payment_methods_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_category_id"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_payment_method_id"
      FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
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
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_from_user_id"
      FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_to_user_id"
      FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_expense_id"
      FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

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

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_payer_id"
      FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_payee_id"
      FOREIGN KEY ("payee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_payment_method_id"
      FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_expense_id"
      FOREIGN KEY ("expense_id") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "clients" ADD CONSTRAINT "FK_clients_user_id"
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

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_groups_author_id" ON "user_groups" ("author_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_group_members_user_id" ON "user_group_members" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_group_members_group_id" ON "user_group_members" ("group_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_categories_user_id" ON "categories" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_methods_user_id" ON "payment_methods" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_expenses_group_id" ON "expenses" ("group_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_expenses_category_id" ON "expenses" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_expenses_date" ON "expenses" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_expense_splits_expense_id" ON "expense_splits" ("expense_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_expense_splits_user_id" ON "expense_splits" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_from_user_id" ON "transactions" ("from_user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_to_user_id" ON "transactions" ("to_user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read")`);
    await queryRunner.query(`CREATE INDEX "IDX_invitations_token" ON "invitations" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_invitations_email" ON "invitations" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_payer_id" ON "payments" ("payer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_payee_id" ON "payments" ("payee_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_clients_user_id" ON "clients" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_chit_funds_created_by" ON "chit_funds" ("created_by")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_chit_funds_created_by"`);
    await queryRunner.query(`DROP INDEX "IDX_clients_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_payee_id"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_payer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_invitations_email"`);
    await queryRunner.query(`DROP INDEX "IDX_invitations_token"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_is_read"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_to_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_from_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_expense_splits_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_expense_splits_expense_id"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_date"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_category_id"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_group_id"`);
    await queryRunner.query(`DROP INDEX "IDX_payment_methods_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_group_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_groups_author_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_username"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_created_by"`);
    await queryRunner.query(`ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_group_id"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "FK_clients_user_id"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_expense_id"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_group_id"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_payment_method_id"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_payee_id"`);
    await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_payer_id"`);
    await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_invitations_invited_by"`);
    await queryRunner.query(`ALTER TABLE "invitations" DROP CONSTRAINT "FK_invitations_group_id"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_user_settings_user_id"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user_id"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_expense_id"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_group_id"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_to_user_id"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_from_user_id"`);
    await queryRunner.query(`ALTER TABLE "expense_splits" DROP CONSTRAINT "FK_expense_splits_user_id"`);
    await queryRunner.query(`ALTER TABLE "expense_splits" DROP CONSTRAINT "FK_expense_splits_expense_id"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_author_id"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_added_by"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_group_id"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_payment_method_id"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_category_id"`);
    await queryRunner.query(`ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_payment_methods_user_id"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_user_id"`);
    await queryRunner.query(`ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_group_id"`);
    await queryRunner.query(`ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_user_id"`);
    await queryRunner.query(`ALTER TABLE "user_groups" DROP CONSTRAINT "FK_user_groups_author_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "chit_funds"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "invitations"`);
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