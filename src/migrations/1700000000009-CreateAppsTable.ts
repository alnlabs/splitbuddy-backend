import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppsTable1700000000009 implements MigrationInterface {
  name = 'CreateAppsTable1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create apps table
    await queryRunner.query(`
      CREATE TABLE "apps" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "app_name" character varying NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_apps_app_name" UNIQUE ("app_name"),
        CONSTRAINT "PK_apps" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_apps_app_name" ON "apps" ("app_name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_apps_app_name"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "apps"`);
  }
}
