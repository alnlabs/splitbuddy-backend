import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsArray,
  Min,
  Max,
  IsEmail,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserReferenceDto {
  @IsOptional()
  @IsUUID()
  id?: string; // Internal user ID

  @IsOptional()
  @IsString()
  name?: string; // For creating external users

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ExternalUserReferenceDto {
  @IsOptional()
  @IsUUID()
  id?: string; // External user ID

  @IsOptional()
  @IsString()
  name?: string; // For creating new external users

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreateLoanDto {
  @IsEnum(['given', 'taken'])
  loanType: 'given' | 'taken';

  @IsOptional()
  @ValidateNested()
  @Type(() => UserReferenceDto)
  @IsObject()
  lender?: UserReferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserReferenceDto)
  @IsObject()
  borrower?: UserReferenceDto;

  @IsNumber()
  @Min(0.01)
  principalAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate?: number;

  @IsOptional()
  @IsEnum(['simple', 'compound', 'none'])
  interestType?: 'simple' | 'compound' | 'none';

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
  @IsEnum(['simple', 'compound', 'none'])
  interestType?: 'simple' | 'compound' | 'none';

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(['active', 'repaid', 'overdue', 'defaulted', 'cancelled'])
  status?: 'active' | 'repaid' | 'overdue' | 'defaulted' | 'cancelled';

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

  @IsEnum(['principal', 'interest', 'late_fee', 'partial'])
  paymentType: 'principal' | 'interest' | 'late_fee' | 'partial';

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
  @IsEnum(['principal', 'interest', 'late_fee', 'partial'])
  paymentType?: 'principal' | 'interest' | 'late_fee' | 'partial';

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
  @IsEnum(['given', 'taken'])
  loanType?: 'given' | 'taken';

  @IsOptional()
  @IsEnum(['active', 'repaid', 'overdue', 'defaulted', 'cancelled'])
  status?: 'active' | 'repaid' | 'overdue' | 'defaulted' | 'cancelled';

  @IsOptional()
  @ValidateNested()
  @Type(() => UserReferenceDto)
  lender?: UserReferenceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserReferenceDto)
  borrower?: UserReferenceDto;

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
  @IsEnum(['principal', 'interest', 'late_fee', 'partial'])
  paymentType?: 'principal' | 'interest' | 'late_fee' | 'partial';

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

  @IsOptional()
  @IsEnum(['given', 'taken'])
  loanType?: 'given' | 'taken';

  @IsOptional()
  @IsEnum(['active', 'repaid', 'overdue', 'defaulted', 'cancelled'])
  status?: 'active' | 'repaid' | 'overdue' | 'defaulted' | 'cancelled';
}
