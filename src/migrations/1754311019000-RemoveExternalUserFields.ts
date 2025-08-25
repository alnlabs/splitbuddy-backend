import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveExternalUserFields1754311019000
  implements MigrationInterface
{
  name = 'RemoveExternalUserFields1754311019000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove external user columns from loans table
    await queryRunner.query(
      `ALTER TABLE "loans" DROP COLUMN IF EXISTS "external_lender_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP COLUMN IF EXISTS "external_borrower_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back external user columns (if needed for rollback)
    await queryRunner.query(
      `ALTER TABLE "loans" ADD COLUMN "external_lender_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" ADD COLUMN "external_borrower_id" uuid`,
    );
  }
}
