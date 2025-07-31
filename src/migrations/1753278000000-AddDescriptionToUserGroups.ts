import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToUserGroups1753278000000
  implements MigrationInterface
{
  name = 'AddDescriptionToUserGroups1753278000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_groups"
      ADD COLUMN "description" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_groups"
      DROP COLUMN "description"
    `);
  }
}
