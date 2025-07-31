import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateIsSharedDefault1753277000000 implements MigrationInterface {
  name = 'UpdateIsSharedDefault1753277000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_groups"
      ALTER COLUMN "is_shared" SET DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_groups"
      ALTER COLUMN "is_shared" SET DEFAULT true
    `);
  }
}
