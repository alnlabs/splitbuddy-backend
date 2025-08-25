import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoansTable1754311017000 implements MigrationInterface {
  name = 'CreateLoansTable1754311017000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create loan_type enum
    await queryRunner.query(`
      CREATE TYPE "loan_type_enum" AS ENUM ('given', 'taken')
    `);

    // Create loan_status enum
    await queryRunner.query(`
      CREATE TYPE "loan_status_enum" AS ENUM ('active', 'repaid', 'overdue', 'defaulted', 'cancelled')
    `);

    // Create interest_type enum
    await queryRunner.query(`
      CREATE TYPE "interest_type_enum" AS ENUM ('simple', 'compound', 'none')
    `);

    // Create payment_type enum
    await queryRunner.query(`
      CREATE TYPE "payment_type_enum" AS ENUM ('principal', 'interest', 'late_fee', 'partial')
    `);

    // Create loans table
    await queryRunner.query(`
      CREATE TABLE "loans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "loan_type" "loan_type_enum" NOT NULL,
        "lender_id" uuid NOT NULL,
        "borrower_id" uuid NOT NULL,
        "principal_amount" decimal(12,2) NOT NULL,
        "interest_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "total_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "paid_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "remaining_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "interest_rate" decimal(5,2),
        "interest_type" "interest_type_enum" NOT NULL DEFAULT 'simple',
        "start_date" date NOT NULL,
        "due_date" date NOT NULL,
        "repaid_date" date,
        "status" "loan_status_enum" NOT NULL DEFAULT 'active',
        "description" text,
        "notes" text,
        "group_id" uuid,
        "payment_method_id" uuid,
        "category_id" uuid,
        "author_id" uuid NOT NULL,
        "is_recurring" boolean NOT NULL DEFAULT false,
        "recurring_frequency" character varying,
        "recurring_amount" decimal(12,2),
        "next_payment_date" date,
        "reminder_enabled" boolean NOT NULL DEFAULT true,
        "reminder_days" integer NOT NULL DEFAULT 7,
        "collateral_description" text,
        "collateral_value" decimal(12,2),
        "late_fee_rate" decimal(5,2),
        "late_fee_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "documents" text[],
        "tags" text[],
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_loans" PRIMARY KEY ("id")
      )
    `);

    // Create loan_payments table
    await queryRunner.query(`
      CREATE TABLE "loan_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "loan_id" uuid NOT NULL,
        "payer_id" uuid NOT NULL,
        "payee_id" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "payment_type" "payment_type_enum" NOT NULL DEFAULT 'partial',
        "principal_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "interest_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "late_fee_amount" decimal(12,2) NOT NULL DEFAULT '0',
        "payment_date" date NOT NULL,
        "payment_method_id" uuid,
        "description" text,
        "notes" text,
        "reference_number" character varying,
        "transaction_id" character varying,
        "author_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_loan_payments" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints for loans table
    await queryRunner.query(`
      ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_lender_id"
      FOREIGN KEY ("lender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_borrower_id"
      FOREIGN KEY ("borrower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_payment_method_id"
      FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_category_id"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Add foreign key constraints for loan_payments table
    await queryRunner.query(`
      ALTER TABLE "loan_payments" ADD CONSTRAINT "FK_loan_payments_loan_id"
      FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loan_payments" ADD CONSTRAINT "FK_loan_payments_payer_id"
      FOREIGN KEY ("payer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loan_payments" ADD CONSTRAINT "FK_loan_payments_payee_id"
      FOREIGN KEY ("payee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loan_payments" ADD CONSTRAINT "FK_loan_payments_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "loan_payments" ADD CONSTRAINT "FK_loan_payments_payment_method_id"
      FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_loans_lender_id" ON "loans" ("lender_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loans_borrower_id" ON "loans" ("borrower_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loans_status" ON "loans" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loans_due_date" ON "loans" ("due_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loan_payments_loan_id" ON "loan_payments" ("loan_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loan_payments_payer_id" ON "loan_payments" ("payer_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loan_payments_payee_id" ON "loan_payments" ("payee_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_loan_payments_payment_date" ON "loan_payments" ("payment_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_loan_payments_payment_date"`);
    await queryRunner.query(`DROP INDEX "IDX_loan_payments_payee_id"`);
    await queryRunner.query(`DROP INDEX "IDX_loan_payments_payer_id"`);
    await queryRunner.query(`DROP INDEX "IDX_loan_payments_loan_id"`);
    await queryRunner.query(`DROP INDEX "IDX_loans_due_date"`);
    await queryRunner.query(`DROP INDEX "IDX_loans_status"`);
    await queryRunner.query(`DROP INDEX "IDX_loans_borrower_id"`);
    await queryRunner.query(`DROP INDEX "IDX_loans_lender_id"`);

    // Drop foreign key constraints for loan_payments
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_loan_payments_payment_method_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_loan_payments_author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_loan_payments_payee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_loan_payments_payer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loan_payments" DROP CONSTRAINT "FK_loan_payments_loan_id"`,
    );

    // Drop foreign key constraints for loans
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_category_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_payment_method_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_author_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_borrower_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_lender_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "loan_payments"`);
    await queryRunner.query(`DROP TABLE "loans"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "payment_type_enum"`);
    await queryRunner.query(`DROP TYPE "interest_type_enum"`);
    await queryRunner.query(`DROP TYPE "loan_status_enum"`);
    await queryRunner.query(`DROP TYPE "loan_type_enum"`);
  }
}
