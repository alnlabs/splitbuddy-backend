import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, QueryBuilder } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { ExpenseSplit } from '../entities/expense-split.entity';
import { UserGroupMember } from '../entities/user-group-member.entity';
import { NotificationService } from '../notification/notification.service';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let expenseRepo: any;
  let splitRepo: any;
  let groupMemberRepo: any;
  let notificationService: any;
  let dataSource: any;

  const mockExpense = {
    id: 'expense-1',
    groupId: 'group-1',
    amount: 100,
    categoryId: 'category-1',
    paymentMethodId: 'payment-1',
    description: 'Test expense',
    date: new Date(),
    addedBy: 'user-1',
    authorId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExpenseSplit = {
    id: 'split-1',
    expenseId: 'expense-1',
    userId: 'user-2',
    email: 'user2@example.com',
    fullName: 'User Two',
    amount: 50,
    shareType: 'EQUAL',
    percentage: 50,
    notes: 'Split note',
    isSettled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGroupMember = {
    id: 'member-1',
    groupId: 'group-1',
    userId: 'user-2',
    email: 'user2@example.com',
    status: 'ACTIVE',
  };

  beforeEach(async () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
      getMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: getRepositoryToken(Expense),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(ExpenseSplit),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(UserGroupMember),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            query: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendEmail: jest.fn(),
            sendInApp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    expenseRepo = module.get(getRepositoryToken(Expense));
    splitRepo = module.get(getRepositoryToken(ExpenseSplit));
    groupMemberRepo = module.get(getRepositoryToken(UserGroupMember));
    notificationService = module.get(NotificationService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an expense and notify group members', async () => {
      const createDto = {
        groupId: 'group-1',
        amount: 100,
        categoryId: 'category-1',
        paymentMethodId: 'payment-1',
        description: 'Test expense',
        date: new Date(),
        addedBy: 'user-1',
        authorId: 'user-1',
      };

      expenseRepo.create.mockReturnValue(mockExpense);
      expenseRepo.save.mockResolvedValue(mockExpense);
      groupMemberRepo.find.mockResolvedValue([mockGroupMember]);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      const result = await service.create(createDto);

      expect(expenseRepo.create).toHaveBeenCalledWith(createDto);
      expect(expenseRepo.save).toHaveBeenCalledWith(mockExpense);
      expect(groupMemberRepo.find).toHaveBeenCalledWith({
        where: { groupId: 'group-1', status: 'ACTIVE' },
      });
      expect(notificationService.sendInApp).toHaveBeenCalledWith(
        'user-2',
        expect.stringContaining('A new expense was added to your group'),
      );
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'user2@example.com',
        'New Group Expense',
        expect.stringContaining('A new expense was added to your group'),
      );
      expect(result).toEqual(mockExpense);
    });

    it('should not notify the expense creator', async () => {
      const createDto = {
        groupId: 'group-1',
        amount: 100,
        categoryId: 'category-1',
        paymentMethodId: 'payment-1',
        description: 'Test expense',
        date: new Date(),
        addedBy: 'user-1',
        authorId: 'user-1',
      };

      const groupMemberCreator = { ...mockGroupMember, userId: 'user-1' };

      expenseRepo.create.mockReturnValue(mockExpense);
      expenseRepo.save.mockResolvedValue(mockExpense);
      groupMemberRepo.find.mockResolvedValue([
        groupMemberCreator,
        mockGroupMember,
      ]);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      await service.create(createDto);

      expect(notificationService.sendInApp).toHaveBeenCalledTimes(1);
      expect(notificationService.sendInApp).toHaveBeenCalledWith(
        'user-2',
        expect.any(String),
      );
    });
  });

  describe('getById', () => {
    it('should return an expense by id', async () => {
      expenseRepo.findOne.mockResolvedValue(mockExpense);

      const result = await service.getById('expense-1');

      expect(expenseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'expense-1' },
      });
      expect(result).toEqual(mockExpense);
    });

    it('should return null when expense not found', async () => {
      expenseRepo.findOne.mockResolvedValue(null);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should return all expenses when no filters provided', async () => {
      expenseRepo.find.mockResolvedValue([mockExpense]);

      const result = await service.list();

      expect(expenseRepo.find).toHaveBeenCalledWith({
        where: {},
        order: { date: 'DESC' },
      });
      expect(result).toEqual([mockExpense]);
    });

    it('should filter by groupId', async () => {
      expenseRepo.find.mockResolvedValue([mockExpense]);

      const result = await service.list('group-1');

      expect(expenseRepo.find).toHaveBeenCalledWith({
        where: { groupId: 'group-1' },
        order: { date: 'DESC' },
      });
      expect(result).toEqual([mockExpense]);
    });

    it('should filter by userId', async () => {
      expenseRepo.find.mockResolvedValue([mockExpense]);

      const result = await service.list(undefined, 'user-1');

      expect(expenseRepo.find).toHaveBeenCalledWith({
        where: { addedBy: 'user-1' },
        order: { date: 'DESC' },
      });
      expect(result).toEqual([mockExpense]);
    });

    it('should filter by both groupId and userId', async () => {
      expenseRepo.find.mockResolvedValue([mockExpense]);

      const result = await service.list('group-1', 'user-1');

      expect(expenseRepo.find).toHaveBeenCalledWith({
        where: { groupId: 'group-1', addedBy: 'user-1' },
        order: { date: 'DESC' },
      });
      expect(result).toEqual([mockExpense]);
    });
  });

  describe('update', () => {
    it('should update an expense and notify group members', async () => {
      const updateDto = { description: 'Updated expense' };
      const updatedExpense = { ...mockExpense, description: 'Updated expense' };

      expenseRepo.update.mockResolvedValue({ affected: 1 });
      expenseRepo.findOne.mockResolvedValue(updatedExpense);
      groupMemberRepo.find.mockResolvedValue([mockGroupMember]);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      const result = await service.update('expense-1', updateDto);

      expect(expenseRepo.update).toHaveBeenCalledWith('expense-1', updateDto);
      expect(expenseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'expense-1' },
      });
      expect(notificationService.sendInApp).toHaveBeenCalledWith(
        'user-2',
        expect.stringContaining('An expense was updated in your group'),
      );
      expect(result).toEqual(updatedExpense);
    });

    it('should not notify when expense not found', async () => {
      const updateDto = { description: 'Updated expense' };

      expenseRepo.update.mockResolvedValue({ affected: 1 });
      expenseRepo.findOne.mockResolvedValue(null);

      const result = await service.update('expense-1', updateDto);

      expect(expenseRepo.update).toHaveBeenCalledWith('expense-1', updateDto);
      expect(groupMemberRepo.find).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an expense and notify group members', async () => {
      expenseRepo.findOne.mockResolvedValue(mockExpense);
      expenseRepo.delete.mockResolvedValue({ affected: 1 });
      groupMemberRepo.find.mockResolvedValue([mockGroupMember]);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      const result = await service.delete('expense-1');

      expect(expenseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'expense-1' },
      });
      expect(expenseRepo.delete).toHaveBeenCalledWith('expense-1');
      expect(notificationService.sendInApp).toHaveBeenCalledWith(
        'user-2',
        expect.stringContaining('An expense was deleted from your group'),
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should return deleted true even when expense not found', async () => {
      expenseRepo.findOne.mockResolvedValue(null);
      expenseRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete('non-existent');

      expect(expenseRepo.delete).toHaveBeenCalledWith('non-existent');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple expenses', async () => {
      const expenses = [
        {
          groupId: 'group-1',
          amount: 100,
          categoryId: 'cat-1',
          paymentMethodId: 'pm-1',
          date: new Date(),
          addedBy: 'user-1',
          authorId: 'user-1',
        },
        {
          groupId: 'group-1',
          amount: 200,
          categoryId: 'cat-2',
          paymentMethodId: 'pm-2',
          date: new Date(),
          addedBy: 'user-1',
          authorId: 'user-1',
        },
      ];

      const createdExpenses = expenses.map((exp, index) => ({
        ...exp,
        id: `expense-${index + 1}`,
      }));

      expenseRepo.create.mockImplementation((dto: any) => ({ ...dto }));
      expenseRepo.save.mockResolvedValue(createdExpenses);

      const result = await service.bulkCreate(expenses);

      expect(expenseRepo.create).toHaveBeenCalledTimes(2);
      expect(expenseRepo.save).toHaveBeenCalledWith(
        expect.arrayContaining(expenses.map((exp) => ({ ...exp }))),
      );
      expect(result).toEqual(createdExpenses);
    });

    it('should throw error for nested array input', async () => {
      const nestedExpenses = [[{ groupId: 'group-1', amount: 100 }]];

      await expect(service.bulkCreate(nestedExpenses)).rejects.toThrow(
        'Input to bulkCreate must be a flat array of expense objects',
      );
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple expenses', async () => {
      const updates = [
        { id: 'expense-1', data: { description: 'Updated 1' } },
        { id: 'expense-2', data: { description: 'Updated 2' } },
      ];

      const updatedExpenses = [
        { ...mockExpense, id: 'expense-1', description: 'Updated 1' },
        { ...mockExpense, id: 'expense-2', description: 'Updated 2' },
      ];

      expenseRepo.update.mockResolvedValue({ affected: 1 });
      expenseRepo.findOne
        .mockResolvedValueOnce(updatedExpenses[0])
        .mockResolvedValueOnce(updatedExpenses[1]);

      const result = await service.bulkUpdate(updates);

      expect(expenseRepo.update).toHaveBeenCalledTimes(2);
      expect(expenseRepo.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedExpenses);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple expenses', async () => {
      const ids = ['expense-1', 'expense-2'];
      expenseRepo.delete.mockResolvedValue({ affected: 2 });

      const result = await service.bulkDelete(ids);

      expect(expenseRepo.delete).toHaveBeenCalledWith(ids);
      expect(result).toEqual({ deleted: ids });
    });
  });

  describe('splitExpense', () => {
    it('should create expense splits and notify users', async () => {
      const splits = [
        { userId: 'user-2', amount: 50, email: 'user2@example.com' },
        { userId: 'user-3', amount: 50, email: 'user3@example.com' },
      ];

      const createdSplits = splits.map((split, index) => ({
        ...split,
        id: `split-${index + 1}`,
        expenseId: 'expense-1',
      }));

      expenseRepo.findOne.mockResolvedValue(mockExpense);
      dataSource
        .createQueryBuilder()
        .getRawOne.mockResolvedValue({ id: 'group-1', is_shared: true });
      splitRepo.create.mockImplementation((dto: any) => ({ ...dto }));
      splitRepo.save.mockResolvedValue(createdSplits);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      const result = await service.splitExpense('expense-1', splits);

      expect(expenseRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'expense-1' },
      });
      expect(splitRepo.create).toHaveBeenCalledTimes(2);
      expect(splitRepo.save).toHaveBeenCalledWith(
        expect.arrayContaining(
          splits.map((split) => ({ ...split, expenseId: 'expense-1' })),
        ),
      );
      expect(notificationService.sendInApp).toHaveBeenCalledTimes(2);
      expect(notificationService.sendEmail).toHaveBeenCalledTimes(2);
      expect(result).toEqual(createdSplits);
    });

    it('should throw error when expense not found', async () => {
      expenseRepo.findOne.mockResolvedValue(null);

      await expect(service.splitExpense('non-existent', [])).rejects.toThrow(
        'Expense not found',
      );
    });

    it('should throw error for unshared group', async () => {
      expenseRepo.findOne.mockResolvedValue(mockExpense);
      dataSource
        .createQueryBuilder()
        .getRawOne.mockResolvedValue({ id: 'group-1', is_shared: false });

      await expect(service.splitExpense('expense-1', [])).rejects.toThrow(
        'Cannot split expenses in unshared (Personal) groups. These groups are for tracking purposes only.',
      );
    });

    it('should throw error for nested array input', async () => {
      const nestedSplits = [[{ userId: 'user-2', amount: 50 }]];

      await expect(
        service.splitExpense('expense-1', nestedSplits),
      ).rejects.toThrow(
        'Input to splitExpense must be a flat array of split objects',
      );
    });
  });

  describe('getExpenseSplits', () => {
    it('should return splits for an expense', async () => {
      const splits = [mockExpenseSplit];
      splitRepo.find.mockResolvedValue(splits);

      const result = await service.getExpenseSplits('expense-1');

      expect(splitRepo.find).toHaveBeenCalledWith({
        where: { expenseId: 'expense-1' },
      });
      expect(result).toEqual(splits);
    });
  });

  describe('settleSplit', () => {
    it('should settle a split and notify user', async () => {
      const unsettledSplit = { ...mockExpenseSplit, isSettled: false };
      const settledSplit = { ...mockExpenseSplit, isSettled: true };

      splitRepo.findOne.mockResolvedValue(unsettledSplit);
      splitRepo.save.mockResolvedValue(settledSplit);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      const result = await service.settleSplit('split-1');

      expect(splitRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'split-1' },
      });
      expect(splitRepo.save).toHaveBeenCalledWith(settledSplit);
      expect(notificationService.sendInApp).toHaveBeenCalledWith(
        'user-2',
        'Your split has been settled.',
      );
      expect(notificationService.sendEmail).toHaveBeenCalledWith(
        'user2@example.com',
        'Split Settled',
        'Your split has been settled.',
      );
      expect(result).toEqual(settledSplit);
    });

    it('should throw error when split not found', async () => {
      splitRepo.findOne.mockResolvedValue(null);

      await expect(service.settleSplit('non-existent')).rejects.toThrow(
        'Split not found',
      );
    });
  });

  describe('getUserSplits', () => {
    it('should return splits for a user', async () => {
      const splits = [mockExpenseSplit];
      splitRepo.find.mockResolvedValue(splits);

      const result = await service.getUserSplits('user-2');

      expect(splitRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-2' },
      });
      expect(result).toEqual(splits);
    });
  });

  describe('listByCategory', () => {
    it('should return expenses by category', async () => {
      const expenses = [mockExpense];
      expenseRepo.find.mockResolvedValue(expenses);

      const result = await service.listByCategory('category-1');

      expect(expenseRepo.find).toHaveBeenCalledWith({
        where: { categoryId: 'category-1' },
        order: { date: 'DESC' },
      });
      expect(result).toEqual(expenses);
    });
  });

  describe('listByDateRange', () => {
    it('should return expenses within date range', async () => {
      const expenses = [mockExpense];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expenses),
      };

      expenseRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listByDateRange('2023-01-01', '2023-12-31');

      expect(expenseRepo.createQueryBuilder).toHaveBeenCalledWith('expense');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'expense.date >= :start',
        { start: '2023-01-01' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'expense.date <= :end',
        { end: '2023-12-31' },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'expense.date',
        'DESC',
      );
      expect(result).toEqual(expenses);
    });
  });

  describe('listUnsettled', () => {
    it('should return all unsettled splits when no filters provided', async () => {
      const splits = [mockExpenseSplit];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(splits),
      };

      splitRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listUnsettled();

      expect(splitRepo.createQueryBuilder).toHaveBeenCalledWith('split');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'split.isSettled = false',
      );
      expect(result).toEqual(splits);
    });

    it('should filter unsettled splits by groupId', async () => {
      const splits = [mockExpenseSplit];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(splits),
      };

      splitRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listUnsettled('group-1');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'split.groupId = :groupId',
        { groupId: 'group-1' },
      );
      expect(result).toEqual(splits);
    });

    it('should filter unsettled splits by userId', async () => {
      const splits = [mockExpenseSplit];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(splits),
      };

      splitRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listUnsettled(undefined, 'user-2');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'split.userId = :userId',
        { userId: 'user-2' },
      );
      expect(result).toEqual(splits);
    });
  });

  describe('groupBalances', () => {
    it('should return group balances', async () => {
      const balances = [
        { userId: 'user-1', totalOwed: '100.00' },
        { userId: 'user-2', totalOwed: '50.00' },
      ];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(balances),
      };

      splitRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.groupBalances('group-1');

      expect(splitRepo.createQueryBuilder).toHaveBeenCalledWith('split');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'split.userId',
        'userId',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'SUM(split.amount)',
        'totalOwed',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'split.groupId = :groupId',
        { groupId: 'group-1' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'split.isSettled = false',
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('split.userId');
      expect(result).toEqual(balances);
    });
  });

  describe('userBalances', () => {
    it('should return user balances', async () => {
      const balances = [
        { groupId: 'group-1', totalOwed: '100.00' },
        { groupId: 'group-2', totalOwed: '50.00' },
      ];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(balances),
      };

      splitRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.userBalances('user-1');

      expect(splitRepo.createQueryBuilder).toHaveBeenCalledWith('split');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        'split.groupId',
        'groupId',
      );
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        'SUM(split.amount)',
        'totalOwed',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'split.userId = :userId',
        { userId: 'user-1' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'split.isSettled = false',
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('split.groupId');
      expect(result).toEqual(balances);
    });
  });

  describe('remindUnsettled', () => {
    it('should send reminders for all unsettled splits', async () => {
      const unsettledSplits = [
        { ...mockExpenseSplit, userId: 'user-1', email: 'user1@example.com' },
        {
          ...mockExpenseSplit,
          id: 'split-2',
          userId: 'user-2',
          email: 'user2@example.com',
        },
      ];

      splitRepo.find.mockResolvedValue(unsettledSplits);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      const result = await service.remindUnsettled();

      expect(splitRepo.find).toHaveBeenCalledWith({
        where: { isSettled: false },
      });
      expect(notificationService.sendInApp).toHaveBeenCalledTimes(2);
      expect(notificationService.sendEmail).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        reminded: [
          'user-1',
          'user1@example.com',
          'user-2',
          'user2@example.com',
        ],
      });
    });

    it('should handle splits without userId or email', async () => {
      const unsettledSplits = [
        { ...mockExpenseSplit, userId: null, email: null },
      ];

      splitRepo.find.mockResolvedValue(unsettledSplits);
      notificationService.sendInApp.mockResolvedValue(undefined);
      notificationService.sendEmail.mockResolvedValue(undefined);

      const result = await service.remindUnsettled();

      expect(notificationService.sendInApp).not.toHaveBeenCalled();
      expect(notificationService.sendEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ reminded: [] });
    });
  });
});
