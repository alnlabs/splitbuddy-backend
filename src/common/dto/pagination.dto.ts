import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString, IsIn, IsUUID, IsDateString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Base Pagination Query DTO
 * Common pagination parameters for all list endpoints
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    required: false
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

/**
 * Date Range Filter DTO
 * Common date range filtering parameters
 */
export class DateRangeFilterDto {
  @ApiProperty({
    description: 'Filter by date range (start date)',
    example: '2024-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by date range (end date)',
    example: '2024-01-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * Amount Range Filter DTO
 * Common amount range filtering parameters
 */
export class AmountRangeFilterDto {
  @ApiProperty({
    description: 'Filter by minimum amount (in cents)',
    example: 1000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minAmount?: number;

  @ApiProperty({
    description: 'Filter by maximum amount (in cents)',
    example: 5000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxAmount?: number;
}

/**
 * Search Filter DTO
 * Common search parameters
 */
export class SearchFilterDto {
  @ApiProperty({
    description: 'Search term for text-based filtering',
    example: 'dinner',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Search in specific fields (comma-separated)',
    example: 'description,name',
    required: false
  })
  @IsOptional()
  @IsString()
  searchFields?: string;
}

/**
 * Status Filter DTO
 * Common status filtering parameters
 */
export class StatusFilterDto {
  @ApiProperty({
    description: 'Filter by status',
    example: 'active',
    enum: ['active', 'inactive', 'pending', 'completed', 'cancelled'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'pending', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({
    description: 'Filter by multiple statuses (comma-separated)',
    example: 'active,pending',
    required: false
  })
  @IsOptional()
  @IsString()
  statuses?: string;
}

/**
 * User Filter DTO
 * Common user-related filtering parameters
 */
export class UserFilterDto {
  @ApiProperty({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Filter by user email',
    example: 'user@example.com',
    required: false
  })
  @IsOptional()
  @IsString()
  userEmail?: string;
}

/**
 * Group Filter DTO
 * Common group-related filtering parameters
 */
export class GroupFilterDto {
  @ApiProperty({
    description: 'Filter by group ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty({
    description: 'Filter by group name',
    example: 'Friends Trip',
    required: false
  })
  @IsOptional()
  @IsString()
  groupName?: string;
}

/**
 * Category Filter DTO
 * Common category-related filtering parameters
 */
export class CategoryFilterDto {
  @ApiProperty({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by category name',
    example: 'Food & Dining',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryName?: string;
}

/**
 * Payment Method Filter DTO
 * Common payment method-related filtering parameters
 */
export class PaymentMethodFilterDto {
  @ApiProperty({
    description: 'Filter by payment method ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiProperty({
    description: 'Filter by payment method name',
    example: 'Credit Card',
    required: false
  })
  @IsOptional()
  @IsString()
  paymentMethodName?: string;
}

/**
 * Comprehensive Filter DTO
 * Combines all common filtering parameters
 */
export class ComprehensiveFilterDto extends PaginationQueryDto {
  // Date range filters
  @ApiProperty({
    description: 'Filter by date range (start date)',
    example: '2024-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by date range (end date)',
    example: '2024-01-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Amount range filters
  @ApiProperty({
    description: 'Filter by minimum amount (in cents)',
    example: 1000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minAmount?: number;

  @ApiProperty({
    description: 'Filter by maximum amount (in cents)',
    example: 5000,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxAmount?: number;

  // Search filters
  @ApiProperty({
    description: 'Search term for text-based filtering',
    example: 'dinner',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Search in specific fields (comma-separated)',
    example: 'description,name',
    required: false
  })
  @IsOptional()
  @IsString()
  searchFields?: string;

  // Status filters
  @ApiProperty({
    description: 'Filter by status',
    example: 'active',
    enum: ['active', 'inactive', 'pending', 'completed', 'cancelled'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'pending', 'completed', 'cancelled'])
  status?: string;

  @ApiProperty({
    description: 'Filter by multiple statuses (comma-separated)',
    example: 'active,pending',
    required: false
  })
  @IsOptional()
  @IsString()
  statuses?: string;

  // User filters
  @ApiProperty({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Filter by user email',
    example: 'user@example.com',
    required: false
  })
  @IsOptional()
  @IsString()
  userEmail?: string;

  // Group filters
  @ApiProperty({
    description: 'Filter by group ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty({
    description: 'Filter by group name',
    example: 'Friends Trip',
    required: false
  })
  @IsOptional()
  @IsString()
  groupName?: string;

  // Category filters
  @ApiProperty({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by category name',
    example: 'Food & Dining',
    required: false
  })
  @IsOptional()
  @IsString()
  categoryName?: string;

  // Payment method filters
  @ApiProperty({
    description: 'Filter by payment method ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false
  })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiProperty({
    description: 'Filter by payment method name',
    example: 'Credit Card',
    required: false
  })
  @IsOptional()
  @IsString()
  paymentMethodName?: string;
}
