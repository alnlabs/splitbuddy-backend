import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsSharedToUserGroups1753276000000
  implements MigrationInterface
{
  name = 'AddIsSharedToUserGroups1753276000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_groups"
      ADD COLUMN "is_shared" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_groups"
      DROP COLUMN "is_shared"
    `);
  }
}
