import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  Min,
  MaxLength,
} from 'class-validator';
import {
  ApiResponse,
  PaginatedResponse,
} from '../common/dto/base-response.dto';

/**
 * Create Expense Request DTO
 */
export class CreateExpenseDto {
  @ApiProperty({
    description: 'Group ID where expense belongs',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  groupId: string;

  @ApiProperty({
    description: 'Expense amount in cents',
    example: 2500,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Category ID for the expense',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Payment method ID used',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  paymentMethodId: string;

  @ApiProperty({
    description: 'Expense description',
    example: 'Dinner at Italian restaurant',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Date of the expense',
    example: '2024-01-15T18:30:00.000Z',
  })
  @IsDate()
  date: Date;

  @ApiProperty({
    description: 'User ID who added the expense',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  addedBy: string;

  @ApiProperty({
    description: 'Author ID of the expense',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  authorId: string;
}

/**
 * Update Expense Request DTO
 */
export class UpdateExpenseDto {
  @ApiProperty({
    description: 'Updated expense amount in cents',
    example: 3000,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiProperty({
    description: 'Updated category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Updated payment method ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiProperty({
    description: 'Updated expense description',
    example: 'Updated dinner description',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Updated expense date',
    example: '2024-01-16T18:30:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  date?: Date;
}

/**
 * Split Expense Request DTO
 */
export class SplitExpenseDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        email: { type: 'string', description: 'User email' },
        fullName: { type: 'string', description: 'User full name' },
        amount: { type: 'number', description: 'Split amount' },
        shareType: {
          type: 'string',
          description: 'Type of share (equal, percentage, fixed)',
        },
        percentage: { type: 'number', description: 'Percentage share' },
        notes: { type: 'string', description: 'Additional notes' },
      },
    },
    description: 'Array of expense splits',
  })
  splits: Array<{
    userId?: string;
    email?: string;
    fullName?: string;
    amount: number;
    shareType?: string;
    percentage?: number;
    notes?: string;
  }>;
}

/**
 * Bulk Create Expense Request DTO
 */
export class BulkCreateExpenseDto {
  @ApiProperty({
    type: [CreateExpenseDto],
    description: 'Array of expenses to create',
  })
  expenses: CreateExpenseDto[];
}

/**
 * Expense Response DTO
 */
export class ExpenseResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique expense identifier',
  })
  id: string;

  @ApiProperty({
    example: 2500,
    description: 'Expense amount in cents',
  })
  amount: number;

  @ApiProperty({
    example: 'Dinner at Italian restaurant',
    description: 'Expense description',
  })
  description: string;

  @ApiProperty({
    example: '2024-01-15T18:30:00.000Z',
    description: 'Date when the expense occurred',
  })
  date: Date;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Food & Dining',
    },
    description: 'Category information',
  })
  category: {
    id: string;
    name: string;
  };

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Credit Card',
    },
    description: 'Payment method information',
  })
  paymentMethod: {
    id: string;
    name: string;
  };

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Friends Trip',
    },
    description: 'Group information',
  })
  group: {
    id: string;
    name: string;
  };

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
    },
    description: 'User who added the expense',
  })
  addedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({
    example: '2024-01-15T18:30:00.000Z',
    description: 'When the expense was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T18:30:00.000Z',
    description: 'When the expense was last updated',
  })
  updatedAt: Date;
}

/**
 * Expense Split Response DTO
 */
export class ExpenseSplitResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique split identifier',
  })
  id: string;

  @ApiProperty({
    example: 1250,
    description: 'Split amount in cents',
  })
  amount: number;

  @ApiProperty({
    example: 'equal',
    description: 'Type of split (equal, percentage, fixed)',
  })
  shareType: string;

  @ApiProperty({
    example: 50,
    description: 'Percentage share if applicable',
  })
  percentage?: number;

  @ApiProperty({
    example: 'Split for dinner',
    description: 'Additional notes for the split',
  })
  notes?: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    description: 'User information for this split',
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    example: '2024-01-15T18:30:00.000Z',
    description: 'When the split was created',
  })
  createdAt: Date;
}

/**
 * User Balance Response DTO
 */
export class UserBalanceResponseDto {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    description: 'User information',
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({
    example: 1500,
    description: 'Total amount owed by this user',
  })
  totalOwed: number;

  @ApiProperty({
    example: 800,
    description: 'Total amount owed to this user',
  })
  totalOwedTo: number;

  @ApiProperty({
    example: 700,
    description:
      'Net balance (positive means they owe, negative means they are owed)',
  })
  netBalance: number;

  @ApiProperty({
    type: [ExpenseResponseDto],
    description: 'List of expenses contributing to this balance',
  })
  expenses: ExpenseResponseDto[];
}

/**
 * Group Balance Response DTO
 */
export class GroupBalanceResponseDto {
  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Friends Trip',
    },
    description: 'Group information',
  })
  group: {
    id: string;
    name: string;
  };

  @ApiProperty({
    example: 5000,
    description: 'Total expenses in the group',
  })
  totalExpenses: number;

  @ApiProperty({
    type: [UserBalanceResponseDto],
    description: 'Balance information for each group member',
  })
  memberBalances: UserBalanceResponseDto[];
}

/**
 * API Response Types
 */
export class CreateExpenseResponseDto extends ApiResponse<ExpenseResponseDto> {}
export class GetExpenseResponseDto extends ApiResponse<ExpenseResponseDto> {}
export class UpdateExpenseResponseDto extends ApiResponse<ExpenseResponseDto> {}
export class ListExpensesResponseDto extends ApiResponse<
  PaginatedResponse<ExpenseResponseDto>
> {}
export class ListExpenseSplitsResponseDto extends ApiResponse<
  ExpenseSplitResponseDto[]
> {}
export class UserBalancesResponseDto extends ApiResponse<
  UserBalanceResponseDto[]
> {}
export class GroupBalancesResponseDto extends ApiResponse<GroupBalanceResponseDto> {}
export class BulkCreateExpenseResponseDto extends ApiResponse<
  ExpenseResponseDto[]
> {}
export class BulkUpdateExpenseResponseDto extends ApiResponse<
  ExpenseResponseDto[]
> {}
export class BulkDeleteExpenseResponseDto extends ApiResponse<{
  deletedCount: number;
}> {}
export class DeleteExpenseResponseDto extends ApiResponse<{
  deleted: boolean;
}> {}
export class SettleSplitResponseDto extends ApiResponse<{ settled: boolean }> {}
export class RemindUnsettledResponseDto extends ApiResponse<{
  remindedCount: number;
}> {}
