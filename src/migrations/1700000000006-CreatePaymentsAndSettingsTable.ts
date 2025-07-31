import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsAndSettingsTable1700000000006 implements MigrationInterface {
  name = 'CreatePaymentsAndSettingsTable1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    // Add foreign key constraints
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

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_payer_id" ON "payments" ("payer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_payee_id" ON "payments" ("payee_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_payments_payee_id"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_payer_id"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_expense_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_payment_method_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_payee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_payer_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "payments"`);
  }
} 