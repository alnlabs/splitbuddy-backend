import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Group } from '../src/entities/group.entity';
import { Category } from '../src/entities/category.entity';
import { PaymentMethod } from '../src/entities/payment-method.entity';
import { Transaction } from '../src/entities/transaction.entity';
import { Expense } from '../src/entities/expense.entity';
import { GroupMember } from '../src/entities/group-member.entity';
import { UserSettings } from '../src/entities/user-settings.entity';
import { Notification } from '../src/entities/notification.entity';
import { Loan } from '../src/entities/loan.entity';
import { LoanPayment } from '../src/entities/loan-payment.entity';
import { ChitFund } from '../src/entities/chit-fund.entity';
import { Plan } from '../src/entities/plan.entity';

describe('Comprehensive Database CRUD Operations', () => {
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
        Group,
        Category,
        PaymentMethod,
        Transaction,
        Expense,
        GroupMember,
        UserSettings,
        Notification,
        Loan,
        LoanPayment,
        ChitFund,
        Plan,
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
    // Clean up all tables before each test
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
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

  describe('Group Entity CRUD', () => {
    it('should perform full CRUD operations on Group', async () => {
      const groupRepository = dataSource.getRepository(Group);

      // CREATE
      const groupData = {
        name: 'Test Group',
        description: 'Test group description',
        currency: 'USD',
      };

      const group = groupRepository.create(groupData);
      const savedGroup = await groupRepository.save(group);

      expect(savedGroup).toBeDefined();
      expect(savedGroup.id).toBeDefined();
      expect(savedGroup.name).toBe(groupData.name);

      // READ
      const foundGroup = await groupRepository.findOne({
        where: { id: savedGroup.id },
      });
      expect(foundGroup).toBeDefined();
      expect(foundGroup!.name).toBe(groupData.name);

      // UPDATE
      const updateData = {
        name: 'Updated Group',
        description: 'Updated description',
      };
      await groupRepository.update(savedGroup.id, updateData);

      const updatedGroup = await groupRepository.findOne({
        where: { id: savedGroup.id },
      });
      expect(updatedGroup!.name).toBe(updateData.name);

      // DELETE
      await groupRepository.delete(savedGroup.id);
      const deletedGroup = await groupRepository.findOne({
        where: { id: savedGroup.id },
      });
      expect(deletedGroup).toBeNull();
    });
  });

  describe('Category Entity CRUD', () => {
    it('should perform full CRUD operations on Category', async () => {
      const categoryRepository = dataSource.getRepository(Category);

      // CREATE
      const categoryData = {
        name: 'Food & Dining',
        icon: '🍕',
        color: '#FF5733',
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
      const updateData = { name: 'Restaurants', icon: '🍽️' };
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
        type: 'CARD',
        icon: '💳',
        color: '#4CAF50',
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
      const updateData = { name: 'Debit Card', type: 'DEBIT' };
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
        type: 'EXPENSE',
        status: 'COMPLETED',
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
      expect(foundTransaction!.amount).toBe(transactionData.amount);

      // UPDATE
      const updateData = { amount: 150.75, description: 'Updated transaction' };
      await transactionRepository.update(savedTransaction.id, updateData);

      const updatedTransaction = await transactionRepository.findOne({
        where: { id: savedTransaction.id },
      });
      expect(updatedTransaction!.amount).toBe(updateData.amount);

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

      // CREATE
      const expenseData = {
        amount: 75.25,
        description: 'Lunch expense',
        date: new Date(),
        status: 'PENDING',
      };

      const expense = expenseRepository.create(expenseData);
      const savedExpense = await expenseRepository.save(expense);

      expect(savedExpense).toBeDefined();
      expect(savedExpense.id).toBeDefined();
      expect(savedExpense.amount).toBe(expenseData.amount);

      // READ
      const foundExpense = await expenseRepository.findOne({
        where: { id: savedExpense.id },
      });
      expect(foundExpense).toBeDefined();
      expect(foundExpense!.amount).toBe(expenseData.amount);

      // UPDATE
      const updateData = { amount: 85.5, description: 'Updated lunch expense' };
      await expenseRepository.update(savedExpense.id, updateData);

      const updatedExpense = await expenseRepository.findOne({
        where: { id: savedExpense.id },
      });
      expect(updatedExpense!.amount).toBe(updateData.amount);

      // DELETE
      await expenseRepository.delete(savedExpense.id);
      const deletedExpense = await expenseRepository.findOne({
        where: { id: savedExpense.id },
      });
      expect(deletedExpense).toBeNull();
    });
  });

  describe('GroupMember Entity CRUD', () => {
    it('should perform full CRUD operations on GroupMember', async () => {
      const groupMemberRepository = dataSource.getRepository(GroupMember);

      // CREATE
      const groupMemberData = {
        role: 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      };

      const groupMember = groupMemberRepository.create(groupMemberData);
      const savedGroupMember = await groupMemberRepository.save(groupMember);

      expect(savedGroupMember).toBeDefined();
      expect(savedGroupMember.id).toBeDefined();
      expect(savedGroupMember.role).toBe(groupMemberData.role);

      // READ
      const foundGroupMember = await groupMemberRepository.findOne({
        where: { id: savedGroupMember.id },
      });
      expect(foundGroupMember).toBeDefined();
      expect(foundGroupMember!.role).toBe(groupMemberData.role);

      // UPDATE
      const updateData = { role: 'ADMIN', status: 'ACTIVE' };
      await groupMemberRepository.update(savedGroupMember.id, updateData);

      const updatedGroupMember = await groupMemberRepository.findOne({
        where: { id: savedGroupMember.id },
      });
      expect(updatedGroupMember!.role).toBe(updateData.role);

      // DELETE
      await groupMemberRepository.delete(savedGroupMember.id);
      const deletedGroupMember = await groupMemberRepository.findOne({
        where: { id: savedGroupMember.id },
      });
      expect(deletedGroupMember).toBeNull();
    });
  });

  describe('UserSettings Entity CRUD', () => {
    it('should perform full CRUD operations on UserSettings', async () => {
      const userSettingsRepository = dataSource.getRepository(UserSettings);

      // CREATE
      const userSettingsData = {
        theme: 'dark',
        language: 'en',
        emailNotifications: true,
        currency: 'USD',
      };

      const userSettings = userSettingsRepository.create(userSettingsData);
      const savedUserSettings = await userSettingsRepository.save(userSettings);

      expect(savedUserSettings).toBeDefined();
      expect(savedUserSettings.id).toBeDefined();
      expect(savedUserSettings.theme).toBe(userSettingsData.theme);

      // READ
      const foundUserSettings = await userSettingsRepository.findOne({
        where: { id: savedUserSettings.id },
      });
      expect(foundUserSettings).toBeDefined();
      expect(foundUserSettings!.theme).toBe(userSettingsData.theme);

      // UPDATE
      const updateData = { theme: 'light', language: 'es' };
      await userSettingsRepository.update(savedUserSettings.id, updateData);

      const updatedUserSettings = await userSettingsRepository.findOne({
        where: { id: savedUserSettings.id },
      });
      expect(updatedUserSettings!.theme).toBe(updateData.theme);

      // DELETE
      await userSettingsRepository.delete(savedUserSettings.id);
      const deletedUserSettings = await userSettingsRepository.findOne({
        where: { id: savedUserSettings.id },
      });
      expect(deletedUserSettings).toBeNull();
    });
  });

  describe('Notification Entity CRUD', () => {
    it('should perform full CRUD operations on Notification', async () => {
      const notificationRepository = dataSource.getRepository(Notification);

      // CREATE
      const notificationData = {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'INFO',
        status: 'UNREAD',
      };

      const notification = notificationRepository.create(notificationData);
      const savedNotification = await notificationRepository.save(notification);

      expect(savedNotification).toBeDefined();
      expect(savedNotification.id).toBeDefined();
      expect(savedNotification.title).toBe(notificationData.title);

      // READ
      const foundNotification = await notificationRepository.findOne({
        where: { id: savedNotification.id },
      });
      expect(foundNotification).toBeDefined();
      expect(foundNotification!.title).toBe(notificationData.title);

      // UPDATE
      const updateData = {
        status: 'READ',
        message: 'Updated notification message',
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

  describe('Loan Entity CRUD', () => {
    it('should perform full CRUD operations on Loan', async () => {
      const loanRepository = dataSource.getRepository(Loan);

      // CREATE
      const loanData = {
        amount: 1000.0,
        interestRate: 5.5,
        term: 12,
        status: 'ACTIVE',
        description: 'Test loan',
      };

      const loan = loanRepository.create(loanData);
      const savedLoan = await loanRepository.save(loan);

      expect(savedLoan).toBeDefined();
      expect(savedLoan.id).toBeDefined();
      expect(savedLoan.amount).toBe(loanData.amount);

      // READ
      const foundLoan = await loanRepository.findOne({
        where: { id: savedLoan.id },
      });
      expect(foundLoan).toBeDefined();
      expect(foundLoan!.amount).toBe(loanData.amount);

      // UPDATE
      const updateData = { amount: 1500.0, status: 'PAID' };
      await loanRepository.update(savedLoan.id, updateData);

      const updatedLoan = await loanRepository.findOne({
        where: { id: savedLoan.id },
      });
      expect(updatedLoan!.amount).toBe(updateData.amount);

      // DELETE
      await loanRepository.delete(savedLoan.id);
      const deletedLoan = await loanRepository.findOne({
        where: { id: savedLoan.id },
      });
      expect(deletedLoan).toBeNull();
    });
  });

  describe('LoanPayment Entity CRUD', () => {
    it('should perform full CRUD operations on LoanPayment', async () => {
      const loanPaymentRepository = dataSource.getRepository(LoanPayment);

      // CREATE
      const loanPaymentData = {
        amount: 100.0,
        paymentDate: new Date(),
        status: 'COMPLETED',
        description: 'Monthly payment',
      };

      const loanPayment = loanPaymentRepository.create(loanPaymentData);
      const savedLoanPayment = await loanPaymentRepository.save(loanPayment);

      expect(savedLoanPayment).toBeDefined();
      expect(savedLoanPayment.id).toBeDefined();
      expect(savedLoanPayment.amount).toBe(loanPaymentData.amount);

      // READ
      const foundLoanPayment = await loanPaymentRepository.findOne({
        where: { id: savedLoanPayment.id },
      });
      expect(foundLoanPayment).toBeDefined();
      expect(foundLoanPayment!.amount).toBe(loanPaymentData.amount);

      // UPDATE
      const updateData = { amount: 150.0, status: 'PENDING' };
      await loanPaymentRepository.update(savedLoanPayment.id, updateData);

      const updatedLoanPayment = await loanPaymentRepository.findOne({
        where: { id: savedLoanPayment.id },
      });
      expect(updatedLoanPayment!.amount).toBe(updateData.amount);

      // DELETE
      await loanPaymentRepository.delete(savedLoanPayment.id);
      const deletedLoanPayment = await loanPaymentRepository.findOne({
        where: { id: savedLoanPayment.id },
      });
      expect(deletedLoanPayment).toBeNull();
    });
  });

  describe('ChitFund Entity CRUD', () => {
    it('should perform full CRUD operations on ChitFund', async () => {
      const chitFundRepository = dataSource.getRepository(ChitFund);

      // CREATE
      const chitFundData = {
        name: 'Test Chit Fund',
        amount: 10000.0,
        members: 20,
        duration: 20,
        status: 'ACTIVE',
      };

      const chitFund = chitFundRepository.create(chitFundData);
      const savedChitFund = await chitFundRepository.save(chitFund);

      expect(savedChitFund).toBeDefined();
      expect(savedChitFund.id).toBeDefined();
      expect(savedChitFund.name).toBe(chitFundData.name);

      // READ
      const foundChitFund = await chitFundRepository.findOne({
        where: { id: savedChitFund.id },
      });
      expect(foundChitFund).toBeDefined();
      expect(foundChitFund!.name).toBe(chitFundData.name);

      // UPDATE
      const updateData = { name: 'Updated Chit Fund', status: 'COMPLETED' };
      await chitFundRepository.update(savedChitFund.id, updateData);

      const updatedChitFund = await chitFundRepository.findOne({
        where: { id: savedChitFund.id },
      });
      expect(updatedChitFund!.name).toBe(updateData.name);

      // DELETE
      await chitFundRepository.delete(savedChitFund.id);
      const deletedChitFund = await chitFundRepository.findOne({
        where: { id: savedChitFund.id },
      });
      expect(deletedChitFund).toBeNull();
    });
  });

  describe('Plan Entity CRUD', () => {
    it('should perform full CRUD operations on Plan', async () => {
      const planRepository = dataSource.getRepository(Plan);

      // CREATE
      const planData = {
        name: 'Test Plan',
        description: 'Test plan description',
        type: 'SAVINGS',
        status: 'ACTIVE',
      };

      const plan = planRepository.create(planData);
      const savedPlan = await planRepository.save(plan);

      expect(savedPlan).toBeDefined();
      expect(savedPlan.id).toBeDefined();
      expect(savedPlan.name).toBe(planData.name);

      // READ
      const foundPlan = await planRepository.findOne({
        where: { id: savedPlan.id },
      });
      expect(foundPlan).toBeDefined();
      expect(foundPlan!.name).toBe(planData.name);

      // UPDATE
      const updateData = { name: 'Updated Plan', status: 'COMPLETED' };
      await planRepository.update(savedPlan.id, updateData);

      const updatedPlan = await planRepository.findOne({
        where: { id: savedPlan.id },
      });
      expect(updatedPlan!.name).toBe(updateData.name);

      // DELETE
      await planRepository.delete(savedPlan.id);
      const deletedPlan = await planRepository.findOne({
        where: { id: savedPlan.id },
      });
      expect(deletedPlan).toBeNull();
    });
  });

  describe('Complex Relationships', () => {
    it('should handle relationships between entities', async () => {
      const userRepository = dataSource.getRepository(User);
      const groupRepository = dataSource.getRepository(Group);
      const groupMemberRepository = dataSource.getRepository(GroupMember);

      // Create User
      const user = userRepository.create({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        password: 'hashedPassword123',
        enabled: true,
      });
      const savedUser = await userRepository.save(user);

      // Create Group
      const group = groupRepository.create({
        name: 'Test Group',
        description: 'Test group',
        currency: 'USD',
      });
      const savedGroup = await groupRepository.save(group);

      // Create GroupMember with relationships
      const groupMember = groupMemberRepository.create({
        role: 'ADMIN',
        status: 'ACTIVE',
        joinedAt: new Date(),
        user: savedUser,
        group: savedGroup,
      });
      const savedGroupMember = await groupMemberRepository.save(groupMember);

      // Verify relationships
      const foundGroupMember = await groupMemberRepository.findOne({
        where: { id: savedGroupMember.id },
        relations: ['user', 'group'],
      });

      expect(foundGroupMember).toBeDefined();
      expect(foundGroupMember!.user.id).toBe(savedUser.id);
      expect(foundGroupMember!.group.id).toBe(savedGroup.id);
    });
  });

  describe('Bulk Operations', () => {
    it('should handle bulk create operations', async () => {
      const categoryRepository = dataSource.getRepository(Category);

      const categories = [
        { name: 'Food', icon: '🍕', color: '#FF5733' },
        { name: 'Transport', icon: '🚗', color: '#4CAF50' },
        { name: 'Entertainment', icon: '🎬', color: '#2196F3' },
        { name: 'Shopping', icon: '🛍️', color: '#9C27B0' },
      ];

      const savedCategories = await categoryRepository.save(categories);

      expect(savedCategories).toHaveLength(4);
      expect(savedCategories[0].name).toBe('Food');
      expect(savedCategories[1].name).toBe('Transport');
    });

    it('should handle bulk update operations', async () => {
      const categoryRepository = dataSource.getRepository(Category);

      // Create categories first
      const categories = [
        { name: 'Category 1', icon: '📱', color: '#FF0000' },
        { name: 'Category 2', icon: '💻', color: '#00FF00' },
      ];
      const savedCategories = await categoryRepository.save(categories);

      // Bulk update
      await categoryRepository.update(
        savedCategories.map((c) => c.id),
        { color: '#000000' },
      );

      // Verify updates
      const updatedCategories = await categoryRepository.find({
        where: savedCategories.map((c) => ({ id: c.id })),
      });

      updatedCategories.forEach((category) => {
        expect(category.color).toBe('#000000');
      });
    });

    it('should handle bulk delete operations', async () => {
      const categoryRepository = dataSource.getRepository(Category);

      // Create categories
      const categories = [
        { name: 'Temp 1', icon: '🔥', color: '#FF0000' },
        { name: 'Temp 2', icon: '❄️', color: '#00FF00' },
      ];
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
        { amount: 100, type: 'EXPENSE', status: 'COMPLETED' },
        { amount: 200, type: 'EXPENSE', status: 'COMPLETED' },
        { amount: 300, type: 'INCOME', status: 'COMPLETED' },
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

      const expenseTotal = result.find((r) => r.type === 'EXPENSE');
      const incomeTotal = result.find((r) => r.type === 'INCOME');

      expect(parseFloat(expenseTotal.total)).toBe(300);
      expect(parseFloat(incomeTotal.total)).toBe(300);
    });
  });
});
