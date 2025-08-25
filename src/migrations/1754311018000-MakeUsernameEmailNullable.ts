import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUsernameEmailNullable1754311018000
  implements MigrationInterface
{
  name = 'MakeUsernameEmailNullable1754311018000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make username and email nullable to support external users
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Make username and email NOT NULL again
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`,
    );
  }
}
