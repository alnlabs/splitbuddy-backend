import { ApiProperty } from '@nestjs/swagger';

/**
 * Base API Response Model
 * Standardized response structure for all API endpoints
 */
export class ApiResponse<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'The actual data returned by the API',
    example: {}
  })
  data: T;

  @ApiProperty({
    description: 'Optional message providing additional context',
    example: 'Operation completed successfully',
    required: false
  })
  message?: string;

  @ApiProperty({
    description: 'Optional error message if the request failed',
    example: 'Validation failed',
    required: false
  })
  error?: string;
}

/**
 * Pagination Response Model
 * Standardized pagination structure for list endpoints
 */
export class PaginatedResponse<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    example: []
  })
  items: T[];

  @ApiProperty({
    description: 'Total number of items across all pages',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Current page number (1-based)',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false
  })
  hasPrev: boolean;
}

/**
 * Validation Error Model
 * Detailed validation error information
 */
export class ValidationError {
  @ApiProperty({
    description: 'The field that failed validation',
    example: 'email'
  })
  field: string;

  @ApiProperty({
    description: 'The validation error message',
    example: 'email must be an email'
  })
  message: string;

  @ApiProperty({
    description: 'The value that failed validation',
    example: 'invalid-email'
  })
  value: any;

  @ApiProperty({
    description: 'The validation constraint that failed',
    example: 'isEmail',
    required: false
  })
  constraint?: string;
}

/**
 * API Error Response Model
 * Standardized error response structure
 */
export class ApiError {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Bad Request'
  })
  message: string;

  @ApiProperty({
    description: 'Detailed validation errors if applicable',
    type: [ValidationError],
    required: false
  })
  errors?: ValidationError[];

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path where the error occurred',
    example: '/api/v1/auth/register'
  })
  path: string;

  @ApiProperty({
    description: 'Error code for programmatic handling',
    example: 'VALIDATION_ERROR',
    required: false
  })
  errorCode?: string;
}

/**
 * Success Response Model
 * Standardized success response structure
 */
export class SuccessResponse {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the operation completed',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;
}

/**
 * Bulk Operation Response Model
 * Standardized response for bulk operations
 */
export class BulkOperationResponse<T> {
  @ApiProperty({
    description: 'Number of successful operations',
    example: 5
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of failed operations',
    example: 1
  })
  failureCount: number;

  @ApiProperty({
    description: 'Array of successfully processed items',
    example: []
  })
  successful: T[];

  @ApiProperty({
    description: 'Array of failed operations with error details',
    example: [
      {
        index: 2,
        error: 'Validation failed',
        data: { field: 'email', value: 'invalid' }
      }
    ]
  })
  failed: Array<{
    index: number;
    error: string;
    data: any;
  }>;

  @ApiProperty({
    description: 'Total number of operations attempted',
    example: 6
  })
  total: number;
}
