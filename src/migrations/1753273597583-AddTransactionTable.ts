import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionTable1753273597583 implements MigrationInterface {
    name = 'AddTransactionTable1753273597583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "theme" character varying NOT NULL DEFAULT 'light', "language" character varying NOT NULL DEFAULT 'en', "currency" character varying NOT NULL DEFAULT 'INR', "emailNotifications" boolean NOT NULL DEFAULT true, "pushNotifications" boolean NOT NULL DEFAULT true, "inAppNotifications" boolean NOT NULL DEFAULT true, "reminders" boolean NOT NULL DEFAULT true, "defaultGroupId" character varying, "defaultCategoryId" character varying, "defaultPaymentMethodId" character varying, "twoFactorAuth" boolean NOT NULL DEFAULT false, "loginAlerts" boolean NOT NULL DEFAULT false, "biometricLogin" boolean NOT NULL DEFAULT false, "offlineMode" boolean NOT NULL DEFAULT false, "cloudSync" boolean NOT NULL DEFAULT false, "exportData" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL DEFAULT 'expense', "amount" numeric(12,2) NOT NULL, "date" date NOT NULL, "description" text, "counterparty" character varying, "interestRate" numeric(5,2), "assetType" character varying, "groupId" character varying, "status" character varying, "userId" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_token" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_expires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_expires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_token"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "user_settings"`);
    }

}
