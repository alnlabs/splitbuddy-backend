import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In } from 'typeorm';
import { Loan, LoanType, LoanStatus, InterestType } from '../entities/loan.entity';
import { LoanPayment, PaymentType } from '../entities/loan-payment.entity';
import { User } from '../entities/user.entity';
import { 
  CreateLoanDto, 
  UpdateLoanDto, 
  CreateLoanPaymentDto, 
  UpdateLoanPaymentDto,
  LoanQueryDto,
  LoanPaymentQueryDto,
  LoanSummaryDto
} from './loan.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
    @InjectRepository(LoanPayment)
    private readonly loanPaymentRepo: Repository<LoanPayment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createLoanDto: CreateLoanDto, userId: string): Promise<Loan> {
    // Validate users exist
    const [lender, borrower] = await Promise.all([
      this.userRepo.findOne({ where: { id: createLoanDto.lenderId } }),
      this.userRepo.findOne({ where: { id: createLoanDto.borrowerId } }),
    ]);

    if (!lender || !borrower) {
      throw new NotFoundException('Lender or borrower not found');
    }

    // Calculate interest and total amount
    const interestAmount = this.calculateInterest(
      createLoanDto.principalAmount,
      createLoanDto.interestRate || 0,
      createLoanDto.interestType || 'simple',
      createLoanDto.startDate,
      createLoanDto.dueDate
    );

    const totalAmount = createLoanDto.principalAmount + interestAmount;

    // Create loan
    const loan = this.loanRepo.create({
      ...createLoanDto,
      interestAmount,
      totalAmount,
      remainingAmount: totalAmount,
      authorId: userId,
    });

    const savedLoan = await this.loanRepo.save(loan);

    // Send notifications
    await this.sendLoanNotifications(savedLoan, 'created');

    return savedLoan;
  }

  async findAll(query: LoanQueryDto, userId: string): Promise<{ loans: Loan[]; total: number }> {
    const { 
      loanType, 
      status, 
      lenderId, 
      borrowerId, 
      groupId, 
      search, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = query;

    const queryBuilder = this.loanRepo
      .createQueryBuilder('loan')
      .leftJoinAndSelect('loan.lender', 'lender')
      .leftJoinAndSelect('loan.borrower', 'borrower')
      .leftJoinAndSelect('loan.author', 'author')
      .where('(loan.lenderId = :userId OR loan.borrowerId = :userId)', { userId });

    // Apply filters
    if (loanType) {
      queryBuilder.andWhere('loan.loanType = :loanType', { loanType });
    }

    if (status) {
      queryBuilder.andWhere('loan.status = :status', { status });
    }

    if (lenderId) {
      queryBuilder.andWhere('loan.lenderId = :lenderId', { lenderId });
    }

    if (borrowerId) {
      queryBuilder.andWhere('loan.borrowerId = :borrowerId', { borrowerId });
    }

    if (groupId) {
      queryBuilder.andWhere('loan.groupId = :groupId', { groupId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(loan.description ILIKE :search OR loan.notes ILIKE :search OR lender.firstName ILIKE :search OR lender.lastName ILIKE :search OR borrower.firstName ILIKE :search OR borrower.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('loan.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
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
      relations: ['lender', 'borrower', 'author'],
    });

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    // Check if user has access to this loan
    if (loan.lenderId !== userId && loan.borrowerId !== userId && loan.authorId !== userId) {
      throw new BadRequestException('You do not have access to this loan');
    }

    return loan;
  }

  async update(id: string, updateLoanDto: UpdateLoanDto, userId: string): Promise<Loan> {
    const loan = await this.findOne(id, userId);

    // Check if user can update this loan
    if (loan.authorId !== userId) {
      throw new BadRequestException('Only the loan author can update this loan');
    }

    // Recalculate amounts if principal or interest rate changed
    if (updateLoanDto.principalAmount || updateLoanDto.interestRate || updateLoanDto.interestType) {
      const principalAmount = updateLoanDto.principalAmount || loan.principalAmount;
      const interestRate = updateLoanDto.interestRate ?? loan.interestRate;
      const interestType = updateLoanDto.interestType || loan.interestType;

      const interestAmount = this.calculateInterest(
        principalAmount,
        interestRate || 0,
        interestType,
        loan.startDate,
        updateLoanDto.dueDate || loan.dueDate
      );

      const totalAmount = principalAmount + interestAmount;
      const remainingAmount = totalAmount - loan.paidAmount;

      updateLoanDto.interestAmount = interestAmount;
      updateLoanDto.totalAmount = totalAmount;
      updateLoanDto.remainingAmount = remainingAmount;
    }

    // Update loan
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
      throw new BadRequestException('Only the loan author can delete this loan');
    }

    // Check if loan has payments
    const paymentCount = await this.loanPaymentRepo.count({ where: { loanId: id } });
    if (paymentCount > 0) {
      throw new BadRequestException('Cannot delete loan with existing payments');
    }

    await this.loanRepo.remove(loan);

    // Send notifications
    await this.sendLoanNotifications(loan, 'deleted');
  }

  async createPayment(createPaymentDto: CreateLoanPaymentDto, userId: string): Promise<LoanPayment> {
    const loan = await this.findOne(createPaymentDto.loanId, userId);

    // Validate payment amount
    if (createPaymentDto.amount > loan.remainingAmount) {
      throw new BadRequestException('Payment amount cannot exceed remaining loan amount');
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

  async findPayments(query: LoanPaymentQueryDto, userId: string): Promise<{ payments: LoanPayment[]; total: number }> {
    const { 
      loanId, 
      paymentType, 
      payerId, 
      payeeId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = query;

    const queryBuilder = this.loanPaymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.loan', 'loan')
      .leftJoinAndSelect('payment.payer', 'payer')
      .leftJoinAndSelect('payment.payee', 'payee')
      .leftJoinAndSelect('payment.author', 'author')
      .where('(payment.payerId = :userId OR payment.payeeId = :userId OR payment.authorId = :userId)', { userId });

    // Apply filters
    if (loanId) {
      queryBuilder.andWhere('payment.loanId = :loanId', { loanId });
    }

    if (paymentType) {
      queryBuilder.andWhere('payment.paymentType = :paymentType', { paymentType });
    }

    if (payerId) {
      queryBuilder.andWhere('payment.payerId = :payerId', { payerId });
    }

    if (payeeId) {
      queryBuilder.andWhere('payment.payeeId = :payeeId', { payeeId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', { startDate, endDate });
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
      relations: ['loan', 'payer', 'payee', 'author'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check if user has access to this payment
    if (payment.payerId !== userId && payment.payeeId !== userId && payment.authorId !== userId) {
      throw new BadRequestException('You do not have access to this payment');
    }

    return payment;
  }

  async updatePayment(id: string, updatePaymentDto: UpdateLoanPaymentDto, userId: string): Promise<LoanPayment> {
    const payment = await this.findPayment(id, userId);

    // Check if user can update this payment
    if (payment.authorId !== userId) {
      throw new BadRequestException('Only the payment author can update this payment');
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
      throw new BadRequestException('Only the payment author can delete this payment');
    }

    const loanId = payment.loanId;
    await this.loanPaymentRepo.remove(payment);

    // Update loan amounts
    await this.updateLoanAmounts(loanId);

    // Send payment notifications
    await this.sendPaymentNotifications(payment, 'deleted');
  }

  async getSummary(summaryDto: LoanSummaryDto, userId: string) {
    const { groupId, startDate, endDate } = summaryDto;

    const queryBuilder = this.loanRepo
      .createQueryBuilder('loan')
      .where('(loan.lenderId = :userId OR loan.borrowerId = :userId)', { userId });

    if (groupId) {
      queryBuilder.andWhere('loan.groupId = :groupId', { groupId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('loan.startDate BETWEEN :startDate AND :endDate', { startDate, endDate });
    }

    const loans = await queryBuilder.getMany();

    // Calculate summary
    const summary = {
      totalLoans: loans.length,
      activeLoans: loans.filter(loan => loan.status === 'active').length,
      overdueLoans: loans.filter(loan => loan.status === 'overdue').length,
      repaidLoans: loans.filter(loan => loan.status === 'repaid').length,
      totalGiven: loans
        .filter(loan => loan.loanType === 'given')
        .reduce((sum, loan) => sum + Number(loan.principalAmount), 0),
      totalTaken: loans
        .filter(loan => loan.loanType === 'taken')
        .reduce((sum, loan) => sum + Number(loan.principalAmount), 0),
      totalInterestEarned: loans
        .filter(loan => loan.loanType === 'given')
        .reduce((sum, loan) => sum + Number(loan.interestAmount), 0),
      totalInterestPaid: loans
        .filter(loan => loan.loanType === 'taken')
        .reduce((sum, loan) => sum + Number(loan.interestAmount), 0),
      outstandingGiven: loans
        .filter(loan => loan.loanType === 'given' && loan.status === 'active')
        .reduce((sum, loan) => sum + Number(loan.remainingAmount), 0),
      outstandingTaken: loans
        .filter(loan => loan.loanType === 'taken' && loan.status === 'active')
        .reduce((sum, loan) => sum + Number(loan.remainingAmount), 0),
    };

    return summary;
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
    startDate: string,
    dueDate: string
  ): number {
    if (rate === 0 || type === 'none') {
      return 0;
    }

    const start = new Date(startDate);
    const due = new Date(dueDate);
    const days = Math.ceil((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

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
    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

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

  private async sendLoanNotifications(loan: Loan, action: string): Promise<void> {
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
      await this.notificationService.sendInApp(notification);
    }
  }

  private async sendPaymentNotifications(payment: LoanPayment, action: string): Promise<void> {
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
      await this.notificationService.sendInApp(notification);
    }
  }
}
