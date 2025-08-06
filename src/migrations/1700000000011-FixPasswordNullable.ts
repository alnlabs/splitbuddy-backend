import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPasswordNullable1700000000011 implements MigrationInterface {
  name = 'FixPasswordNullable1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make password nullable for Google OAuth users
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert password to NOT NULL
    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL
    `);
  }
}
