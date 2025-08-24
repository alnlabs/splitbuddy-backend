import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoanService } from './loan.service';
import { 
  CreateLoanDto, 
  UpdateLoanDto, 
  CreateLoanPaymentDto, 
  UpdateLoanPaymentDto,
  LoanQueryDto,
  LoanPaymentQueryDto,
  LoanSummaryDto
} from './loan.dto';
import { Loan } from '../entities/loan.entity';
import { LoanPayment } from '../entities/loan-payment.entity';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoanController {
  constructor(private readonly loanService: LoanService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new loan' })
  @ApiResponse({ status: 201, description: 'Loan created successfully', type: Loan })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Lender or borrower not found' })
  async create(@Body() createLoanDto: CreateLoanDto, @Request() req): Promise<Loan> {
    return this.loanService.create(createLoanDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all loans with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Loans retrieved successfully' })
  async findAll(@Query() query: LoanQueryDto, @Request() req) {
    return this.loanService.findAll(query, req.user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get loan summary statistics' })
  @ApiResponse({ status: 200, description: 'Loan summary retrieved successfully' })
  async getSummary(@Query() query: LoanSummaryDto, @Request() req) {
    return this.loanService.getSummary(query, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific loan by ID' })
  @ApiResponse({ status: 200, description: 'Loan retrieved successfully', type: Loan })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async findOne(@Param('id') id: string, @Request() req): Promise<Loan> {
    return this.loanService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a loan' })
  @ApiResponse({ status: 200, description: 'Loan updated successfully', type: Loan })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async update(
    @Param('id') id: string,
    @Body() updateLoanDto: UpdateLoanDto,
    @Request() req
  ): Promise<Loan> {
    return this.loanService.update(id, updateLoanDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a loan' })
  @ApiResponse({ status: 200, description: 'Loan deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete loan with payments' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.loanService.remove(id, req.user.id);
  }

  // Loan Payments endpoints
  @Post('payments')
  @ApiOperation({ summary: 'Create a loan payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully', type: LoanPayment })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async createPayment(
    @Body() createPaymentDto: CreateLoanPaymentDto,
    @Request() req
  ): Promise<LoanPayment> {
    return this.loanService.createPayment(createPaymentDto, req.user.id);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all loan payments with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findPayments(@Query() query: LoanPaymentQueryDto, @Request() req) {
    return this.loanService.findPayments(query, req.user.id);
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get a specific payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully', type: LoanPayment })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findPayment(@Param('id') id: string, @Request() req): Promise<LoanPayment> {
    return this.loanService.findPayment(id, req.user.id);
  }

  @Patch('payments/:id')
  @ApiOperation({ summary: 'Update a loan payment' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully', type: LoanPayment })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdateLoanPaymentDto,
    @Request() req
  ): Promise<LoanPayment> {
    return this.loanService.updatePayment(id, updatePaymentDto, req.user.id);
  }

  @Delete('payments/:id')
  @ApiOperation({ summary: 'Delete a loan payment' })
  @ApiResponse({ status: 200, description: 'Payment deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async removePayment(@Param('id') id: string, @Request() req): Promise<void> {
    return this.loanService.removePayment(id, req.user.id);
  }

  // Additional utility endpoints
  @Get(':id/payments')
  @ApiOperation({ summary: 'Get all payments for a specific loan' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getLoanPayments(
    @Param('id') loanId: string,
    @Query() query: LoanPaymentQueryDto,
    @Request() req
  ) {
    const paymentQuery = { ...query, loanId };
    return this.loanService.findPayments(paymentQuery, req.user.id);
  }

  @Post(':id/check-overdue')
  @ApiOperation({ summary: 'Check and update overdue loans' })
  @ApiResponse({ status: 200, description: 'Overdue check completed' })
  async checkOverdueLoans(): Promise<void> {
    return this.loanService.checkOverdueLoans();
  }
}
