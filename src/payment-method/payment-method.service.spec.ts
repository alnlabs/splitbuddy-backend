import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethodService } from './payment-method.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Payment } from '../entities/payment.entity';
import { NotificationService } from '../notification/notification.service';

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<PaymentMethodService>(PaymentMethodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
