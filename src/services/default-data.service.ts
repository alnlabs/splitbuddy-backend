import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Category } from '../entities/category.entity';

@Injectable()
export class DefaultDataService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async createDefaultPaymentMethods(userId: string) {
    const defaultPaymentMethods = [
      { name: 'Cash', authorId: userId },
      { name: 'Credit Card', authorId: userId },
      { name: 'Debit Card', authorId: userId },
      { name: 'Bank Transfer', authorId: userId },
      { name: 'UPI', authorId: userId },
      { name: 'PayPal', authorId: userId },
      { name: 'Venmo', authorId: userId },
      { name: 'Apple Pay', authorId: userId },
      { name: 'Google Pay', authorId: userId },
      { name: 'Check', authorId: userId },
    ];

    const createdPaymentMethods = [];
    for (const method of defaultPaymentMethods) {
      try {
        const paymentMethod = this.paymentMethodRepo.create(method);
        await this.paymentMethodRepo.save(paymentMethod);
        createdPaymentMethods.push(paymentMethod);
      } catch {
        // If payment method already exists, skip it
        console.log(
          `Payment method ${method.name} already exists for user ${userId}`,
        );
      }
    }

    return createdPaymentMethods;
  }

  async createDefaultCategories(userId: string) {
    const defaultCategories = [
      { name: 'Food & Dining', authorId: userId },
      { name: 'Transportation', authorId: userId },
      { name: 'Shopping', authorId: userId },
      { name: 'Entertainment', authorId: userId },
      { name: 'Healthcare', authorId: userId },
      { name: 'Utilities', authorId: userId },
      { name: 'Rent/Mortgage', authorId: userId },
      { name: 'Insurance', authorId: userId },
      { name: 'Education', authorId: userId },
      { name: 'Travel', authorId: userId },
      { name: 'Gifts', authorId: userId },
      { name: 'Personal Care', authorId: userId },
      { name: 'Home & Garden', authorId: userId },
      { name: 'Business', authorId: userId },
      { name: 'Investment', authorId: userId },
      { name: 'Taxes', authorId: userId },
      { name: 'Other', authorId: userId },
    ];

    const createdCategories = [];
    for (const category of defaultCategories) {
      try {
        const newCategory = this.categoryRepo.create(category);
        await this.categoryRepo.save(newCategory);
        createdCategories.push(newCategory);
      } catch {
        // If category already exists, skip it
        console.log(
          `Category ${category.name} already exists for user ${userId}`,
        );
      }
    }

    return createdCategories;
  }

  async createDefaultDataForUser(userId: string) {
    try {
      const [paymentMethods, categories] = await Promise.all([
        this.createDefaultPaymentMethods(userId),
        this.createDefaultCategories(userId),
      ]);

      console.log(
        `Created ${paymentMethods.length} default payment methods for user ${userId}`,
      );
      console.log(
        `Created ${categories.length} default categories for user ${userId}`,
      );

      return {
        paymentMethods,
        categories,
      };
    } catch (error) {
      console.error('Error creating default data for user:', error);
      throw error;
    }
  }

  async checkDefaultDataStatus(userId: string) {
    try {
      // Check if user has payment methods and categories
      const paymentMethods = await this.paymentMethodRepo.find({
        where: { authorId: userId },
      });

      const categories = await this.categoryRepo.find({
        where: { authorId: userId },
      });

      const hasDefaultData = paymentMethods.length > 0 && categories.length > 0;

      return {
        hasDefaultData,
        paymentMethodsCount: paymentMethods.length,
        categoriesCount: categories.length,
        paymentMethods,
        categories,
      };
    } catch (error) {
      console.error('Error checking default data status for user:', error);
      throw error;
    }
  }
}
