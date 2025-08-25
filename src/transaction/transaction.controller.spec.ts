import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from '../entities/transaction.entity';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: TransactionService;

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

  const mockTransactionService = {
    create: jest.fn(),
    getById: jest.fn(),
    list: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    summary: jest.fn(),
    loans: jest.fn(),
    chittiStatus: jest.fn(),
    assets: jest.fn(),
    netCashFlow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get<TransactionService>(TransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      const createDto = {
        type: 'expense' as const,
        amount: 100.5,
        date: new Date('2023-12-25'),
        description: 'Test transaction',
        userId: 'user-1',
      };

      mockTransactionService.create.mockResolvedValue(mockTransaction);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTransaction);
      expect(service.create).toHaveBeenCalledWith(createDto);
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
      mockTransactionService.create.mockResolvedValue(loanTransaction);

      const result = await controller.create(createDto);

      expect(result).toEqual(loanTransaction);
      expect(service.create).toHaveBeenCalledWith(createDto);
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
      mockTransactionService.create.mockResolvedValue(chitTransaction);

      const result = await controller.create(createDto);

      expect(result).toEqual(chitTransaction);
      expect(service.create).toHaveBeenCalledWith(createDto);
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
      mockTransactionService.create.mockResolvedValue(assetTransaction);

      const result = await controller.create(createDto);

      expect(result).toEqual(assetTransaction);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle service errors', async () => {
      const createDto = {
        type: 'expense' as const,
        amount: -100, // Invalid amount
        date: new Date('2023-12-25'),
        userId: 'user-1',
      };

      const error = new Error('Amount must be positive');
      mockTransactionService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        'Amount must be positive',
      );
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('list', () => {
    it('should list all transactions when no filters provided', async () => {
      const transactions = [mockTransaction];
      mockTransactionService.list.mockResolvedValue(transactions);

      const result = await controller.list();

      expect(result).toEqual(transactions);
      expect(service.list).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should list transactions filtered by type', async () => {
      const transactions = [mockTransaction];
      mockTransactionService.list.mockResolvedValue(transactions);

      const result = await controller.list('expense');

      expect(result).toEqual(transactions);
      expect(service.list).toHaveBeenCalledWith('expense', undefined);
    });

    it('should list transactions filtered by groupId', async () => {
      const transactions = [mockTransaction];
      mockTransactionService.list.mockResolvedValue(transactions);

      const result = await controller.list(undefined, 'group-1');

      expect(result).toEqual(transactions);
      expect(service.list).toHaveBeenCalledWith(undefined, 'group-1');
    });

    it('should list transactions filtered by both type and groupId', async () => {
      const transactions = [mockTransaction];
      mockTransactionService.list.mockResolvedValue(transactions);

      const result = await controller.list('expense', 'group-1');

      expect(result).toEqual(transactions);
      expect(service.list).toHaveBeenCalledWith('expense', 'group-1');
    });
  });

  describe('summary', () => {
    it('should return transaction summary for date range', async () => {
      const summary = {
        income: 1000,
        expense: 500,
        net: 500,
        breakdown: [
          { type: 'income', total: '1000' },
          { type: 'expense', total: '500' },
        ],
      };

      mockTransactionService.summary.mockResolvedValue(summary);

      const result = await controller.summary('2023-12-01', '2023-12-31');

      expect(result).toEqual(summary);
      expect(service.summary).toHaveBeenCalledWith('2023-12-01', '2023-12-31');
    });
  });

  describe('loans', () => {
    it('should return loans filtered by type', async () => {
      const loans = [mockTransaction];
      mockTransactionService.loans.mockResolvedValue(loans);

      const result = await controller.loans('loan_given');

      expect(result).toEqual(loans);
      expect(service.loans).toHaveBeenCalledWith('loan_given', undefined);
    });

    it('should return loans filtered by type and status', async () => {
      const loans = [mockTransaction];
      mockTransactionService.loans.mockResolvedValue(loans);

      const result = await controller.loans('loan_given', 'active');

      expect(result).toEqual(loans);
      expect(service.loans).toHaveBeenCalledWith('loan_given', 'active');
    });

    it('should handle invalid loan type', async () => {
      const error = new Error('Invalid transaction type');
      mockTransactionService.loans.mockRejectedValue(error);

      await expect(controller.loans('invalid_type')).rejects.toThrow(
        'Invalid transaction type',
      );
      expect(service.loans).toHaveBeenCalledWith('invalid_type', undefined);
    });
  });

  describe('chittiStatus', () => {
    it('should return chit investment status for group', async () => {
      const chitStatus = [mockTransaction];
      mockTransactionService.chittiStatus.mockResolvedValue(chitStatus);

      const result = await controller.chittiStatus('group-1');

      expect(result).toEqual(chitStatus);
      expect(service.chittiStatus).toHaveBeenCalledWith('group-1');
    });
  });

  describe('assets', () => {
    it('should return assets filtered by type', async () => {
      const assets = [mockTransaction];
      mockTransactionService.assets.mockResolvedValue(assets);

      const result = await controller.assets('gold');

      expect(result).toEqual(assets);
      expect(service.assets).toHaveBeenCalledWith('gold');
    });
  });

  describe('netCashFlow', () => {
    it('should return net cash flow for date range', async () => {
      const cashFlow = {
        netCashFlow: 500,
        income: 1000,
        expense: 500,
      };

      mockTransactionService.netCashFlow.mockResolvedValue(cashFlow);

      const result = await controller.netCashFlow('2023-12-01', '2023-12-31');

      expect(result).toEqual(cashFlow);
      expect(service.netCashFlow).toHaveBeenCalledWith(
        '2023-12-01',
        '2023-12-31',
      );
    });
  });

  describe('getById', () => {
    it('should return transaction by id', async () => {
      mockTransactionService.getById.mockResolvedValue(mockTransaction);

      const result = await controller.getById('transaction-1');

      expect(result).toEqual(mockTransaction);
      expect(service.getById).toHaveBeenCalledWith('transaction-1');
    });

    it('should return null when transaction not found', async () => {
      mockTransactionService.getById.mockResolvedValue(null);

      const result = await controller.getById('non-existent');

      expect(result).toBeNull();
      expect(service.getById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('update', () => {
    it('should update transaction successfully', async () => {
      const updateDto = {
        amount: 150.75,
        description: 'Updated transaction',
      };

      const updatedTransaction = { ...mockTransaction, ...updateDto };
      mockTransactionService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update('transaction-1', updateDto);

      expect(result).toEqual(updatedTransaction);
      expect(service.update).toHaveBeenCalledWith('transaction-1', updateDto);
    });

    it('should handle partial updates', async () => {
      const updateDto = {
        amount: 200,
      };

      const updatedTransaction = { ...mockTransaction, amount: 200 };
      mockTransactionService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update('transaction-1', updateDto);

      expect(result!.amount).toBe(200);
      expect(result!.description).toBe(mockTransaction.description); // Should remain unchanged
      expect(service.update).toHaveBeenCalledWith('transaction-1', updateDto);
    });

    it('should handle permission errors', async () => {
      const updateDto = { amount: 200 };
      const error = new Error(
        'You do not have permission to update this transaction',
      );
      mockTransactionService.update.mockRejectedValue(error);

      await expect(
        controller.update('transaction-1', updateDto),
      ).rejects.toThrow(
        'You do not have permission to update this transaction',
      );
      expect(service.update).toHaveBeenCalledWith('transaction-1', updateDto);
    });

    it('should handle validation errors', async () => {
      const updateDto = { amount: -100 }; // Invalid amount
      const error = new Error('Amount must be positive');
      mockTransactionService.update.mockRejectedValue(error);

      await expect(
        controller.update('transaction-1', updateDto),
      ).rejects.toThrow('Amount must be positive');
      expect(service.update).toHaveBeenCalledWith('transaction-1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete transaction successfully', async () => {
      const deleteResult = { deleted: true };
      mockTransactionService.delete.mockResolvedValue(deleteResult);

      const result = await controller.delete('transaction-1');

      expect(result).toEqual(deleteResult);
      expect(service.delete).toHaveBeenCalledWith('transaction-1');
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Transaction not found');
      mockTransactionService.delete.mockRejectedValue(error);

      await expect(controller.delete('non-existent')).rejects.toThrow(
        'Transaction not found',
      );
      expect(service.delete).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty query parameters', async () => {
      const transactions: any[] = [];
      mockTransactionService.list.mockResolvedValue(transactions);

      const result = await controller.list('', '');

      expect(result).toEqual(transactions);
      expect(service.list).toHaveBeenCalledWith('', '');
    });

    it('should handle null query parameters', async () => {
      const transactions: any[] = [];
      mockTransactionService.list.mockResolvedValue(transactions);

      const result = await controller.list(undefined, undefined);

      expect(result).toEqual(transactions);
      expect(service.list).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should handle database connection errors', async () => {
      const error = new Error('Database connection failed');
      mockTransactionService.create.mockRejectedValue(error);

      const createDto = {
        type: 'expense' as const,
        amount: 100,
        date: new Date('2023-12-25'),
        userId: 'user-1',
      };

      await expect(controller.create(createDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle large transaction amounts', async () => {
      const createDto = {
        type: 'income' as const,
        amount: 999999999.99,
        date: new Date('2023-12-25'),
        userId: 'user-1',
      };

      const largeTransaction = { ...mockTransaction, ...createDto };
      mockTransactionService.create.mockResolvedValue(largeTransaction);

      const result = await controller.create(createDto);

      expect((result as any).amount).toBe(999999999.99);
      expect(service.create).toHaveBeenCalledWith(createDto);
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
      mockTransactionService.create.mockResolvedValue(futureTransaction);

      const result = await controller.create(createDto);

      expect((result as any).date).toEqual(futureDate);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });
});
