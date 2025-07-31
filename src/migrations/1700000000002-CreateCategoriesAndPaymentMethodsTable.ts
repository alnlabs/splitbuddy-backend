import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesAndPaymentMethodsTable1700000000002 implements MigrationInterface {
  name = 'CreateCategoriesAndPaymentMethodsTable1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_methods" ADD CONSTRAINT "FK_payment_methods_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_user_id" ON "categories" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_methods_user_id" ON "payment_methods" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_payment_methods_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_user_id"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "payment_methods" DROP CONSTRAINT "FK_payment_methods_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_user_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "payment_methods"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
} 