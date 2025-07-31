import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpensesAndSplitsTable1700000000003 implements MigrationInterface {
  name = 'CreateExpensesAndSplitsTable1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    // Add foreign key constraints
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

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_group_id" ON "expenses" ("group_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_category_id" ON "expenses" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_date" ON "expenses" ("date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expense_splits_expense_id" ON "expense_splits" ("expense_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expense_splits_user_id" ON "expense_splits" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_expense_splits_user_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_expense_splits_expense_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_expenses_date"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_category_id"`);
    await queryRunner.query(`DROP INDEX "IDX_expenses_group_id"`);

    // Drop foreign key constraints
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
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_payment_method_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "expenses" DROP CONSTRAINT "FK_expenses_category_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "expense_splits"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
  }
} 