import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DefaultDataService } from './default-data.service';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Category } from '../entities/category.entity';

describe('DefaultDataService', () => {
  let service: DefaultDataService;
  let paymentMethodRepo: Repository<PaymentMethod>;
  let categoryRepo: Repository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefaultDataService,
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DefaultDataService>(DefaultDataService);
    paymentMethodRepo = module.get<Repository<PaymentMethod>>(
      getRepositoryToken(PaymentMethod),
    );
    categoryRepo = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDefaultPaymentMethods', () => {
    it('should create default payment methods for user', async () => {
      const userId = 'test-user-id';
      const mockPaymentMethods = [
        {
          id: '1',
          name: 'Cash',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PaymentMethod,
        {
          id: '2',
          name: 'Credit Card',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PaymentMethod,
      ];

      jest
        .spyOn(paymentMethodRepo, 'create')
        .mockReturnValue(mockPaymentMethods[0]);
      jest
        .spyOn(paymentMethodRepo, 'save')
        .mockResolvedValue(mockPaymentMethods[0]);

      const result = await service.createDefaultPaymentMethods(userId);

      expect(paymentMethodRepo.create).toHaveBeenCalledTimes(10); // 10 default payment methods
      expect(paymentMethodRepo.save).toHaveBeenCalledTimes(10);
      expect(result).toHaveLength(10);
    });

    it('should handle existing payment methods gracefully', async () => {
      const userId = 'test-user-id';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      jest
        .spyOn(paymentMethodRepo, 'create')
        .mockReturnValue({} as PaymentMethod);
      jest
        .spyOn(paymentMethodRepo, 'save')
        .mockRejectedValueOnce(new Error('Duplicate entry'));

      const result = await service.createDefaultPaymentMethods(userId);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Payment method Cash already exists for user test-user-id',
        ),
      );
      expect(result).toHaveLength(9); // 9 successful, 1 failed

      consoleSpy.mockRestore();
    });
  });

  describe('createDefaultCategories', () => {
    it('should create default categories for user', async () => {
      const userId = 'test-user-id';
      const mockCategories = [
        {
          id: '1',
          name: 'Food & Dining',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Category,
        {
          id: '2',
          name: 'Transportation',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Category,
      ];

      jest.spyOn(categoryRepo, 'create').mockReturnValue(mockCategories[0]);
      jest.spyOn(categoryRepo, 'save').mockResolvedValue(mockCategories[0]);

      const result = await service.createDefaultCategories(userId);

      expect(categoryRepo.create).toHaveBeenCalledTimes(17); // 17 default categories
      expect(categoryRepo.save).toHaveBeenCalledTimes(17);
      expect(result).toHaveLength(17);
    });

    it('should handle existing categories gracefully', async () => {
      const userId = 'test-user-id';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      jest.spyOn(categoryRepo, 'create').mockReturnValue({} as Category);
      jest
        .spyOn(categoryRepo, 'save')
        .mockRejectedValueOnce(new Error('Duplicate entry'));

      const result = await service.createDefaultCategories(userId);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Category Food & Dining already exists for user test-user-id',
        ),
      );
      expect(result).toHaveLength(16); // 16 successful, 1 failed

      consoleSpy.mockRestore();
    });
  });

  describe('createDefaultDataForUser', () => {
    it('should create both payment methods and categories', async () => {
      const userId = 'test-user-id';
      const mockPaymentMethods = [
        {
          id: '1',
          name: 'Cash',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PaymentMethod,
      ];
      const mockCategories = [
        {
          id: '1',
          name: 'Food & Dining',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Category,
      ];

      jest
        .spyOn(service, 'createDefaultPaymentMethods')
        .mockResolvedValue(mockPaymentMethods);
      jest
        .spyOn(service, 'createDefaultCategories')
        .mockResolvedValue(mockCategories);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await service.createDefaultDataForUser(userId);

      expect(service.createDefaultPaymentMethods).toHaveBeenCalledWith(userId);
      expect(service.createDefaultCategories).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        paymentMethods: mockPaymentMethods,
        categories: mockCategories,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Created 1 default payment methods for user test-user-id',
        ),
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Created 1 default categories for user test-user-id',
        ),
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors and rethrow them', async () => {
      const userId = 'test-user-id';
      const error = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      jest
        .spyOn(service, 'createDefaultPaymentMethods')
        .mockRejectedValue(error);

      await expect(service.createDefaultDataForUser(userId)).rejects.toThrow(
        'Database error',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating default data for user:',
        error,
      );

      consoleSpy.mockRestore();
    });
  });

  describe('checkDefaultDataStatus', () => {
    it('should return status when user has default data', async () => {
      const userId = 'test-user-id';
      const mockPaymentMethods = [
        {
          id: '1',
          name: 'Cash',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PaymentMethod,
        {
          id: '2',
          name: 'Credit Card',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as PaymentMethod,
      ];
      const mockCategories = [
        {
          id: '1',
          name: 'Food & Dining',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Category,
        {
          id: '2',
          name: 'Transportation',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Category,
      ];

      jest
        .spyOn(paymentMethodRepo, 'find')
        .mockResolvedValue(mockPaymentMethods);
      jest.spyOn(categoryRepo, 'find').mockResolvedValue(mockCategories);

      const result = await service.checkDefaultDataStatus(userId);

      expect(paymentMethodRepo.find).toHaveBeenCalledWith({
        where: { authorId: userId },
      });
      expect(categoryRepo.find).toHaveBeenCalledWith({
        where: { authorId: userId },
      });
      expect(result).toEqual({
        hasDefaultData: true,
        paymentMethodsCount: 2,
        categoriesCount: 2,
        paymentMethods: mockPaymentMethods,
        categories: mockCategories,
      });
    });

    it('should return status when user has no default data', async () => {
      const userId = 'test-user-id';

      jest.spyOn(paymentMethodRepo, 'find').mockResolvedValue([]);
      jest.spyOn(categoryRepo, 'find').mockResolvedValue([]);

      const result = await service.checkDefaultDataStatus(userId);

      expect(result).toEqual({
        hasDefaultData: false,
        paymentMethodsCount: 0,
        categoriesCount: 0,
        paymentMethods: [],
        categories: [],
      });
    });

    it('should handle errors and rethrow them', async () => {
      const userId = 'test-user-id';
      const error = new Error('Database error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      jest.spyOn(paymentMethodRepo, 'find').mockRejectedValue(error);

      await expect(service.checkDefaultDataStatus(userId)).rejects.toThrow(
        'Database error',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error checking default data status for user:',
        error,
      );

      consoleSpy.mockRestore();
    });
  });
});
