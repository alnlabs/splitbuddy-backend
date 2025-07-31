import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientsAndChitFundsTable1700000000007
  implements MigrationInterface
{
  name = 'CreateClientsAndChitFundsTable1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(
      `CREATE INDEX "IDX_clients_user_id" ON "clients" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chit_funds_created_by" ON "chit_funds" ("created_by")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_chit_funds_created_by"`);
    await queryRunner.query(`DROP INDEX "IDX_clients_user_id"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chit_funds" DROP CONSTRAINT "FK_chit_funds_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_clients_user_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "chit_funds"`);
    await queryRunner.query(`DROP TABLE "clients"`);
  }
}
