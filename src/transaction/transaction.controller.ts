import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

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
  @IsIn(TRANSACTION_TYPES)
  type: TransactionType;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  counterparty?: string;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsString()
  assetType?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  userId: string;
}

class UpdateTransactionDto {
  @IsOptional()
  @IsIn(TRANSACTION_TYPES)
  type?: TransactionType;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  counterparty?: string;

  @IsOptional()
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @IsString()
  assetType?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() dto: CreateTransactionDto) {
    return this.transactionService.create(dto);
  }

  @Get()
  async list(@Query('type') type?: string, @Query('groupId') groupId?: string) {
    return this.transactionService.list(type, groupId);
  }

  @Get('summary')
  async summary(@Query('start') start: string, @Query('end') end: string) {
    return this.transactionService.summary(start, end);
  }

  @Get('loans')
  async loans(@Query('type') type: string, @Query('status') status?: string) {
    return this.transactionService.loans(type, status);
  }

  @Get('chitti-status')
  async chittiStatus(@Query('groupId') groupId: string) {
    return this.transactionService.chittiStatus(groupId);
  }

  @Get('assets')
  async assets(@Query('type') type: string) {
    return this.transactionService.assets(type);
  }

  @Get('net-cash-flow')
  async netCashFlow(@Query('start') start: string, @Query('end') end: string) {
    return this.transactionService.netCashFlow(start, end);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.transactionService.getById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.transactionService.delete(id);
  }
}
