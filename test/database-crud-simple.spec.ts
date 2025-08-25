import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Category } from '../src/entities/category.entity';
import { PaymentMethod } from '../src/entities/payment-method.entity';
import { Transaction } from '../src/entities/transaction.entity';
import { Expense } from '../src/entities/expense.entity';

import { Notification } from '../src/entities/notification.entity';
import { Loan } from '../src/entities/loan.entity';
import { LoanPayment } from '../src/entities/loan-payment.entity';
import { ChitFund } from '../src/entities/chit-fund.entity';
import { App } from '../src/entities/app.entity';
import { Client } from '../src/entities/client.entity';

describe('Simple Database CRUD Operations', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    // Load test environment
    require('dotenv').config({ path: '.env.test' });

    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5434'),
      username: process.env.DB_USERNAME || 'splitbuddy_user_test',
      password: process.env.DB_PASSWORD || 'SplitBuddy2024!Test',
      database: process.env.DB_DATABASE || 'splitbuddy_test',
      entities: [
        User,
        Category,
        PaymentMethod,
        Transaction,
        Expense,
        Notification,
        App,
        Client,
      ],
      synchronize: true,
      logging: false,
      dropSchema: true,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up all tables before each test by dropping and recreating schema
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('User Entity CRUD', () => {
    it('should perform full CRUD operations on User', async () => {
      const userRepository = dataSource.getRepository(User);

      // CREATE
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        password: 'hashedPassword123',
        enabled: true,
      };

      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);

      // READ
      const foundUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });
      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(userData.email);

      // UPDATE
      const updateData = { firstName: 'Jane', lastName: 'Smith' };
      await userRepository.update(savedUser.id, updateData);

      const updatedUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });
      expect(updatedUser!.firstName).toBe(updateData.firstName);
      expect(updatedUser!.lastName).toBe(updateData.lastName);

      // DELETE
      await userRepository.delete(savedUser.id);
      const deletedUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });
      expect(deletedUser).toBeNull();
    });
  });

  describe('Category Entity CRUD', () => {
    it('should perform full CRUD operations on Category', async () => {
      const categoryRepository = dataSource.getRepository(Category);

      // CREATE
      const categoryData = {
        name: 'Food & Dining',
      };

      const category = categoryRepository.create(categoryData);
      const savedCategory = await categoryRepository.save(category);

      expect(savedCategory).toBeDefined();
      expect(savedCategory.id).toBeDefined();
      expect(savedCategory.name).toBe(categoryData.name);

      // READ
      const foundCategory = await categoryRepository.findOne({
        where: { id: savedCategory.id },
      });
      expect(foundCategory).toBeDefined();
      expect(foundCategory!.name).toBe(categoryData.name);

      // UPDATE
      const updateData = { name: 'Restaurants' };
      await categoryRepository.update(savedCategory.id, updateData);

      const updatedCategory = await categoryRepository.findOne({
        where: { id: savedCategory.id },
      });
      expect(updatedCategory!.name).toBe(updateData.name);

      // DELETE
      await categoryRepository.delete(savedCategory.id);
      const deletedCategory = await categoryRepository.findOne({
        where: { id: savedCategory.id },
      });
      expect(deletedCategory).toBeNull();
    });
  });

  describe('PaymentMethod Entity CRUD', () => {
    it('should perform full CRUD operations on PaymentMethod', async () => {
      const paymentMethodRepository = dataSource.getRepository(PaymentMethod);

      // CREATE
      const paymentMethodData = {
        name: 'Credit Card',
      };

      const paymentMethod = paymentMethodRepository.create(paymentMethodData);
      const savedPaymentMethod =
        await paymentMethodRepository.save(paymentMethod);

      expect(savedPaymentMethod).toBeDefined();
      expect(savedPaymentMethod.id).toBeDefined();
      expect(savedPaymentMethod.name).toBe(paymentMethodData.name);

      // READ
      const foundPaymentMethod = await paymentMethodRepository.findOne({
        where: { id: savedPaymentMethod.id },
      });
      expect(foundPaymentMethod).toBeDefined();
      expect(foundPaymentMethod!.name).toBe(paymentMethodData.name);

      // UPDATE
      const updateData = { name: 'Debit Card' };
      await paymentMethodRepository.update(savedPaymentMethod.id, updateData);

      const updatedPaymentMethod = await paymentMethodRepository.findOne({
        where: { id: savedPaymentMethod.id },
      });
      expect(updatedPaymentMethod!.name).toBe(updateData.name);

      // DELETE
      await paymentMethodRepository.delete(savedPaymentMethod.id);
      const deletedPaymentMethod = await paymentMethodRepository.findOne({
        where: { id: savedPaymentMethod.id },
      });
      expect(deletedPaymentMethod).toBeNull();
    });
  });

  describe('Transaction Entity CRUD', () => {
    it('should perform full CRUD operations on Transaction', async () => {
      const transactionRepository = dataSource.getRepository(Transaction);

      // CREATE
      const transactionData = {
        amount: 100.5,
        description: 'Test transaction',
        type: 'expense' as any,
        status: 'COMPLETED',
        date: new Date(),
        userId: 'test-user-id',
      };

      const transaction = transactionRepository.create(transactionData);
      const savedTransaction = await transactionRepository.save(transaction);

      expect(savedTransaction).toBeDefined();
      expect(savedTransaction.id).toBeDefined();
      expect(savedTransaction.amount).toBe(transactionData.amount);

      // READ
      const foundTransaction = await transactionRepository.findOne({
        where: { id: savedTransaction.id },
      });
      expect(foundTransaction).toBeDefined();
      expect(parseFloat(foundTransaction!.amount.toString())).toBe(
        transactionData.amount,
      );

      // UPDATE
      const updateData = { amount: 150.75, description: 'Updated transaction' };
      await transactionRepository.update(savedTransaction.id, updateData);

      const updatedTransaction = await transactionRepository.findOne({
        where: { id: savedTransaction.id },
      });
      expect(parseFloat(updatedTransaction!.amount.toString())).toBe(
        updateData.amount,
      );

      // DELETE
      await transactionRepository.delete(savedTransaction.id);
      const deletedTransaction = await transactionRepository.findOne({
        where: { id: savedTransaction.id },
      });
      expect(deletedTransaction).toBeNull();
    });
  });

  describe('Expense Entity CRUD', () => {
    it('should perform full CRUD operations on Expense', async () => {
      const expenseRepository = dataSource.getRepository(Expense);
      const userRepository = dataSource.getRepository(User);
      const categoryRepository = dataSource.getRepository(Category);
      const paymentMethodRepository = dataSource.getRepository(PaymentMethod);

      // Create required entities first
      const user = await userRepository.save(
        userRepository.create({
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          password: 'hashedPassword123',
          enabled: true,
        }),
      );

      const category = await categoryRepository.save(
        categoryRepository.create({
          name: 'Test Category',
        }),
      );

      const paymentMethod = await paymentMethodRepository.save(
        paymentMethodRepository.create({
          name: 'Test Payment Method',
        }),
      );

      // CREATE
      const expenseData = {
        amount: 75.25,
        description: 'Lunch expense',
        date: new Date(),
        groupId: user.id, // Use user.id as a valid UUID
        categoryId: category.id,
        paymentMethodId: paymentMethod.id,
        addedBy: user.id,
        authorId: user.id,
      };

      const expense = expenseRepository.create(expenseData);
      const savedExpense = await expenseRepository.save(expense);

      expect(savedExpense).toBeDefined();
      expect(savedExpense.id).toBeDefined();
      expect(parseFloat(savedExpense.amount.toString())).toBe(
        expenseData.amount,
      );

      // READ
      const foundExpense = await expenseRepository.findOne({
        where: { id: savedExpense.id },
      });
      expect(foundExpense).toBeDefined();
      expect(parseFloat(foundExpense!.amount.toString())).toBe(
        expenseData.amount,
      );

      // UPDATE
      const updateData = { amount: 85.5, description: 'Updated lunch expense' };
      await expenseRepository.update(savedExpense.id, updateData);

      const updatedExpense = await expenseRepository.findOne({
        where: { id: savedExpense.id },
      });
      expect(parseFloat(updatedExpense!.amount.toString())).toBe(
        updateData.amount,
      );

      // DELETE
      await expenseRepository.delete(savedExpense.id);
      const deletedExpense = await expenseRepository.findOne({
        where: { id: savedExpense.id },
      });
      expect(deletedExpense).toBeNull();
    });
  });

  describe('Notification Entity CRUD', () => {
    it('should perform full CRUD operations on Notification', async () => {
      const notificationRepository = dataSource.getRepository(Notification);

      // CREATE
      const notificationData = {
        recipient: 'test@example.com',
        type: 'INFO',
        subject: 'Test Notification',
        content: 'This is a test notification',
        status: 'pending',
      };

      const notification = notificationRepository.create(notificationData);
      const savedNotification = await notificationRepository.save(notification);

      expect(savedNotification).toBeDefined();
      expect(savedNotification.id).toBeDefined();
      expect(savedNotification.content).toBe(notificationData.content);

      // READ
      const foundNotification = await notificationRepository.findOne({
        where: { id: savedNotification.id },
      });
      expect(foundNotification).toBeDefined();
      expect(foundNotification!.content).toBe(notificationData.content);

      // UPDATE
      const updateData = {
        status: 'sent',
        content: 'Updated notification content',
      };
      await notificationRepository.update(savedNotification.id, updateData);

      const updatedNotification = await notificationRepository.findOne({
        where: { id: savedNotification.id },
      });
      expect(updatedNotification!.status).toBe(updateData.status);

      // DELETE
      await notificationRepository.delete(savedNotification.id);
      const deletedNotification = await notificationRepository.findOne({
        where: { id: savedNotification.id },
      });
      expect(deletedNotification).toBeNull();
    });
  });

  describe('App Entity CRUD', () => {
    it('should perform full CRUD operations on App', async () => {
      const appRepository = dataSource.getRepository(App);

      // CREATE
      const appData = {
        appName: 'Test App',
        description: 'Test app description',
      };

      const app = appRepository.create(appData);
      const savedApp = await appRepository.save(app);

      expect(savedApp).toBeDefined();
      expect(savedApp.id).toBeDefined();
      expect(savedApp.appName).toBe(appData.appName);

      // READ
      const foundApp = await appRepository.findOne({
        where: { id: savedApp.id },
      });
      expect(foundApp).toBeDefined();
      expect(foundApp!.appName).toBe(appData.appName);

      // UPDATE
      const updateData = {
        appName: 'Updated App',
        description: 'Updated description',
      };
      await appRepository.update(savedApp.id, updateData);

      const updatedApp = await appRepository.findOne({
        where: { id: savedApp.id },
      });
      expect(updatedApp!.appName).toBe(updateData.appName);

      // DELETE
      await appRepository.delete(savedApp.id);
      const deletedApp = await appRepository.findOne({
        where: { id: savedApp.id },
      });
      expect(deletedApp).toBeNull();
    });
  });

  describe('Client Entity CRUD', () => {
    it('should perform full CRUD operations on Client', async () => {
      const clientRepository = dataSource.getRepository(Client);

      // CREATE
      const clientData = {
        clientName: 'Test Client',
        contactEmail: 'client@test.com',
        contactPhone: '+1234567890',
      };

      const client = clientRepository.create(clientData);
      const savedClient = await clientRepository.save(client);

      expect(savedClient).toBeDefined();
      expect(savedClient.id).toBeDefined();
      expect(savedClient.clientName).toBe(clientData.clientName);

      // READ
      const foundClient = await clientRepository.findOne({
        where: { id: savedClient.id },
      });
      expect(foundClient).toBeDefined();
      expect(foundClient!.clientName).toBe(clientData.clientName);

      // UPDATE
      const updateData = {
        clientName: 'Updated Client',
        contactEmail: 'updated@test.com',
      };
      await clientRepository.update(savedClient.id, updateData);

      const updatedClient = await clientRepository.findOne({
        where: { id: savedClient.id },
      });
      expect(updatedClient!.clientName).toBe(updateData.clientName);

      // DELETE
      await clientRepository.delete(savedClient.id);
      const deletedClient = await clientRepository.findOne({
        where: { id: savedClient.id },
      });
      expect(deletedClient).toBeNull();
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk create operations', async () => {
      const categoryRepository = dataSource.getRepository(Category);

      const categories = [
        { name: 'Food' },
        { name: 'Transport' },
        { name: 'Entertainment' },
        { name: 'Shopping' },
      ];

      const savedCategories = await categoryRepository.save(categories);

      expect(savedCategories).toHaveLength(4);
      expect(savedCategories[0].name).toBe('Food');
      expect(savedCategories[1].name).toBe('Transport');
    });

    it('should handle bulk delete operations', async () => {
      const categoryRepository = dataSource.getRepository(Category);

      // Create categories
      const categories = [{ name: 'Temp 1' }, { name: 'Temp 2' }];
      const savedCategories = await categoryRepository.save(categories);

      // Bulk delete
      await categoryRepository.delete(savedCategories.map((c) => c.id));

      // Verify deletion
      const remainingCategories = await categoryRepository.find({
        where: savedCategories.map((c) => ({ id: c.id })),
      });

      expect(remainingCategories).toHaveLength(0);
    });
  });

  describe('Query Operations', () => {
    it('should handle complex queries', async () => {
      const userRepository = dataSource.getRepository(User);

      // Create test users
      const users = [
        {
          email: 'user1@test.com',
          firstName: 'John',
          lastName: 'Doe',
          enabled: true,
        },
        {
          email: 'user2@test.com',
          firstName: 'Jane',
          lastName: 'Smith',
          enabled: true,
        },
        {
          email: 'user3@test.com',
          firstName: 'Bob',
          lastName: 'Johnson',
          enabled: false,
        },
      ];
      await userRepository.save(users);

      // Test complex query
      const enabledUsers = await userRepository
        .createQueryBuilder('user')
        .where('user.enabled = :enabled', { enabled: true })
        .andWhere('user.firstName LIKE :firstName', { firstName: '%John%' })
        .getMany();

      expect(enabledUsers).toHaveLength(1);
      expect(enabledUsers[0].firstName).toBe('John');
    });

    it('should handle aggregation queries', async () => {
      const transactionRepository = dataSource.getRepository(Transaction);

      // Create test transactions
      const transactions = [
        {
          amount: 100,
          type: 'expense' as any,
          status: 'COMPLETED',
          date: new Date(),
          userId: 'test-user-id',
        },
        {
          amount: 200,
          type: 'expense' as any,
          status: 'COMPLETED',
          date: new Date(),
          userId: 'test-user-id',
        },
        {
          amount: 300,
          type: 'income' as any,
          status: 'COMPLETED',
          date: new Date(),
          userId: 'test-user-id',
        },
      ];
      await transactionRepository.save(transactions);

      // Test aggregation
      const result = await transactionRepository
        .createQueryBuilder('transaction')
        .select('transaction.type', 'type')
        .addSelect('SUM(transaction.amount)', 'total')
        .groupBy('transaction.type')
        .getRawMany();

      expect(result).toHaveLength(2);

      const expenseTotal = result.find((r) => r.type === 'expense');
      const incomeTotal = result.find((r) => r.type === 'income');

      expect(parseFloat(expenseTotal.total)).toBe(300);
      expect(parseFloat(incomeTotal.total)).toBe(300);
    });
  });
});
