import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionService } from './transaction.service';
import { Transaction } from '../entities/transaction.entity';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: Repository<Transaction>;

  const mockTransaction = {
    id: 'transaction-1',
    type: 'expense' as const,
    amount: 100.5,
    date: new Date('2023-12-25'),
    description: 'Test transaction',
    counterparty: null,
    interestRate: null,
    assetType: null,
    groupId: null,
    status: 'active',
    userId: 'user-1',
    createdAt: new Date('2023-12-25T10:00:00Z'),
    updatedAt: new Date('2023-12-25T10:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a basic transaction successfully', async () => {
      const createDto = {
        type: 'expense' as const,
        amount: 100.5,
        date: new Date('2023-12-25'),
        description: 'Test transaction',
        userId: 'user-1',
      };

      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(mockTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(mockTransaction as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith(createDto);
      expect(transactionRepository.save).toHaveBeenCalledWith(mockTransaction);
    });

    it('should create a loan transaction with required fields', async () => {
      const createDto = {
        type: 'loan_given' as const,
        amount: 1000,
        date: new Date('2023-12-25'),
        counterparty: 'John Doe',
        interestRate: 5.5,
        userId: 'user-1',
      };

      const loanTransaction = { ...mockTransaction, ...createDto };
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(loanTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(loanTransaction as any);

      const result = await service.create(createDto);

      expect(result).toEqual(loanTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith(createDto);
      expect(transactionRepository.save).toHaveBeenCalledWith(loanTransaction);
    });

    it('should create a chit investment transaction', async () => {
      const createDto = {
        type: 'chit_investment' as const,
        amount: 500,
        date: new Date('2023-12-25'),
        groupId: 'group-1',
        userId: 'user-1',
      };

      const chitTransaction = { ...mockTransaction, ...createDto };
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(chitTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(chitTransaction as any);

      const result = await service.create(createDto);

      expect(result).toEqual(chitTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith(createDto);
      expect(transactionRepository.save).toHaveBeenCalledWith(chitTransaction);
    });

    it('should create an asset transaction', async () => {
      const createDto = {
        type: 'gold' as const,
        amount: 2000,
        date: new Date('2023-12-25'),
        assetType: 'gold',
        userId: 'user-1',
      };

      const assetTransaction = { ...mockTransaction, ...createDto };
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(assetTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(assetTransaction as any);

      const result = await service.create(createDto);

      expect(result).toEqual(assetTransaction);
      expect(transactionRepository.create).toHaveBeenCalledWith(createDto);
      expect(transactionRepository.save).toHaveBeenCalledWith(assetTransaction);
    });

    it('should set userId when provided as parameter', async () => {
      const createDto = {
        type: 'expense' as const,
        amount: 100,
        date: new Date('2023-12-25'),
      };

      const transactionWithUserId = {
        ...mockTransaction,
        ...createDto,
        userId: 'user-123',
      };
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(transactionWithUserId as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(transactionWithUserId as any);

      const result = await service.create(createDto, 'user-123');

      expect((result as any).userId).toBe('user-123');
      expect(transactionRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: 'user-123',
      });
    });

    describe('Validation Rules', () => {
      it('should throw error for negative amount', async () => {
        const createDto = {
          type: 'expense' as const,
          amount: -100,
          date: new Date('2023-12-25'),
          userId: 'user-1',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'Amount must be positive',
        );
      });

      it('should throw error for zero amount', async () => {
        const createDto = {
          type: 'expense' as const,
          amount: 0,
          date: new Date('2023-12-25'),
          userId: 'user-1',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'Amount must be positive',
        );
      });

      it('should throw error for null amount', async () => {
        const createDto = {
          type: 'expense' as const,
          amount: null,
          date: new Date('2023-12-25'),
          userId: 'user-1',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'Amount must be positive',
        );
      });

      it('should throw error for loan without counterparty', async () => {
        const createDto = {
          type: 'loan_given' as const,
          amount: 1000,
          date: new Date('2023-12-25'),
          userId: 'user-1',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'Counterparty is required for loans',
        );
      });

      it('should throw error for chit investment without groupId', async () => {
        const createDto = {
          type: 'chit_investment' as const,
          amount: 500,
          date: new Date('2023-12-25'),
          userId: 'user-1',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'groupId is required for chitti investments',
        );
      });

      it('should throw error for gold transaction without assetType', async () => {
        const createDto = {
          type: 'gold' as const,
          amount: 2000,
          date: new Date('2023-12-25'),
          userId: 'user-1',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'assetType is required for gold/asset loans',
        );
      });

      it('should throw error for asset loan without assetType', async () => {
        const createDto = {
          type: 'asset_loan' as const,
          amount: 5000,
          date: new Date('2023-12-25'),
          userId: 'user-1',
        };

        await expect(service.create(createDto)).rejects.toThrow(
          'assetType is required for gold/asset loans',
        );
      });
    });

    it('should handle database errors', async () => {
      const createDto = {
        type: 'expense' as const,
        amount: 100,
        date: new Date('2023-12-25'),
        userId: 'user-1',
      };

      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(mockTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return transaction by id', async () => {
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(mockTransaction as any);

      const result = await service.getById('transaction-1');

      expect(result).toEqual(mockTransaction);
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'transaction-1' },
      });
    });

    it('should return null when transaction not found', async () => {
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
    });
  });

  describe('list', () => {
    it('should list all transactions when no filters provided', async () => {
      const transactions = [mockTransaction];
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(transactions as any);

      const result = await service.list();

      expect(result).toEqual(transactions);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { date: 'DESC' },
      });
    });

    it('should list transactions filtered by type', async () => {
      const transactions = [mockTransaction];
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(transactions as any);

      const result = await service.list('expense');

      expect(result).toEqual(transactions);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { type: 'expense' },
        order: { date: 'DESC' },
      });
    });

    it('should list transactions filtered by groupId', async () => {
      const transactions = [mockTransaction];
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(transactions as any);

      const result = await service.list(undefined, 'group-1');

      expect(result).toEqual(transactions);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { groupId: 'group-1' },
        order: { date: 'DESC' },
      });
    });

    it('should list transactions filtered by both type and groupId', async () => {
      const transactions = [mockTransaction];
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(transactions as any);

      const result = await service.list('expense', 'group-1');

      expect(result).toEqual(transactions);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { type: 'expense', groupId: 'group-1' },
        order: { date: 'DESC' },
      });
    });
  });

  describe('update', () => {
    it('should update transaction successfully', async () => {
      const updateDto = {
        amount: 150.75,
        description: 'Updated transaction',
      };

      const updatedTransaction = { ...mockTransaction, ...updateDto };
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(mockTransaction as any);
      jest
        .spyOn(transactionRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(updatedTransaction as any);

      const result = await service.update('transaction-1', updateDto);

      expect(result).toEqual(updatedTransaction);
      expect(transactionRepository.update).toHaveBeenCalledWith(
        'transaction-1',
        updateDto,
      );
    });

    it('should handle permission check for different user', async () => {
      const updateDto = { amount: 200 };
      const existingTransaction = { ...mockTransaction, userId: 'user-2' };

      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(existingTransaction as any);

      await expect(
        service.update('transaction-1', updateDto, 'user-1'),
      ).rejects.toThrow(
        'You do not have permission to update this transaction',
      );
    });

    it('should allow update for same user', async () => {
      const updateDto = { amount: 200 };
      const updatedTransaction = { ...mockTransaction, amount: 200 };

      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(mockTransaction as any);
      jest
        .spyOn(transactionRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(updatedTransaction as any);

      const result = await service.update('transaction-1', updateDto, 'user-1');

      expect(result).toEqual(updatedTransaction);
      expect(transactionRepository.update).toHaveBeenCalledWith(
        'transaction-1',
        updateDto,
      );
    });

    it('should validate amount in updates', async () => {
      const updateDto = { amount: -100 };
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(mockTransaction as any);

      await expect(service.update('transaction-1', updateDto)).rejects.toThrow(
        'Amount must be positive',
      );
    });

    it('should validate loan requirements in updates', async () => {
      const updateDto = { type: 'loan_given' as const };
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValue(mockTransaction as any);

      await expect(service.update('transaction-1', updateDto)).rejects.toThrow(
        'Counterparty is required for loans',
      );
    });
  });

  describe('delete', () => {
    it('should delete transaction successfully', async () => {
      jest
        .spyOn(transactionRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.delete('transaction-1');

      expect(result).toEqual({ deleted: true });
      expect(transactionRepository.delete).toHaveBeenCalledWith(
        'transaction-1',
      );
    });

    it('should handle deletion errors', async () => {
      jest
        .spyOn(transactionRepository, 'delete')
        .mockRejectedValue(new Error('Delete failed'));

      await expect(service.delete('transaction-1')).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  describe('summary', () => {
    it('should return transaction summary for date range', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'income', total: '1000' },
          { type: 'expense', total: '500' },
        ]),
      };

      jest
        .spyOn(transactionRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.summary('2023-12-01', '2023-12-31');

      expect(result).toEqual({
        income: 1000,
        expense: 500,
        net: 500,
        breakdown: [
          { type: 'income', total: '1000' },
          { type: 'expense', total: '500' },
        ],
      });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith('t.date >= :start', {
        start: '2023-12-01',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('t.date <= :end', {
        end: '2023-12-31',
      });
    });

    it('should handle empty results', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(transactionRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.summary('2023-12-01', '2023-12-31');

      expect(result).toEqual({
        income: 0,
        expense: 0,
        net: 0,
        breakdown: [],
      });
    });
  });

  describe('loans', () => {
    it('should return loans filtered by type', async () => {
      const loans = [mockTransaction];
      jest.spyOn(transactionRepository, 'find').mockResolvedValue(loans as any);

      const result = await service.loans('loan_given');

      expect(result).toEqual(loans);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { type: 'loan_given' },
        order: { date: 'DESC' },
      });
    });

    it('should return loans filtered by type and status', async () => {
      const loans = [mockTransaction];
      jest.spyOn(transactionRepository, 'find').mockResolvedValue(loans as any);

      const result = await service.loans('loan_given', 'active');

      expect(result).toEqual(loans);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { type: 'loan_given', status: 'active' },
        order: { date: 'DESC' },
      });
    });

    it('should throw error for invalid transaction type', async () => {
      await expect(service.loans('invalid_type')).rejects.toThrow(
        'Invalid transaction type',
      );
    });
  });

  describe('chittiStatus', () => {
    it('should return chit investment status for group', async () => {
      const chitStatus = [mockTransaction];
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(chitStatus as any);

      const result = await service.chittiStatus('group-1');

      expect(result).toEqual(chitStatus);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { type: 'chit_investment', groupId: 'group-1' },
        order: { date: 'DESC' },
      });
    });
  });

  describe('assets', () => {
    it('should return assets filtered by type', async () => {
      const assets = [mockTransaction];
      jest
        .spyOn(transactionRepository, 'find')
        .mockResolvedValue(assets as any);

      const result = await service.assets('gold');

      expect(result).toEqual(assets);
      expect(transactionRepository.find).toHaveBeenCalledWith({
        where: { type: 'gold' },
        order: { date: 'DESC' },
      });
    });
  });

  describe('netCashFlow', () => {
    it('should return net cash flow for date range', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'income', total: '1000' },
          { type: 'expense', total: '500' },
        ]),
      };

      jest
        .spyOn(transactionRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.netCashFlow('2023-12-01', '2023-12-31');

      expect(result).toEqual({
        netCashFlow: 500,
        income: 1000,
        expense: 500,
      });
    });

    it('should handle negative cash flow', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'income', total: '500' },
          { type: 'expense', total: '1000' },
        ]),
      };

      jest
        .spyOn(transactionRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.netCashFlow('2023-12-01', '2023-12-31');

      expect(result).toEqual({
        netCashFlow: -500,
        income: 500,
        expense: 1000,
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle database connection errors', async () => {
      const createDto = {
        type: 'expense' as const,
        amount: 100,
        date: new Date('2023-12-25'),
        userId: 'user-1',
      };

      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(mockTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(service.create(createDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle large amounts', async () => {
      const createDto = {
        type: 'income' as const,
        amount: 999999999.99,
        date: new Date('2023-12-25'),
        userId: 'user-1',
      };

      const largeTransaction = { ...mockTransaction, ...createDto };
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(largeTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(largeTransaction as any);

      const result = await service.create(createDto);

      expect((result as any).amount).toBe(999999999.99);
    });

    it('should handle future dates', async () => {
      const futureDate = new Date('2025-12-25');
      const createDto = {
        type: 'expense' as const,
        amount: 100,
        date: futureDate,
        userId: 'user-1',
      };

      const futureTransaction = { ...mockTransaction, ...createDto };
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(futureTransaction as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(futureTransaction as any);

      const result = await service.create(createDto);

      expect((result as any).date).toEqual(futureDate);
    });

    it('should handle null values in optional fields', async () => {
      const createDto = {
        type: 'expense' as const,
        amount: 100,
        date: new Date('2023-12-25'),
        description: null,
        counterparty: null,
        interestRate: null,
        assetType: null,
        groupId: null,
        status: null,
        userId: 'user-1',
      };

      const transactionWithNulls = { ...mockTransaction, ...createDto };
      jest
        .spyOn(transactionRepository, 'create')
        .mockReturnValue(transactionWithNulls as any);
      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(transactionWithNulls as any);

      const result = await service.create(createDto);

      expect((result as any).description).toBeNull();
      expect((result as any).counterparty).toBeNull();
      expect((result as any).interestRate).toBeNull();
      expect((result as any).assetType).toBeNull();
      expect((result as any).groupId).toBeNull();
      expect((result as any).status).toBeNull();
    });
  });
});
