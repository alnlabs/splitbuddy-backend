import { Test, TestingModule } from '@nestjs/testing';
import { LoanController } from './loan.controller';
import { LoanService } from './loan.service';
import { CreateLoanDto, UpdateLoanDto, LoanQueryDto, LoanSummaryDto } from './loan.dto';

describe('LoanController', () => {
  let controller: LoanController;
  let loanService: LoanService;

  const mockLoan = {
    id: '1',
    loanType: 'given',
    principalAmount: 1000,
    interestRate: 5,
    interestType: 'simple',
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-02-01'),
    status: 'active',
    lenderId: 'lender-1',
    borrowerId: 'borrower-1',
    authorId: 'user-1',
    totalAmount: 1000,
    interestAmount: 0,
    paidAmount: 0,
    remainingAmount: 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLoanPayment = {
    id: 'payment-1',
    loanId: '1',
    amount: 500,
    paymentType: 'principal',
    payerId: 'borrower-1',
    payeeId: 'lender-1',
    paymentDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoanController],
      providers: [
        {
          provide: LoanService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createPayment: jest.fn(),
            findPayments: jest.fn(),
            findPayment: jest.fn(),
            updatePayment: jest.fn(),
            removePayment: jest.fn(),
            getSummary: jest.fn(),
            checkOverdueLoans: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LoanController>(LoanController);
    loanService = module.get<LoanService>(LoanService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a loan', async () => {
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

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'create').mockResolvedValue(mockLoan as any);

      const result = await controller.create(createLoanDto, mockRequest as any);

      expect(result).toEqual(mockLoan);
      expect(loanService.create).toHaveBeenCalledWith(createLoanDto, 'user-1');
    });
  });

  describe('findAll', () => {
    it('should return all loans', async () => {
      const query: LoanQueryDto = {
        page: 1,
        limit: 10,
      };

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      const mockLoans = { loans: [mockLoan], total: 1 };
      jest.spyOn(loanService, 'findAll').mockResolvedValue(mockLoans as any);

      const result = await controller.findAll(query, mockRequest as any);

      expect(result).toEqual(mockLoans);
      expect(loanService.findAll).toHaveBeenCalledWith(query, 'user-1');
    });
  });

  describe('findOne', () => {
    it('should return a loan by id', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'findOne').mockResolvedValue(mockLoan as any);

      const result = await controller.findOne('1', mockRequest as any);

      expect(result).toEqual(mockLoan);
      expect(loanService.findOne).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('update', () => {
    it('should update a loan', async () => {
      const updateLoanDto: UpdateLoanDto = {
        principalAmount: 1500,
        interestRate: 6,
      };

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'update').mockResolvedValue(mockLoan as any);

      const result = await controller.update('1', updateLoanDto, mockRequest as any);

      expect(result).toEqual(mockLoan);
      expect(loanService.update).toHaveBeenCalledWith('1', updateLoanDto, 'user-1');
    });
  });

  describe('remove', () => {
    it('should delete a loan', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'remove').mockResolvedValue(undefined);

      await controller.remove('1', mockRequest as any);

      expect(loanService.remove).toHaveBeenCalledWith('1', 'user-1');
    });
  });

  describe('getSummary', () => {
    it('should return loan summary', async () => {
      const query: LoanSummaryDto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      const mockSummary = {
        totalLoans: 5,
        activeLoans: 3,
        totalAmount: 5000,
        totalInterest: 250,
        totalPaid: 2000,
        totalRemaining: 3000,
      };

      jest.spyOn(loanService, 'getSummary').mockResolvedValue(mockSummary as any);

      const result = await controller.getSummary(query, mockRequest as any);

      expect(result).toEqual(mockSummary);
      expect(loanService.getSummary).toHaveBeenCalledWith(query, 'user-1');
    });
  });

  describe('createPayment', () => {
    it('should create a loan payment', async () => {
      const createPaymentDto = {
        loanId: '1',
        amount: 500,
        paymentType: 'principal' as const,
        payerId: 'borrower-1',
        payeeId: 'lender-1',
        paymentDate: '2024-01-15',
      };

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'createPayment').mockResolvedValue(mockLoanPayment as any);

      const result = await controller.createPayment(createPaymentDto, mockRequest as any);

      expect(result).toEqual(mockLoanPayment);
      expect(loanService.createPayment).toHaveBeenCalledWith(createPaymentDto, 'user-1');
    });
  });

  describe('findPayments', () => {
    it('should return all payments', async () => {
      const query = {
        loanId: '1',
        page: 1,
        limit: 10,
      };

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      const mockPayments = { payments: [mockLoanPayment], total: 1 };
      jest.spyOn(loanService, 'findPayments').mockResolvedValue(mockPayments as any);

      const result = await controller.findPayments(query, mockRequest as any);

      expect(result).toEqual(mockPayments);
      expect(loanService.findPayments).toHaveBeenCalledWith(query, 'user-1');
    });
  });

  describe('findPayment', () => {
    it('should return a payment by id', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'findPayment').mockResolvedValue(mockLoanPayment as any);

      const result = await controller.findPayment('payment-1', mockRequest as any);

      expect(result).toEqual(mockLoanPayment);
      expect(loanService.findPayment).toHaveBeenCalledWith('payment-1', 'user-1');
    });
  });

  describe('updatePayment', () => {
    it('should update a payment', async () => {
      const updatePaymentDto = {
        amount: 600,
        paymentType: 'principal' as const,
      };

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'updatePayment').mockResolvedValue(mockLoanPayment as any);

      const result = await controller.updatePayment('payment-1', updatePaymentDto, mockRequest as any);

      expect(result).toEqual(mockLoanPayment);
      expect(loanService.updatePayment).toHaveBeenCalledWith('payment-1', updatePaymentDto, 'user-1');
    });
  });

  describe('removePayment', () => {
    it('should delete a payment', async () => {
      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      jest.spyOn(loanService, 'removePayment').mockResolvedValue(undefined);

      await controller.removePayment('payment-1', mockRequest as any);

      expect(loanService.removePayment).toHaveBeenCalledWith('payment-1', 'user-1');
    });
  });

  describe('getLoanPayments', () => {
    it('should return payments for a specific loan', async () => {
      const query = {
        page: 1,
        limit: 10,
      };

      const mockRequest = {
        user: { id: 'user-1' },
        headers: {},
      };

      const mockPayments = { payments: [mockLoanPayment], total: 1 };
      jest.spyOn(loanService, 'findPayments').mockResolvedValue(mockPayments as any);

      const result = await controller.getLoanPayments('1', query, mockRequest as any);

      expect(result).toEqual(mockPayments);
      expect(loanService.findPayments).toHaveBeenCalledWith({ ...query, loanId: '1' }, 'user-1');
    });
  });

  describe('checkOverdueLoans', () => {
    it('should check overdue loans', async () => {
      jest.spyOn(loanService, 'checkOverdueLoans').mockResolvedValue(undefined);

      await controller.checkOverdueLoans();

      expect(loanService.checkOverdueLoans).toHaveBeenCalled();
    });
  });
});
