import { Test, TestingModule } from '@nestjs/testing';
import { PlansService } from './plans.service';
import { ChitFundService } from '../chit-fund/chit-fund.service';
import { TransactionService } from '../transaction/transaction.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PlansService', () => {
  let service: PlansService;
  let chitFundService: ChitFundService;
  let transactionService: TransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlansService,
        {
          provide: ChitFundService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            list: jest.fn(),
            create: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PlansService>(PlansService);
    chitFundService = module.get<ChitFundService>(ChitFundService);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPlansForUser', () => {
    it('should return all plans for a user', async () => {
      const userId = 'test-user-id';
      const mockChits = [
        { id: '1', name: 'Chit 1', members: [userId] } as any,
        { id: '2', name: 'Chit 2', members: [userId, 'other-user'] } as any,
      ];
      const mockTransactions = [
        { id: '3', userId, type: 'savings' } as any,
        { id: '4', userId, type: 'investment' } as any,
        { id: '5', userId: 'other-user', type: 'savings' } as any,
      ];

      jest.spyOn(chitFundService, 'findAll').mockResolvedValue(mockChits);
      jest
        .spyOn(transactionService, 'list')
        .mockResolvedValue(mockTransactions);

      const result = await service.getAllPlansForUser(userId);

      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ ...mockChits[0], type: 'chit' });
      expect(result[1]).toEqual({ ...mockChits[1], type: 'chit' });
      expect(result[2]).toEqual({ ...mockTransactions[0], type: 'savings' });
      expect(result[3]).toEqual({ ...mockTransactions[1], type: 'investment' });
    });
  });

  describe('createPlan', () => {
    it('should create a chit fund plan', async () => {
      const userId = 'test-user-id';
      const planData = { type: 'chit', name: 'Test Chit', members: [userId] };
      const mockCreatedChit = { id: '1', ...planData } as any;

      jest.spyOn(chitFundService, 'create').mockResolvedValue(mockCreatedChit);

      const result = await service.createPlan(planData, userId);

      expect(chitFundService.create).toHaveBeenCalledWith({
        ...planData,
        members: [userId],
      });
      expect(result).toEqual(mockCreatedChit);
    });

    it('should create a transaction plan', async () => {
      const userId = 'test-user-id';
      const planData = { type: 'savings', name: 'Test Savings' };
      const mockCreatedTransaction = { id: '1', ...planData } as any;

      jest
        .spyOn(transactionService, 'create')
        .mockResolvedValue(mockCreatedTransaction);

      const result = await service.createPlan(planData, userId);

      expect(transactionService.create).toHaveBeenCalledWith(planData, userId);
      expect(result).toEqual(mockCreatedTransaction);
    });

    it('should throw BadRequestException when type is missing', async () => {
      const userId = 'test-user-id';
      const planData = { name: 'Test Plan' };

      await expect(service.createPlan(planData, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPlanById', () => {
    it('should return a chit fund plan', async () => {
      const planId = '1';
      const mockChit = { id: planId, name: 'Test Chit' } as any;

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(mockChit);

      const result = await service.getPlanById(planId);

      expect(result).toEqual({ ...mockChit, type: 'chit' });
    });

    it('should return a transaction plan', async () => {
      const planId = '1';
      const mockTransaction = {
        id: planId,
        name: 'Test Savings',
        type: 'savings',
      } as any;

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(transactionService, 'getById')
        .mockResolvedValue(mockTransaction);

      const result = await service.getPlanById(planId);

      expect(result).toEqual({ ...mockTransaction, type: 'savings' });
    });

    it('should throw NotFoundException when plan is not found', async () => {
      const planId = '1';

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(null);
      jest.spyOn(transactionService, 'getById').mockResolvedValue(null);

      await expect(service.getPlanById(planId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when transaction is expense type', async () => {
      const planId = '1';
      const mockTransaction = {
        id: planId,
        name: 'Test Expense',
        type: 'expense',
      } as any;

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(transactionService, 'getById')
        .mockResolvedValue(mockTransaction);

      await expect(service.getPlanById(planId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePlan', () => {
    it('should update a chit fund plan', async () => {
      const planId = '1';
      const userId = 'test-user-id';
      const updateData = { name: 'Updated Chit' };
      const mockChit = { id: planId, name: 'Test Chit' } as any;
      const mockUpdatedChit = { id: planId, ...updateData } as any;

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(mockChit);
      jest.spyOn(chitFundService, 'update').mockResolvedValue({} as any);
      jest
        .spyOn(chitFundService, 'findOne')
        .mockResolvedValueOnce(mockChit)
        .mockResolvedValueOnce(mockUpdatedChit);

      const result = await service.updatePlan(planId, updateData, userId);

      expect(chitFundService.update).toHaveBeenCalledWith(planId, updateData);
      expect(result).toEqual(mockUpdatedChit);
    });

    it('should update a transaction plan', async () => {
      const planId = '1';
      const userId = 'test-user-id';
      const updateData = { name: 'Updated Savings' };
      const mockTransaction = {
        id: planId,
        name: 'Test Savings',
        type: 'savings',
      } as any;
      const mockUpdatedTransaction = {
        id: planId,
        ...updateData,
        type: 'savings',
      } as any;

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(transactionService, 'getById')
        .mockResolvedValue(mockTransaction);
      jest.spyOn(transactionService, 'update').mockResolvedValue({} as any);
      jest
        .spyOn(transactionService, 'getById')
        .mockResolvedValueOnce(mockTransaction)
        .mockResolvedValueOnce(mockUpdatedTransaction);

      const result = await service.updatePlan(planId, updateData, userId);

      expect(transactionService.update).toHaveBeenCalledWith(
        planId,
        updateData,
        userId,
      );
      expect(result).toEqual(mockUpdatedTransaction);
    });

    it('should throw NotFoundException when plan is not found', async () => {
      const planId = '1';
      const userId = 'test-user-id';
      const updateData = { name: 'Updated Plan' };

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(null);
      jest.spyOn(transactionService, 'getById').mockResolvedValue(null);

      await expect(
        service.updatePlan(planId, updateData, userId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePlan', () => {
    it('should delete a chit fund plan', async () => {
      const planId = '1';
      const mockChit = { id: planId, name: 'Test Chit' } as any;

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(mockChit);
      jest.spyOn(chitFundService, 'remove').mockResolvedValue({} as any);

      await service.deletePlan(planId);

      expect(chitFundService.remove).toHaveBeenCalledWith(planId);
    });

    it('should delete a transaction plan', async () => {
      const planId = '1';
      const mockTransaction = {
        id: planId,
        name: 'Test Savings',
        type: 'savings',
      } as any;

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(transactionService, 'getById')
        .mockResolvedValue(mockTransaction);
      jest.spyOn(transactionService, 'delete').mockResolvedValue({} as any);

      await service.deletePlan(planId);

      expect(transactionService.delete).toHaveBeenCalledWith(planId);
    });

    it('should throw NotFoundException when plan is not found', async () => {
      const planId = '1';

      jest.spyOn(chitFundService, 'findOne').mockResolvedValue(null);
      jest.spyOn(transactionService, 'getById').mockResolvedValue(null);

      await expect(service.deletePlan(planId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
