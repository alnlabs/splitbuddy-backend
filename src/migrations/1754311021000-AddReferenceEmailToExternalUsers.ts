import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReferenceEmailToExternalUsers1754311021000
  implements MigrationInterface
{
  name = 'AddReferenceEmailToExternalUsers1754311021000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add reference_email column to external_users table
    await queryRunner.query(
      `ALTER TABLE "external_users" ADD COLUMN "reference_email" character varying`,
    );

    // Create index for reference_email for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_external_users_reference_email" ON "external_users" ("reference_email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_external_users_reference_email"`);

    // Drop reference_email column
    await queryRunner.query(
      `ALTER TABLE "external_users" DROP COLUMN "reference_email"`,
    );
  }
}
