import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserGroupsTable1700000000001 implements MigrationInterface {
  name = 'CreateUserGroupsTable1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_groups table
    await queryRunner.query(`
      CREATE TABLE "user_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "author_id" uuid NOT NULL,
        "is_shared" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_groups" PRIMARY KEY ("id")
      )
    `);

    // Create user_group_members table
    await queryRunner.query(`
      CREATE TABLE "user_group_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "group_id" uuid NOT NULL,
        "role" character varying NOT NULL DEFAULT 'member',
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_group_members" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_groups" ADD CONSTRAINT "FK_user_groups_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_group_members" ADD CONSTRAINT "FK_user_group_members_group_id"
      FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_user_groups_author_id" ON "user_groups" ("author_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_group_members_user_id" ON "user_group_members" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_group_members_group_id" ON "user_group_members" ("group_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_group_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_group_members_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_groups_author_id"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_group_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_group_members" DROP CONSTRAINT "FK_user_group_members_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_groups" DROP CONSTRAINT "FK_user_groups_author_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "user_group_members"`);
    await queryRunner.query(`DROP TABLE "user_groups"`);
  }
}
