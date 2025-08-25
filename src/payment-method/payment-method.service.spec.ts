import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodService } from './payment-method.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Payment } from '../entities/payment.entity';
import { NotificationService } from '../notification/notification.service';
import { Repository } from 'typeorm';

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;
  let paymentMethodRepo: Repository<PaymentMethod>;
  let paymentRepo: Repository<Payment>;
  let notificationService: NotificationService;

  const mockPaymentMethodRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPaymentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockNotificationService = {
    sendEmail: jest.fn(),
    sendInApp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentMethodService,
        {
          provide: getRepositoryToken(PaymentMethod),
          useValue: mockPaymentMethodRepo,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepo,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<PaymentMethodService>(PaymentMethodService);
    paymentMethodRepo = module.get<Repository<PaymentMethod>>(
      getRepositoryToken(PaymentMethod),
    );
    paymentRepo = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    notificationService = module.get<NotificationService>(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a payment method successfully', async () => {
      const createDto = {
        name: 'Credit Card',
        authorId: 'user-123',
      };

      const mockPaymentMethod = {
        id: 'pm-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentMethodRepo.create.mockReturnValue(mockPaymentMethod);
      mockPaymentMethodRepo.save.mockResolvedValue(mockPaymentMethod);

      const result = await service.create(createDto);

      expect(mockPaymentMethodRepo.create).toHaveBeenCalledWith(createDto);
      expect(mockPaymentMethodRepo.save).toHaveBeenCalledWith(
        mockPaymentMethod,
      );
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should handle errors during payment method creation', async () => {
      const createDto = {
        name: 'Credit Card',
        authorId: 'user-123',
      };

      const error = new Error('Database error');
      mockPaymentMethodRepo.create.mockReturnValue({});
      mockPaymentMethodRepo.save.mockRejectedValue(error);

      await expect(service.create(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return a payment method by id', async () => {
      const paymentMethodId = 'pm-123';
      const mockPaymentMethod = {
        id: paymentMethodId,
        name: 'Credit Card',
        authorId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentMethodRepo.findOne.mockResolvedValue(mockPaymentMethod);

      const result = await service.getById(paymentMethodId);

      expect(mockPaymentMethodRepo.findOne).toHaveBeenCalledWith({
        where: { id: paymentMethodId },
      });
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should return null when payment method not found', async () => {
      const paymentMethodId = 'non-existent-id';

      mockPaymentMethodRepo.findOne.mockResolvedValue(null);

      const result = await service.getById(paymentMethodId);

      expect(mockPaymentMethodRepo.findOne).toHaveBeenCalledWith({
        where: { id: paymentMethodId },
      });
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('should return user-specific payment methods when userId is provided', async () => {
      const userId = 'user-123';
      const mockPaymentMethods = [
        {
          id: 'pm-1',
          name: 'Credit Card',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pm-2',
          name: 'Debit Card',
          authorId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPaymentMethodRepo.find.mockResolvedValue(mockPaymentMethods);

      const result = await service.list(userId);

      expect(mockPaymentMethodRepo.find).toHaveBeenCalledWith({
        where: { authorId: userId },
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockPaymentMethods);
    });

    it('should return all payment methods when no userId is provided', async () => {
      const mockPaymentMethods = [
        {
          id: 'pm-1',
          name: 'Credit Card',
          authorId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'pm-2',
          name: 'Debit Card',
          authorId: 'user-456',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPaymentMethodRepo.find.mockResolvedValue(mockPaymentMethods);

      const result = await service.list();

      expect(mockPaymentMethodRepo.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
      expect(result).toEqual(mockPaymentMethods);
    });

    it('should handle empty results', async () => {
      mockPaymentMethodRepo.find.mockResolvedValue([]);

      const result = await service.list('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a payment method successfully', async () => {
      const paymentMethodId = 'pm-123';
      const updateDto = {
        name: 'Updated Credit Card',
      };

      const updatedPaymentMethod = {
        id: paymentMethodId,
        name: 'Updated Credit Card',
        authorId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentMethodRepo.update.mockResolvedValue({ affected: 1 });
      mockPaymentMethodRepo.findOne.mockResolvedValue(updatedPaymentMethod);

      const result = await service.update(paymentMethodId, updateDto);

      expect(mockPaymentMethodRepo.update).toHaveBeenCalledWith(
        paymentMethodId,
        updateDto,
      );
      expect(mockPaymentMethodRepo.findOne).toHaveBeenCalledWith({
        where: { id: paymentMethodId },
      });
      expect(result).toEqual(updatedPaymentMethod);
    });

    it('should handle update when payment method not found', async () => {
      const paymentMethodId = 'non-existent-id';
      const updateDto = { name: 'Updated Name' };

      mockPaymentMethodRepo.update.mockResolvedValue({ affected: 0 });
      mockPaymentMethodRepo.findOne.mockResolvedValue(null);

      const result = await service.update(paymentMethodId, updateDto);

      expect(mockPaymentMethodRepo.update).toHaveBeenCalledWith(
        paymentMethodId,
        updateDto,
      );
      expect(result).toBeNull();
    });

    it('should handle errors during update', async () => {
      const paymentMethodId = 'pm-123';
      const updateDto = { name: 'Updated Name' };

      const error = new Error('Update failed');
      mockPaymentMethodRepo.update.mockRejectedValue(error);

      await expect(service.update(paymentMethodId, updateDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('delete', () => {
    it('should delete a payment method successfully', async () => {
      const paymentMethodId = 'pm-123';

      mockPaymentMethodRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(paymentMethodId);

      expect(mockPaymentMethodRepo.delete).toHaveBeenCalledWith(
        paymentMethodId,
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should handle deletion when payment method not found', async () => {
      const paymentMethodId = 'non-existent-id';

      mockPaymentMethodRepo.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete(paymentMethodId);

      expect(mockPaymentMethodRepo.delete).toHaveBeenCalledWith(
        paymentMethodId,
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should handle errors during deletion', async () => {
      const paymentMethodId = 'pm-123';

      const error = new Error('Delete failed');
      mockPaymentMethodRepo.delete.mockRejectedValue(error);

      await expect(service.delete(paymentMethodId)).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  describe('recordPayment', () => {
    it('should record a payment successfully and send notifications', async () => {
      const paymentDto = {
        payerId: 'payer-123',
        payeeId: 'payee-456',
        amount: 100.5,
        groupId: 'group-789',
        paymentMethod: 'Credit Card',
        authorId: 'author-123',
      };

      const mockPayment = {
        id: 'payment-123',
        ...paymentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentRepo.create.mockReturnValue(mockPayment);
      mockPaymentRepo.save.mockResolvedValue(mockPayment);
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await service.recordPayment(paymentDto);

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(paymentDto);
      expect(mockPaymentRepo.save).toHaveBeenCalledWith(mockPayment);
      expect(mockNotificationService.sendInApp).toHaveBeenCalledWith(
        'payer-123',
        'A payment of 100.5 was recorded for group group-789.',
      );
      expect(mockNotificationService.sendInApp).toHaveBeenCalledWith(
        'payee-456',
        'A payment of 100.5 was recorded for group group-789.',
      );
      expect(result).toEqual(mockPayment);
    });

    it('should record payment without notifications when payerId is missing', async () => {
      const paymentDto = {
        payeeId: 'payee-456',
        amount: 100.5,
        groupId: 'group-789',
        paymentMethod: 'Credit Card',
        authorId: 'author-123',
      };

      const mockPayment = {
        id: 'payment-123',
        ...paymentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentRepo.create.mockReturnValue(mockPayment);
      mockPaymentRepo.save.mockResolvedValue(mockPayment);
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await service.recordPayment(paymentDto);

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(paymentDto);
      expect(mockPaymentRepo.save).toHaveBeenCalledWith(mockPayment);
      expect(mockNotificationService.sendInApp).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendInApp).toHaveBeenCalledWith(
        'payee-456',
        'A payment of 100.5 was recorded for group group-789.',
      );
      expect(result).toEqual(mockPayment);
    });

    it('should record payment without notifications when payeeId is missing', async () => {
      const paymentDto = {
        payerId: 'payer-123',
        amount: 100.5,
        groupId: 'group-789',
        paymentMethod: 'Credit Card',
        authorId: 'author-123',
      };

      const mockPayment = {
        id: 'payment-123',
        ...paymentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentRepo.create.mockReturnValue(mockPayment);
      mockPaymentRepo.save.mockResolvedValue(mockPayment);
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await service.recordPayment(paymentDto);

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(paymentDto);
      expect(mockPaymentRepo.save).toHaveBeenCalledWith(mockPayment);
      expect(mockNotificationService.sendInApp).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.sendInApp).toHaveBeenCalledWith(
        'payer-123',
        'A payment of 100.5 was recorded for group group-789.',
      );
      expect(result).toEqual(mockPayment);
    });

    it('should handle errors during payment recording', async () => {
      const paymentDto = {
        payerId: 'payer-123',
        payeeId: 'payee-456',
        amount: 100.5,
        groupId: 'group-789',
        authorId: 'author-123',
      };

      const error = new Error('Payment recording failed');
      mockPaymentRepo.create.mockReturnValue({});
      mockPaymentRepo.save.mockRejectedValue(error);

      await expect(service.recordPayment(paymentDto)).rejects.toThrow(
        'Payment recording failed',
      );
    });

    it('should record payment without any notifications when both payerId and payeeId are missing', async () => {
      const paymentDto = {
        amount: 100.5,
        groupId: 'group-789',
        paymentMethod: 'Credit Card',
        authorId: 'author-123',
      };

      const mockPayment = {
        id: 'payment-123',
        ...paymentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentRepo.create.mockReturnValue(mockPayment);
      mockPaymentRepo.save.mockResolvedValue(mockPayment);
      mockNotificationService.sendInApp.mockResolvedValue(undefined);

      const result = await service.recordPayment(paymentDto);

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(paymentDto);
      expect(mockPaymentRepo.save).toHaveBeenCalledWith(mockPayment);
      expect(mockNotificationService.sendInApp).not.toHaveBeenCalled();
      expect(result).toEqual(mockPayment);
    });

    it('should handle notification service errors gracefully', async () => {
      const paymentDto = {
        payerId: 'payer-123',
        payeeId: 'payee-456',
        amount: 100.5,
        groupId: 'group-789',
        authorId: 'author-123',
      };

      const mockPayment = {
        id: 'payment-123',
        ...paymentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPaymentRepo.create.mockReturnValue(mockPayment);
      mockPaymentRepo.save.mockResolvedValue(mockPayment);
      mockNotificationService.sendInApp.mockRejectedValue(
        new Error('Notification failed'),
      );

      const result = await service.recordPayment(paymentDto);

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(paymentDto);
      expect(mockPaymentRepo.save).toHaveBeenCalledWith(mockPayment);
      expect(mockNotificationService.sendInApp).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockPayment);
    });
  });
});
