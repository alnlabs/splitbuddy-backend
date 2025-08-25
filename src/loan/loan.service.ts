import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Loan, InterestType } from '../entities/loan.entity';
import { LoanPayment } from '../entities/loan-payment.entity';
import { User } from '../entities/user.entity';
import { ExternalUser } from '../entities/external-user.entity';
import {
  CreateLoanDto,
  UpdateLoanDto,
  CreateLoanPaymentDto,
  UpdateLoanPaymentDto,
  LoanQueryDto,
  LoanPaymentQueryDto,
  LoanSummaryDto,
} from './loan.dto';
import { NotificationService } from '../notification/notification.service';
import { ExternalUserService } from '../external-user/external-user.service';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private readonly loanPaymentRepo: Repository<LoanPayment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ExternalUser)
    private readonly externalUserRepo: Repository<ExternalUser>,
    private readonly notificationService: NotificationService,
    private readonly externalUserService: ExternalUserService,
  ) {}

  async create(createLoanDto: CreateLoanDto, userId: string): Promise<Loan> {
    let lender: User | ExternalUser | null = null;
    let borrower: User | ExternalUser | null = null;
    let isLenderExternal = false;
    let isBorrowerExternal = false;

    // Handle lender
    if (createLoanDto.lender?.id) {
      // Check if it's an internal user
      lender = await this.userRepo.findOne({
        where: { id: createLoanDto.lender.id, enabled: true },
      });

      if (!lender) {
        // Check if it's an external user
        lender = await this.externalUserRepo.findOne({
          where: { id: createLoanDto.lender.id, isActive: true },
        });
        if (lender) {
          isLenderExternal = true;
        }
      }

      if (!lender) {
        throw new NotFoundException('Lender not found');
      }
    } else if (createLoanDto.lender?.name) {
      // Create or find external user for lender
      lender = await this.externalUserService.findOrCreateExternalUser(
        {
          firstName: createLoanDto.lender.name.split(' ')[0],
          lastName:
            createLoanDto.lender.name.split(' ').slice(1).join(' ') ||
            undefined,
          email: createLoanDto.lender.email,
          phone: createLoanDto.lender.phone,
        },
        userId,
      );
      isLenderExternal = true;
    } else {
      throw new BadRequestException('Lender information is required');
    }

    // Handle borrower
    if (createLoanDto.borrower?.id) {
      // Check if it's an internal user
      borrower = await this.userRepo.findOne({
        where: { id: createLoanDto.borrower.id, enabled: true },
      });

      if (!borrower) {
        // Check if it's an external user
        borrower = await this.externalUserRepo.findOne({
          where: { id: createLoanDto.borrower.id, isActive: true },
        });
        if (borrower) {
          isBorrowerExternal = true;
        }
      }

      if (!borrower) {
        throw new NotFoundException('Borrower not found');
      }
    } else if (createLoanDto.borrower?.name) {
      // Create or find external user for borrower
      borrower = await this.externalUserService.findOrCreateExternalUser(
        {
          firstName: createLoanDto.borrower.name.split(' ')[0],
          lastName:
            createLoanDto.borrower.name.split(' ').slice(1).join(' ') ||
            undefined,
          email: createLoanDto.borrower.email,
          phone: createLoanDto.borrower.phone,
        },
        userId,
      );
      isBorrowerExternal = true;
    } else {
      throw new BadRequestException('Borrower information is required');
    }

    // Calculate interest and total amount
    const interestAmount = this.calculateInterest(
      createLoanDto.principalAmount,
      createLoanDto.interestRate || 0,
      createLoanDto.interestType || 'simple',
      new Date(createLoanDto.startDate),
      new Date(createLoanDto.dueDate),
    );

    const totalAmount = createLoanDto.principalAmount + interestAmount;

    // Create loan with appropriate fields
    const loanData: any = {
      ...createLoanDto,
      interestAmount,
      totalAmount,
      remainingAmount: totalAmount,
      authorId: userId,
    };

    // Set lender and borrower IDs based on type
    if (isLenderExternal) {
      loanData.externalLenderId = lender.id;
    } else {
      loanData.lenderId = lender.id;
    }

    if (isBorrowerExternal) {
      loanData.externalBorrowerId = borrower.id;
    } else {
      loanData.borrowerId = borrower.id;
    }

    const loan = this.loanRepo.create(loanData);
    const savedLoan = await this.loanRepo.save(loan);

    // Send notifications
    await this.sendLoanNotifications(savedLoan as unknown as Loan, 'created');

    return savedLoan as unknown as Loan;
  }

  async findAll(
    query: LoanQueryDto,
    userId: string,
  ): Promise<{ loans: Loan[]; total: number }> {
    const {
      loanType,
      status,
      lender,
      borrower,
      groupId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.loanRepo
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.lender', 'lender')
      .leftJoinAndSelect('loan.borrower', 'borrower')
      .leftJoinAndSelect('loan.author', 'author')
      .where('(loan.lenderId = :userId OR loan.borrowerId = :userId)', {
        userId,
      });

    // Apply filters
    if (loanType) {
      queryBuilder.andWhere('loan.loanType = :loanType', { loanType });
    }

    if (status) {
      queryBuilder.andWhere('loan.status = :status', { status });
    }

    if (lender?.id) {
      queryBuilder.andWhere('loan.lenderId = :lenderId', {
        lenderId: lender.id,
      });
    }

    if (borrower?.id) {
      queryBuilder.andWhere('loan.borrowerId = :borrowerId', {
        borrowerId: borrower.id,
      });
    }

    if (groupId) {
      queryBuilder.andWhere('loan.groupId = :groupId', { groupId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(loan.description ILIKE :search OR loan.notes ILIKE :search OR lender.firstName ILIKE :search OR lender.lastName ILIKE :search OR borrower.firstName ILIKE :search OR borrower.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('loan.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const loans = await queryBuilder
      .orderBy('loan.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { loans, total };
  }

  async findOne(id: string, userId: string): Promise<Loan> {
    const loan = await this.loanRepo.findOne({
      where: { id },
      relations: ['lender', 'borrower', 'externalLender', 'externalBorrower'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Check if user has access to this loan
    if (loan.lenderId !== userId && loan.borrowerId !== userId) {
      throw new BadRequestException('You do not have access to this loan');
    }

    return loan;
  }

  async update(
    id: string,
    updateLoanDto: UpdateLoanDto,
    userId: string,
  ): Promise<Loan> {
    const loan = await this.findOne(id, userId);

    // Check if user can update this loan
    if (loan.authorId !== userId) {
      throw new BadRequestException(
        'Only the loan author can update this loan',
      );
    }

    // Recalculate interest and amounts if principal or dates changed
    if (
      updateLoanDto.principalAmount ||
      updateLoanDto.interestRate ||
      updateLoanDto.interestType ||
      updateLoanDto.dueDate
    ) {
      const principalAmount = updateLoanDto.principalAmount || loan.principalAmount;
      const interestRate = updateLoanDto.interestRate || loan.interestRate;
      const interestType = updateLoanDto.interestType || loan.interestType;
      const startDate = loan.startDate;
      const dueDate = updateLoanDto.dueDate ? new Date(updateLoanDto.dueDate) : loan.dueDate;

      const interestAmount = this.calculateInterest(
        principalAmount,
        interestRate || 0,
        interestType,
        startDate,
        dueDate,
      );

      const totalAmount = principalAmount + interestAmount;
      const remainingAmount = totalAmount - loan.paidAmount;

      // Update the loan object directly
      loan.interestAmount = interestAmount;
      loan.totalAmount = totalAmount;
      loan.remainingAmount = remainingAmount;
    }

    // Update loan with other fields
    Object.assign(loan, updateLoanDto);
    const updatedLoan = await this.loanRepo.save(loan);

    // Send notifications
    await this.sendLoanNotifications(updatedLoan, 'updated');

    return updatedLoan;
  }

  async remove(id: string, userId: string): Promise<void> {
    const loan = await this.findOne(id, userId);

    // Check if user can delete this loan
    if (loan.authorId !== userId) {
      throw new BadRequestException(
        'Only the loan author can delete this loan',
      );
    }

    // Check if loan has payments
    const paymentCount = await this.loanPaymentRepo.count({
      where: { loanId: id },
    });
    if (paymentCount > 0) {
      throw new BadRequestException(
        'Cannot delete loan with existing payments',
      );
    }

    await this.loanRepo.remove(loan);

    // Send notifications
    await this.sendLoanNotifications(loan, 'deleted');
  }

  async createPayment(
    createPaymentDto: CreateLoanPaymentDto,
    userId: string,
  ): Promise<LoanPayment> {
    const loan = await this.findOne(createPaymentDto.loanId, userId);

    // Validate payment amount
    if (createPaymentDto.amount > loan.remainingAmount) {
      throw new BadRequestException(
        'Payment amount cannot exceed remaining loan amount',
      );
    }

    // Determine payer and payee based on loan type
    const payerId = loan.loanType === 'given' ? loan.borrowerId : loan.lenderId;
    const payeeId = loan.loanType === 'given' ? loan.lenderId : loan.borrowerId;

    // Create payment
    const payment = this.loanPaymentRepo.create({
      ...createPaymentDto,
      payerId,
      payeeId,
      authorId: userId,
    });

    const savedPayment = await this.loanPaymentRepo.save(payment);

    // Update loan amounts
    await this.updateLoanAmounts(loan.id);

    // Send payment notifications
    await this.sendPaymentNotifications(savedPayment, 'created');

    return savedPayment;
  }

  async findPayments(
    query: LoanPaymentQueryDto,
    userId: string,
  ): Promise<{ payments: LoanPayment[]; total: number }> {
    const {
      loanId,
      paymentType,
      payerId,
      payeeId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.loanPaymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.loan', 'loan')
      .leftJoinAndSelect('payment.payer', 'payer')
      .leftJoinAndSelect('payment.payee', 'payee')
      .where('(loan.lenderId = :userId OR loan.borrowerId = :userId)', {
        userId,
      });

    // Apply filters
    if (loanId) {
      queryBuilder.andWhere('payment.loanId = :loanId', { loanId });
    }

    if (paymentType) {
      queryBuilder.andWhere('payment.paymentType = :paymentType', {
        paymentType,
      });
    }

    if (payerId) {
      queryBuilder.andWhere('payment.payerId = :payerId', { payerId });
    }

    if (payeeId) {
      queryBuilder.andWhere('payment.payeeId = :payeeId', { payeeId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'payment.paymentDate BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const payments = await queryBuilder
      .orderBy('payment.paymentDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { payments, total };
  }

  async findPayment(id: string, userId: string): Promise<LoanPayment> {
    const payment = await this.loanPaymentRepo.findOne({
      where: { id },
      relations: ['loan', 'payer', 'payee'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check if user has access to this payment
    if (
      payment.loan.lenderId !== userId &&
      payment.loan.borrowerId !== userId
    ) {
      throw new BadRequestException('You do not have access to this payment');
    }

    return payment;
  }

  async updatePayment(
    id: string,
    updatePaymentDto: UpdateLoanPaymentDto,
    userId: string,
  ): Promise<LoanPayment> {
    const payment = await this.findPayment(id, userId);

    // Check if user can update this payment
    if (payment.authorId !== userId) {
      throw new BadRequestException(
        'Only the payment author can update this payment',
      );
    }

    // Update payment
    Object.assign(payment, updatePaymentDto);
    const updatedPayment = await this.loanPaymentRepo.save(payment);

    // Update loan amounts
    await this.updateLoanAmounts(payment.loanId);

    // Send payment notifications
    await this.sendPaymentNotifications(updatedPayment, 'updated');

    return updatedPayment;
  }

  async removePayment(id: string, userId: string): Promise<void> {
    const payment = await this.findPayment(id, userId);

    // Check if user can delete this payment
    if (payment.authorId !== userId) {
      throw new BadRequestException(
        'Only the payment author can delete this payment',
      );
    }

    const loanId = payment.loanId;

    await this.loanPaymentRepo.remove(payment);

    // Update loan amounts
    await this.updateLoanAmounts(loanId);

    // Send payment notifications
    await this.sendPaymentNotifications(payment, 'deleted');
  }

  async getSummary(
    summaryDto: LoanSummaryDto,
    userId: string,
  ): Promise<{
    totalLoans: number;
    activeLoans: number;
    totalAmount: number;
    totalInterest: number;
    totalPaid: number;
    totalRemaining: number;
  }> {
    const { startDate, endDate, loanType, status } = summaryDto;

    const queryBuilder = this.loanRepo
      .createQueryBuilder('loan')
      .where('(loan.lenderId = :userId OR loan.borrowerId = :userId)', {
        userId,
      });

    // Apply filters
    if (startDate && endDate) {
      queryBuilder.andWhere('loan.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (loanType) {
      queryBuilder.andWhere('loan.loanType = :loanType', { loanType });
    }

    if (status) {
      queryBuilder.andWhere('loan.status = :status', { status });
    }

    const loans = await queryBuilder.getMany();

    const totalLoans = loans.length;
    const activeLoans = loans.filter((loan) => loan.status === 'active').length;
    const totalAmount = loans.reduce((sum, loan) => sum + loan.totalAmount, 0);
    const totalInterest = loans.reduce((sum, loan) => sum + loan.interestAmount, 0);
    const totalPaid = loans.reduce((sum, loan) => sum + loan.paidAmount, 0);
    const totalRemaining = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);

    return {
      totalLoans,
      activeLoans,
      totalAmount,
      totalInterest,
      totalPaid,
      totalRemaining,
    };
  }

  async checkOverdueLoans(): Promise<void> {
    const today = new Date();
    const overdueLoans = await this.loanRepo.find({
      where: {
        status: 'active',
        dueDate: Between(new Date('1900-01-01'), today),
      },
    });

    for (const loan of overdueLoans) {
      // Update status to overdue
      loan.status = 'overdue';
      await this.loanRepo.save(loan);

      // Send overdue notifications
      await this.sendLoanNotifications(loan, 'overdue');
    }
  }

  private calculateInterest(
    principal: number,
    rate: number,
    type: InterestType,
    startDate: Date,
    dueDate: Date,
  ): number {
    if (rate === 0 || type === 'none') {
      return 0;
    }

    const days = Math.ceil(
      (dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (type === 'simple') {
      return (principal * rate * days) / (100 * 365);
    } else if (type === 'compound') {
      // Monthly compound interest
      const months = days / 30;
      return principal * Math.pow(1 + rate / (100 * 12), months) - principal;
    }

    return 0;
  }

  private async updateLoanAmounts(loanId: string): Promise<void> {
    const loan = await this.loanRepo.findOne({ where: { id: loanId } });
    if (!loan) return;

    // Calculate total paid amount
    const payments = await this.loanPaymentRepo.find({ where: { loanId } });
    const totalPaid = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    // Update loan amounts
    loan.paidAmount = totalPaid;
    loan.remainingAmount = loan.totalAmount - totalPaid;

    // Update status
    if (loan.remainingAmount <= 0) {
      loan.status = 'repaid';
      loan.repaidDate = new Date();
    } else if (loan.status === 'repaid') {
      loan.status = 'active';
      loan.repaidDate = null;
    }

    await this.loanRepo.save(loan);
  }

  private async sendLoanNotifications(
    loan: Loan,
    action: string,
  ): Promise<void> {
    const notifications = [];

    if (action === 'created') {
      notifications.push({
        userId: loan.borrowerId,
        title: 'New Loan Created',
        message: `A new loan of $${loan.principalAmount} has been created for you.`,
        type: 'loan',
        data: { loanId: loan.id, action },
      });
    } else if (action === 'updated') {
      notifications.push({
        userId: loan.borrowerId,
        title: 'Loan Updated',
        message: `Your loan of $${loan.principalAmount} has been updated.`,
        type: 'loan',
        data: { loanId: loan.id, action },
      });
    } else if (action === 'overdue') {
      notifications.push({
        userId: loan.borrowerId,
        title: 'Loan Overdue',
        message: `Your loan of $${loan.principalAmount} is overdue. Please make payment.`,
        type: 'loan',
        data: { loanId: loan.id, action },
      });
    }

    // Send notifications
    for (const notification of notifications) {
      if (notification.userId) {
        await this.notificationService.sendInApp(notification.userId, notification.message);
      }
    }
  }

  private async sendPaymentNotifications(
    payment: LoanPayment,
    action: string,
  ): Promise<void> {
    const notifications = [];

    if (action === 'created') {
      notifications.push({
        userId: payment.payeeId,
        title: 'Loan Payment Received',
        message: `Payment of $${payment.amount} has been received for your loan.`,
        type: 'payment',
        data: { paymentId: payment.id, loanId: payment.loanId, action },
      });
    }

    // Send notifications
    for (const notification of notifications) {
      if (notification.userId) {
        await this.notificationService.sendInApp(notification.userId, notification.message);
      }
    }
  }
}
