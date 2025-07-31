import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationsTable1753274000000 implements MigrationInterface {
  name = 'AddNotificationsTable1753274000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "recipient" character varying NOT NULL,
        "type" character varying NOT NULL,
        "subject" character varying NOT NULL,
        "content" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "error" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
