import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoanService } from './loan.service';
import { Loan } from '../entities/loan.entity';
import { LoanPayment } from '../entities/loan-payment.entity';
import { User } from '../entities/user.entity';
import { ExternalUser } from '../entities/external-user.entity';
import { NotificationService } from '../notification/notification.service';
import { ExternalUserService } from '../external-user/external-user.service';
import {
  CreateLoanDto,
  UpdateLoanDto,
  CreateLoanPaymentDto,
  LoanQueryDto,
} from './loan.dto';

describe('LoanService', () => {
  let service: LoanService;
  let loanRepository: Repository<Loan>;
  let loanPaymentRepository: Repository<LoanPayment>;
  let userRepository: Repository<User>;
  let externalUserRepository: Repository<ExternalUser>;
  let notificationService: NotificationService;
  let externalUserService: ExternalUserService;

  const mockLoan = {
    id: '1',
    loanType: 'given',
    principalAmount: 1000,
    interestRate: 5,
    interestType: 'simple',
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-02-01'),
    interestAmount: 50,
    totalAmount: 1050,
    remainingAmount: 1050,
    status: 'active',
    lenderId: 'lender-1',
    borrowerId: 'borrower-1',
    externalLenderId: null,
    externalBorrowerId: null,
    authorId: 'author-1',
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    enabled: true,
  };

  const mockExternalUser = {
    id: 'external-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1234567890',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoanService,
        {
          provide: getRepositoryToken(Loan),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
              getOne: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(LoanPayment),
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
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ExternalUser),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendInApp: jest.fn(),
          },
        },
        {
          provide: ExternalUserService,
          useValue: {
            findOrCreateExternalUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LoanService>(LoanService);
    loanRepository = module.get<Repository<Loan>>(getRepositoryToken(Loan));
    loanPaymentRepository = module.get<Repository<LoanPayment>>(
      getRepositoryToken(LoanPayment),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    externalUserRepository = module.get<Repository<ExternalUser>>(
      getRepositoryToken(ExternalUser),
    );
    notificationService = module.get<NotificationService>(NotificationService);
    externalUserService = module.get<ExternalUserService>(ExternalUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a loan with internal lender and borrower', async () => {
      const createLoanDto: CreateLoanDto = {
        loanType: 'given',
        principalAmount: 1000,
        interestRate: 5,
        interestType: 'simple',
        startDate: '2024-01-01',
        dueDate: '2024-02-01',
        lender: { id: 'lender-1' },
        borrower: { id: 'borrower-1' },
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(loanRepository, 'create').mockReturnValue(mockLoan as Loan);
      jest.spyOn(loanRepository, 'save').mockResolvedValue(mockLoan as Loan);
      jest.spyOn(notificationService, 'sendInApp').mockResolvedValue();

      const result = await service.create(createLoanDto, 'author-1');

      expect(result).toEqual(mockLoan);
      expect(loanRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lenderId: 'lender-1',
          borrowerId: 'borrower-1',
          interestAmount: 50,
          totalAmount: 1050,
          remainingAmount: 1050,
        }),
      );
      expect(notificationService.sendInApp).toHaveBeenCalled();
    });

    it('should create a loan with external lender and internal borrower', async () => {
      const createLoanDto: CreateLoanDto = {
        loanType: 'given',
        principalAmount: 1000,
        interestRate: 5,
        interestType: 'simple',
        startDate: '2024-01-01',
        dueDate: '2024-02-01',
        lender: { name: 'Jane Smith', email: 'jane@example.com' },
        borrower: { id: 'borrower-1' },
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
      jest
        .spyOn(externalUserService, 'findOrCreateExternalUser')
        .mockResolvedValue(mockExternalUser as any);
      jest.spyOn(loanRepository, 'create').mockReturnValue(mockLoan as Loan);
      jest.spyOn(loanRepository, 'save').mockResolvedValue(mockLoan as Loan);

      const result = await service.create(createLoanDto, 'author-1');

      expect(result).toEqual(mockLoan);
      expect(externalUserService.findOrCreateExternalUser).toHaveBeenCalledWith(
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: undefined,
        },
        'author-1',
      );
    });

    it('should throw BadRequestException when lender information is missing', async () => {
      const createLoanDto: CreateLoanDto = {
        loanType: 'given',
        principalAmount: 1000,
        interestRate: 5,
        interestType: 'simple',
        startDate: '2024-01-01',
        dueDate: '2024-02-01',
        lender: {},
        borrower: { id: 'borrower-1' },
      };

      await expect(service.create(createLoanDto, 'author-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when lender is not found', async () => {
      const createLoanDto: CreateLoanDto = {
        loanType: 'given',
        principalAmount: 1000,
        interestRate: 5,
        interestType: 'simple',
        startDate: '2024-01-01',
        dueDate: '2024-02-01',
        lender: { id: 'non-existent' },
        borrower: { id: 'borrower-1' },
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(externalUserRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createLoanDto, 'author-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all loans for a user', async () => {
      const query: LoanQueryDto = {
        page: 1,
        limit: 10,
        lender: { id: 'lender-1' },
        borrower: { id: 'borrower-1' },
      };

      const mockLoans = [mockLoan];
      jest.spyOn(loanRepository, 'createQueryBuilder').mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockLoans),
      } as any);

      const result = await service.findAll(query, 'user-1');

      expect(result).toEqual(mockLoans);
    });
  });

  describe('findOne', () => {
    it('should return a loan by id', async () => {
      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(mockLoan as Loan);

      const result = await service.findOne('1', 'user-1');

      expect(result).toEqual(mockLoan);
      expect(loanRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['lender', 'borrower', 'externalLender', 'externalBorrower'],
      });
    });

    it('should throw NotFoundException when loan is not found', async () => {
      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a loan', async () => {
      const updateLoanDto: UpdateLoanDto = {
        principalAmount: 1500,
        interestRate: 6,
      };

      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(mockLoan as Loan);
      jest.spyOn(loanRepository, 'save').mockResolvedValue({
        ...mockLoan,
        ...updateLoanDto,
      } as any);

      const result = await service.update('1', updateLoanDto, 'user-1');

      expect(result).toEqual({ ...mockLoan, ...updateLoanDto });
      expect(loanRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when loan is not found', async () => {
      const updateLoanDto: UpdateLoanDto = { principalAmount: 1500 };

      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateLoanDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a loan', async () => {
      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(mockLoan as Loan);
      jest
        .spyOn(loanRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await service.remove('1', 'user-1');

      expect(loanRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when loan is not found', async () => {
      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPayment', () => {
    it('should create a loan payment', async () => {
      const createPaymentDto: CreateLoanPaymentDto = {
        loanId: '1',
        amount: 500,
        paymentType: 'partial',
        paymentDate: '2024-01-15',
        notes: 'First payment',
      };

      const mockPayment = {
        id: 'payment-1',
        ...createPaymentDto,
        payeeId: 'lender-1',
        payerId: 'borrower-1',
      };

      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(mockLoan as Loan);
      jest
        .spyOn(loanPaymentRepository, 'create')
        .mockReturnValue(mockPayment as any);
      jest
        .spyOn(loanPaymentRepository, 'save')
        .mockResolvedValue(mockPayment as any);
      jest.spyOn(loanRepository, 'save').mockResolvedValue({
        ...mockLoan,
        remainingAmount: 550,
      } as Loan);

      const result = await service.createPayment(createPaymentDto, 'user-1');

      expect(result).toEqual(mockPayment);
      expect(loanPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          loanId: '1',
          amount: 500,
          payeeId: 'lender-1',
          payerId: 'borrower-1',
        }),
      );
    });

    it('should throw NotFoundException when loan is not found', async () => {
      const createPaymentDto: CreateLoanPaymentDto = {
        loanId: 'non-existent',
        amount: 500,
        paymentType: 'partial',
        paymentDate: '2024-01-15',
      };

      jest.spyOn(loanRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createPayment(createPaymentDto, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateInterest', () => {
    it('should calculate simple interest correctly', () => {
      const principal = 1000;
      const rate = 5;
      const startDate = new Date('2024-01-01');
      const dueDate = new Date('2024-02-01');

      const result = service['calculateInterest'](
        principal,
        rate,
        'simple',
        startDate,
        dueDate,
      );

      expect(result).toBeCloseTo(4.11, 2); // 31 days * 5% / 365
    });

    it('should calculate compound interest correctly', () => {
      const principal = 1000;
      const rate = 5;
      const startDate = new Date('2024-01-01');
      const dueDate = new Date('2024-02-01');

      const result = service['calculateInterest'](
        principal,
        rate,
        'compound',
        startDate,
        dueDate,
      );

      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 for zero interest rate', () => {
      const principal = 1000;
      const rate = 0;
      const startDate = new Date('2024-01-01');
      const dueDate = new Date('2024-02-01');

      const result = service['calculateInterest'](
        principal,
        rate,
        'simple',
        startDate,
        dueDate,
      );

      expect(result).toBe(0);
    });

    it('should return 0 for none interest type', () => {
      const principal = 1000;
      const rate = 5;
      const startDate = new Date('2024-01-01');
      const dueDate = new Date('2024-02-01');

      const result = service['calculateInterest'](
        principal,
        rate,
        'none',
        startDate,
        dueDate,
      );

      expect(result).toBe(0);
    });
  });
});
