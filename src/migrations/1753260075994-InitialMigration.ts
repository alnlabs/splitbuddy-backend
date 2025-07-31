import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1753260075994 implements MigrationInterface {
    name = 'InitialMigration1753260075994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "clients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "client_name" character varying NOT NULL,
                "contact_email" character varying NOT NULL,
                "contact_phone" character varying,
                "address" character varying,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_22f7e5f9138149a624c88dfcc84" UNIQUE ("client_name"),
                CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "apps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "app_name" character varying NOT NULL,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_a1cfadc38116e3d545a856c1522" UNIQUE ("app_name"),
                CONSTRAINT "PK_c5121fda0f8268f1f7f84134e19" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "password" character varying,
                "first_name" character varying NOT NULL,
                "last_name" character varying,
                "email" character varying NOT NULL,
                "phone" character varying,
                "middle_name" character varying,
                "date_of_birth" character varying,
                "gender" character varying,
                "nationality" character varying,
                "profile_picture" bytea,
                "address" character varying,
                "city" character varying,
                "state" character varying,
                "country" character varying,
                "zip_code" character varying,
                "social_security_number" character varying,
                "security_question" character varying,
                "security_answer" character varying,
                "two_factor_enabled" boolean NOT NULL DEFAULT false,
                "two_factor_method" character varying,
                "facebook_profile_url" text,
                "twitter_profile_url" text,
                "linkedin_profile_url" text,
                "github_profile_url" text,
                "website_url" text,
                "last_login_at" TIMESTAMP,
                "failed_login_attempts" integer NOT NULL DEFAULT '0',
                "enabled" boolean NOT NULL DEFAULT false,
                "locked" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "token" text,
                "activated" boolean NOT NULL DEFAULT false,
                "activation_token" text,
                "login_type" character varying NOT NULL DEFAULT 'LOCAL',
                "google_token" text,
                "client_id" uuid,
                "app_id" uuid,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "UQ_7869db61ed722d562da1acf6d59" UNIQUE ("token"),
                CONSTRAINT "UQ_89a1c9adfee558c580dd8a2b6aa" UNIQUE ("activation_token"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_groups" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "group_name" character varying NOT NULL,
                "currency" character varying NOT NULL,
                "author_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ea7760dc75ee1bf0b09ab9b3289" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_group_members" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "group_id" uuid NOT NULL,
                "user_id" uuid,
                "email" character varying NOT NULL,
                "full_name" character varying,
                "status" character varying NOT NULL DEFAULT 'INVITED',
                "is_registered" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "invited_at" TIMESTAMP,
                "accepted_at" TIMESTAMP,
                CONSTRAINT "PK_a8af4c59ba06ec2678d300f2dc7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "settings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "theme" character varying NOT NULL DEFAULT 'light',
                "default_category_id" uuid NOT NULL,
                "default_payment_method_id" uuid NOT NULL,
                "config" jsonb NOT NULL DEFAULT '{}',
                "author_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "payer_id" uuid NOT NULL,
                "payee_id" uuid NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "group_id" uuid NOT NULL,
                "payment_method" character varying,
                "author_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "payment_methods" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "author_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_a793d7354d7c3aaf76347ee5a66" UNIQUE ("name"),
                CONSTRAINT "PK_34f9b8c6dfb4ac3559f7e2820d1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "invitations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sender_id" uuid NOT NULL,
                "recipient_email" character varying NOT NULL,
                "group_id" uuid NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "token" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e577dcf9bb6d084373ed3998509" UNIQUE ("token"),
                CONSTRAINT "PK_5dec98cfdfd562e4ad3648bbb07" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "expenses" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "group_id" uuid NOT NULL,
                "amount" numeric(10, 2) NOT NULL,
                "category_id" uuid NOT NULL,
                "payment_method_id" uuid NOT NULL,
                "description" text,
                "date" TIMESTAMP NOT NULL,
                "added_by" uuid NOT NULL,
                "author_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "expense_splits" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "expense_id" uuid NOT NULL,
                "user_id" uuid,
                "email" character varying,
                "full_name" character varying,
                "amount" numeric(10, 2) NOT NULL,
                "share_type" character varying,
                "percentage" double precision,
                "notes" text,
                "is_settled" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_67774a6f95e6b4acf7a5ce861b0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "author_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"),
                CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_0d1e90d75674c54f8660c4ed446" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_d09943c291663c7fc13686e5486" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_d09943c291663c7fc13686e5486"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_0d1e90d75674c54f8660c4ed446"
        `);
        await queryRunner.query(`
            DROP TABLE "categories"
        `);
        await queryRunner.query(`
            DROP TABLE "expense_splits"
        `);
        await queryRunner.query(`
            DROP TABLE "expenses"
        `);
        await queryRunner.query(`
            DROP TABLE "invitations"
        `);
        await queryRunner.query(`
            DROP TABLE "payment_methods"
        `);
        await queryRunner.query(`
            DROP TABLE "payments"
        `);
        await queryRunner.query(`
            DROP TABLE "settings"
        `);
        await queryRunner.query(`
            DROP TABLE "user_group_members"
        `);
        await queryRunner.query(`
            DROP TABLE "user_groups"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "apps"
        `);
        await queryRunner.query(`
            DROP TABLE "clients"
        `);
    }

}
