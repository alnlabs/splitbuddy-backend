import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

const TRANSACTION_TYPES = [
  'income',
  'loan_given',
  'loan_taken',
  'chit_investment',
  'gold',
  'asset_loan',
  'expense',
] as const;

type TransactionType = (typeof TRANSACTION_TYPES)[number];

class CreateTransactionDto {
  @ApiProperty({ enum: TRANSACTION_TYPES, description: 'Transaction type' })
  @IsIn(TRANSACTION_TYPES)
  type: TransactionType;

  @ApiProperty({ description: 'Transaction amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Transaction date' })
  @IsDateString()
  date: Date;

  @ApiProperty({ required: false, description: 'Transaction description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Counterparty name' })
  @IsOptional()
  @IsString()
  counterparty?: string;

  @ApiProperty({ required: false, description: 'Interest rate' })
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiProperty({ required: false, description: 'Asset type' })
  @IsOptional()
  @IsString()
  assetType?: string;

  @ApiProperty({ required: false, description: 'Group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ required: false, description: 'Transaction status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'User ID' })
  @IsString()
  userId: string;
}

class UpdateTransactionDto {
  @ApiProperty({ required: false, enum: TRANSACTION_TYPES, description: 'Transaction type' })
  @IsOptional()
  @IsIn(TRANSACTION_TYPES)
  type?: TransactionType;

  @ApiProperty({ required: false, description: 'Transaction amount' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ required: false, description: 'Transaction date' })
  @IsOptional()
  @IsDateString()
  date?: Date;

  @ApiProperty({ required: false, description: 'Transaction description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, description: 'Counterparty name' })
  @IsOptional()
  @IsString()
  counterparty?: string;

  @ApiProperty({ required: false, description: 'Interest rate' })
  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @ApiProperty({ required: false, description: 'Asset type' })
  @IsOptional()
  @IsString()
  assetType?: string;

  @ApiProperty({ required: false, description: 'Group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ required: false, description: 'Transaction status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;
}

@ApiTags('Transactions')
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'List transactions with optional filters' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by transaction type' })
  @ApiQuery({ name: 'groupId', required: false, description: 'Filter by group ID' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Query('type') type?: string, @Query('groupId') groupId?: string) {
    return this.transactionService.list(type, groupId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('summary')
  @ApiOperation({ summary: 'Get transaction summary by date range' })
  @ApiQuery({ name: 'start', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Transaction summary retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async summary(@Query('start') start: string, @Query('end') end: string) {
    return this.transactionService.summary(start, end);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('loans')
  @ApiOperation({ summary: 'Get loan transactions' })
  @ApiQuery({ name: 'type', description: 'Loan type (given/taken)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by loan status' })
  @ApiResponse({ status: 200, description: 'Loan transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async loans(@Query('type') type: string, @Query('status') status?: string) {
    return this.transactionService.loans(type, status);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('chitti-status')
  @ApiOperation({ summary: 'Get chit fund status' })
  @ApiQuery({ name: 'groupId', description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Chit fund status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async chittiStatus(@Query('groupId') groupId: string) {
    return this.transactionService.chittiStatus(groupId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('assets')
  @ApiOperation({ summary: 'Get asset transactions' })
  @ApiQuery({ name: 'type', description: 'Asset type' })
  @ApiResponse({ status: 200, description: 'Asset transactions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assets(@Query('type') type: string) {
    return this.transactionService.assets(type);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('net-cash-flow')
  @ApiOperation({ summary: 'Get net cash flow by date range' })
  @ApiQuery({ name: 'start', description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Net cash flow retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async netCashFlow(@Query('start') start: string, @Query('end') end: string) {
    return this.transactionService.netCashFlow(start, end);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(@Param('id') id: string) {
    return this.transactionService.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    return this.transactionService.delete(id);
  }
}
