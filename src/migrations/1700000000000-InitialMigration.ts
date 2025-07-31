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
        "firstName" character varying,
        "lastName" character varying,
        "phone" character varying,
        "middleName" character varying,
        "dateOfBirth" character varying,
        "gender" character varying,
        "nationality" character varying,
        "address" character varying,
        "city" character varying,
        "state" character varying,
        "country" character varying,
        "zipCode" character varying,
        "facebookProfileUrl" character varying,
        "twitterProfileUrl" character varying,
        "linkedinProfileUrl" character varying,
        "githubProfileUrl" character varying,
        "websiteUrl" character varying,
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "isPhoneVerified" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "UQ_fe0bb3f6150f464c475d6920e6f" UNIQUE ("username"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create user_groups table
    await queryRunner.query(`
      CREATE TABLE "user_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "groupName" character varying NOT NULL,
        "description" character varying,
        "currency" character varying NOT NULL DEFAULT 'USD',
        "authorId" uuid NOT NULL,
        "isShared" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6a99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
      )
    `);

    // Create user_group_members table
    await queryRunner.query(`
      CREATE TABLE "user_group_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "groupId" uuid NOT NULL,
        "userId" uuid,
        "email" character varying NOT NULL,
        "fullName" character varying,
        "status" character varying NOT NULL DEFAULT 'PENDING',
        "isRegistered" boolean NOT NULL DEFAULT false,
        "invitedAt" TIMESTAMP,
        "acceptedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_7a99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
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
        "authorId" uuid NOT NULL,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_8a99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
      )
    `);

    // Create payment_methods table
    await queryRunner.query(`
      CREATE TABLE "payment_methods" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "type" character varying NOT NULL DEFAULT 'CASH',
        "authorId" uuid NOT NULL,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_9a99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
      )
    `);

    // Create expenses table
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "groupId" uuid NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "description" character varying,
        "date" TIMESTAMP NOT NULL,
        "categoryId" uuid NOT NULL,
        "paymentMethodId" uuid NOT NULL,
        "addedBy" uuid NOT NULL,
        "authorId" uuid NOT NULL,
        "isSettled" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_aa99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
      )
    `);

    // Create expense_splits table
    await queryRunner.query(`
      CREATE TABLE "expense_splits" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "expenseId" uuid NOT NULL,
        "userId" uuid,
        "email" character varying,
        "fullName" character varying,
        "amount" numeric(10,2) NOT NULL,
        "shareType" character varying NOT NULL DEFAULT 'EQUAL',
        "percentage" numeric(5,2),
        "notes" character varying,
        "isSettled" boolean NOT NULL DEFAULT false,
        "settledAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bb99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
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
        "interestRate" numeric(5,2),
        "assetType" character varying,
        "groupId" uuid,
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cc99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
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
        "isRead" boolean NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dd99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
      )
    `);

    // Create user_settings table
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "theme" character varying DEFAULT 'light',
        "language" character varying DEFAULT 'en',
        "currency" character varying DEFAULT 'USD',
        "emailNotifications" boolean NOT NULL DEFAULT true,
        "pushNotifications" boolean NOT NULL DEFAULT true,
        "inAppNotifications" boolean NOT NULL DEFAULT true,
        "reminders" boolean NOT NULL DEFAULT true,
        "defaultGroupId" uuid,
        "defaultCategoryId" uuid,
        "defaultPaymentMethodId" uuid,
        "twoFactorAuth" boolean NOT NULL DEFAULT false,
        "loginAlerts" boolean NOT NULL DEFAULT true,
        "biometricLogin" boolean NOT NULL DEFAULT false,
        "offlineMode" boolean NOT NULL DEFAULT false,
        "cloudSync" boolean NOT NULL DEFAULT true,
        "exportData" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ee99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
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
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ff99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
      )
    `);

    // Create chit_funds table
    await queryRunner.query(`
      CREATE TABLE "chit_funds" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "totalAmount" numeric(10,2) NOT NULL,
        "monthlyAmount" numeric(10,2) NOT NULL,
        "duration" integer NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP,
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "groupId" uuid NOT NULL,
        "createdBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_gg99432f3b3c0927c3a2c3c3c3c" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_groups" ADD CONSTRAINT "FK_user_groups_author" 
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_group" 
      FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_author" 
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_payment_methods_author" 
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_group" 
      FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_category" 
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_payment_method" 
      FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_added_by" 
      FOREIGN KEY ("addedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expenses" ADD CONSTRAINT "FK_expenses_author" 
      FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expense_splits" ADD CONSTRAINT "FK_expense_splits_expense" 
      FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "expense_splits" ADD CONSTRAINT "FK_expense_splits_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_group" 
      FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_transactions_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings" ADD CONSTRAINT "FK_user_settings_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "plans" ADD CONSTRAINT "FK_plans_user" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "chit_funds" ADD CONSTRAINT "FK_chit_funds_group" 
      FOREIGN KEY ("groupId") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "chit_funds" ADD CONSTRAINT "FK_chit_funds_created_by" 
      FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_users_username" ON "users" ("username")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_groups_author" ON "user_groups" ("authorId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_group_members_group" ON "user_group_members" ("groupId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_group_members_user" ON "user_group_members" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_group" ON "expenses" ("groupId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_added_by" ON "expenses" ("addedBy")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_expense_splits_expense" ON "expense_splits" ("expenseId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transactions_user" ON "transactions" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient" ON "notifications" ("recipient")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_settings_user" ON "user_settings" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_plans_user" ON "plans" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_chit_funds_group" ON "chit_funds" ("groupId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_chit_funds_group"`);
    await queryRunner.query(`DROP INDEX "IDX_plans_user"`);
    await queryRunner.query(`DROP INDEX "IDX_user_settings_user"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_recipient"`);
    await queryRunner.query(`DROP INDEX "IDX_transactions_user"`);
    await queryRunner.query(`DROP INDEX "IDX_expense_splits_expense"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_added_by"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_group"`);
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_user"`);
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_group"`);
    await queryRunner.query(`DROP INDEX "IDX_user_groups_author"`);
    await queryRunner.query(`DROP INDEX "IDX_users_username"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_created_by"`);
    await queryRunner.query(`ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_group"`);
    await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "FK_plans_user"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_user_settings_user"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_user"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_transactions_group"`);
    await queryRunner.query(`ALTER TABLE "expense_splits" DROP CONSTRAINT "FK_expense_splits_user"`);
    await queryRunner.query(`ALTER TABLE "expense_splits" DROP CONSTRAINT "FK_expense_splits_expense"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_author"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_added_by"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_payment_method"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_category"`);
    await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_group"`);
    await queryRunner.query(`ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_payment_methods_author"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_author"`);
    await queryRunner.query(`ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_user"`);
    await queryRunner.query(`ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_group"`);
    await queryRunner.query(`ALTER TABLE "user_groups" DROP CONSTRAINT "FK_user_groups_author"`);

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