import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Payment } from '../entities/payment.entity';
import { NotificationService } from '../notification/notification.service';

describe('PaymentMethodController', () => {
  let controller: PaymentMethodController;
  let service: PaymentMethodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodController],
      providers: [
        PaymentMethodService,
        {
          provide: getRepositoryToken(PaymentMethod),
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
          provide: getRepositoryToken(Payment),
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
          provide: NotificationService,
          useValue: {
            sendEmail: jest.fn(),
            sendInApp: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentMethodController>(PaymentMethodController);
    service = module.get<PaymentMethodService>(PaymentMethodService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have service defined', () => {
    expect(service).toBeDefined();
  });
});
