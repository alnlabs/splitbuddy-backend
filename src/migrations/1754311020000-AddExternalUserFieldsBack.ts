import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalUserFieldsBack1754311020000
  implements MigrationInterface
{
  name = 'AddExternalUserFieldsBack1754311020000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add external user columns back to loans table
    await queryRunner.query(
      `ALTER TABLE "loans" ADD COLUMN "external_lender_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" ADD COLUMN "external_borrower_id" uuid`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_external_lender" FOREIGN KEY ("external_lender_id") REFERENCES "external_users"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" ADD CONSTRAINT "FK_loans_external_borrower" FOREIGN KEY ("external_borrower_id") REFERENCES "external_users"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_external_borrower"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_external_lender"`,
    );

    // Drop external user columns
    await queryRunner.query(
      `ALTER TABLE "loans" DROP COLUMN "external_borrower_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loans" DROP COLUMN "external_lender_id"`,
    );
  }
}
