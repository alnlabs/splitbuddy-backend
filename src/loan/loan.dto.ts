import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsDateString, IsBoolean, IsArray, Min, Max } from 'class-validator';
import { LoanType, LoanStatus, InterestType } from '../entities/loan.entity';
import { PaymentType } from '../entities/loan-payment.entity';

export class CreateLoanDto {
  @IsEnum(LoanType)
  loanType: LoanType;

  @IsUUID()
  lenderId: string;

  @IsUUID()
  borrowerId: string;

  @IsNumber()
  @Min(0.01)
  principalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @IsOptional()
  @IsEnum(InterestType)
  interestType?: InterestType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurringFrequency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  recurringAmount?: number;

  @IsOptional()
  @IsDateString()
  nextPaymentDate?: string;

  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  reminderDays?: number;

  @IsOptional()
  @IsString()
  collateralDescription?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  collateralValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lateFeeRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateLoanDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  principalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @IsOptional()
  @IsEnum(InterestType)
  interestType?: InterestType;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurringFrequency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  recurringAmount?: number;

  @IsOptional()
  @IsDateString()
  nextPaymentDate?: string;

  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  reminderDays?: number;

  @IsOptional()
  @IsString()
  collateralDescription?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  collateralValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lateFeeRate?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class CreateLoanPaymentDto {
  @IsUUID()
  loanId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  principalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class UpdateLoanPaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  principalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class LoanQueryDto {
  @IsOptional()
  @IsEnum(LoanType)
  loanType?: LoanType;

  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @IsOptional()
  @IsUUID()
  lenderId?: string;

  @IsOptional()
  @IsUUID()
  borrowerId?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class LoanPaymentQueryDto {
  @IsOptional()
  @IsUUID()
  loanId?: string;

  @IsOptional()
  @IsEnum(PaymentType)
  paymentType?: PaymentType;

  @IsOptional()
  @IsUUID()
  payerId?: string;

  @IsOptional()
  @IsUUID()
  payeeId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class LoanSummaryDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  groupId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
