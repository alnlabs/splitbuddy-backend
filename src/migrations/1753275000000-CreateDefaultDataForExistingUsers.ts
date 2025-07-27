import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDefaultDataForExistingUsers1753275000000
  implements MigrationInterface
{
  name = 'CreateDefaultDataForExistingUsers1753275000000';

  // Default payment methods
  private defaultPaymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'UPI',
    'PayPal',
    'Venmo',
    'Apple Pay',
    'Google Pay',
    'Check',
  ];

  // Default categories
  private defaultCategories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Rent/Mortgage',
    'Insurance',
    'Education',
    'Travel',
    'Gifts',
    'Personal Care',
    'Home & Garden',
    'Business',
    'Investment',
    'Taxes',
    'Other',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all existing users
    const users = await queryRunner.query(
      `SELECT id FROM "user" WHERE "enabled" = true`,
    );

    console.log(`Found ${users.length} users to create default data for`);

    // Create default data for each user
    for (const user of users) {
      const userId = user.id;
      console.log(`Creating default data for user: ${userId}`);

      // Create default payment methods
      for (const methodName of this.defaultPaymentMethods) {
        try {
          await queryRunner.query(
            `INSERT INTO "payment_method" ("id", "name", "authorId", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())`,
            [methodName, userId],
          );
        } catch (error) {
          // If payment method already exists, skip it
          console.log(
            `Payment method ${methodName} already exists for user ${userId}`,
          );
        }
      }

      // Create default categories
      for (const categoryName of this.defaultCategories) {
        try {
          await queryRunner.query(
            `INSERT INTO "category" ("id", "name", "authorId", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())`,
            [categoryName, userId],
          );
        } catch (error) {
          // If category already exists, skip it
          console.log(
            `Category ${categoryName} already exists for user ${userId}`,
          );
        }
      }

      console.log(`✅ Default data created for user: ${userId}`);
    }

    console.log('Default data creation migration completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove default data (optional - you might want to keep it)
    console.log('Removing default data...');

    // Remove default payment methods
    await queryRunner.query(
      `DELETE FROM "payment_method" WHERE "name" IN (${this.defaultPaymentMethods.map(() => '?').join(',')})`,
      this.defaultPaymentMethods,
    );

    // Remove default categories
    await queryRunner.query(
      `DELETE FROM "category" WHERE "name" IN (${this.defaultCategories.map(() => '?').join(',')})`,
      this.defaultCategories,
    );

    console.log('Default data removal completed!');
  }
}
