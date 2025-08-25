# API Documentation Enhancement Plan

## 🎯 Overview

This plan outlines the comprehensive enhancement of API documentation for the SplitBuddy backend, including detailed request/response models, examples, validation rules, and improved structure.

## 📋 Current State Analysis

### **Issues Identified:**

1. **Basic DTOs**: Simple class definitions without proper validation
2. **Missing Response Models**: No detailed response schemas
3. **No Examples**: No request/response examples
4. **Limited Validation**: Basic @ApiProperty without validation rules
5. **No Error Models**: Generic error responses
6. **Missing Pagination**: No pagination documentation
7. **Incomplete Endpoints**: Some endpoints lack proper documentation

## 🚀 Enhancement Strategy

### **Phase 1: Core Infrastructure**

1. **Create Base DTOs**: Common request/response patterns
2. **Response Models**: Standardized response structures
3. **Error Models**: Comprehensive error handling
4. **Validation Decorators**: Enhanced validation rules

### **Phase 2: Controller Enhancements**

1. **Enhanced DTOs**: Detailed request models with validation
2. **Response Schemas**: Complete response documentation
3. **Examples**: Real-world request/response examples
4. **Error Documentation**: Specific error scenarios

### **Phase 3: Advanced Features**

1. **Pagination**: Standardized pagination responses
2. **Filtering**: Query parameter documentation
3. **Sorting**: Sort options documentation
4. **Bulk Operations**: Batch processing documentation

## 📝 Implementation Plan

### **1. Base Infrastructure**

#### **Common Response Models**

```typescript
// Base response structure
class ApiResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  error?: string;
}

// Pagination response
class PaginatedResponse<T> {
  @ApiProperty()
  items: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
```

#### **Error Response Models**

```typescript
class ValidationError {
  @ApiProperty()
  field: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  value: any;
}

class ApiError {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  errors?: ValidationError[];

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;
}
```

### **2. Enhanced DTOs**

#### **Authentication DTOs**

```typescript
class RegisterRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'SecurePass123!',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;
}

class LoginRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!'
  })
  @IsString()
  password: string;
}

class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  token: string;

  @ApiProperty({
    description: 'User profile information'
  })
  userProfile: {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @ApiProperty({ example: 'John' })
    firstName: string;

    @ApiProperty({ example: 'Doe' })
    lastName: string;

    @ApiProperty({ example: 'john.doe' })
    username: string;
  };
}
```

#### **Expense DTOs**

```typescript
class CreateExpenseRequestDto {
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

class ExpenseResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 2500 })
  amount: number;

  @ApiProperty({ example: 'Dinner at Italian restaurant' })
  description: string;

  @ApiProperty({ example: '2024-01-15T18:30:00.000Z' })
  date: Date;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Food & Dining',
    },
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
  })
  addedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({ example: '2024-01-15T18:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T18:30:00.000Z' })
  updatedAt: Date;
}
```

### **3. Enhanced Controller Documentation**

#### **Example: Enhanced Auth Controller**

```typescript
@Post('register')
@ApiOperation({
  summary: 'Register a new user',
  description: 'Creates a new user account with email verification. The user will receive a verification email.'
})
@ApiBody({
  type: RegisterRequestDto,
  description: 'User registration information',
  examples: {
    example1: {
      summary: 'Basic Registration',
      description: 'Register with required fields only',
      value: {
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    example2: {
      summary: 'Complete Registration',
      description: 'Register with all available fields',
      value: {
        email: 'jane.smith@example.com',
        password: 'SecurePass123!',
        firstName: 'Jane',
        lastName: 'Smith'
      }
    }
  }
})
@ApiResponse({
  status: 201,
  description: 'User registered successfully',
  type: AuthResponseDto,
  examples: {
    success: {
      summary: 'Registration Success',
      value: {
        success: true,
        data: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          userProfile: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            username: 'john.doe'
          }
        },
        message: 'User registered successfully. Please check your email for verification.'
      }
    }
  }
})
@ApiResponse({
  status: 400,
  description: 'Bad request - Validation error or user already exists',
  type: ApiError,
  examples: {
    validationError: {
      summary: 'Validation Error',
      value: {
        statusCode: 400,
        message: 'Validation failed',
        errors: [
          {
            field: 'email',
            message: 'email must be an email',
            value: 'invalid-email'
          },
          {
            field: 'password',
            message: 'password is too weak',
            value: 'weak'
          }
        ],
        timestamp: '2024-01-15T18:30:00.000Z',
        path: '/api/v1/auth/register'
      }
    },
    userExists: {
      summary: 'User Already Exists',
      value: {
        statusCode: 400,
        message: 'User already exists',
        timestamp: '2024-01-15T18:30:00.000Z',
        path: '/api/v1/auth/register'
      }
    }
  }
})
@ApiResponse({
  status: 500,
  description: 'Internal server error',
  type: ApiError
})
async register(@Body() dto: RegisterRequestDto) {
  return this.authService.register(dto);
}
```

### **4. Pagination and Filtering**

#### **Pagination DTOs**

```typescript
class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
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
    required: false,
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
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

class ExpenseFilterDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Filter by group ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty({
    description: 'Filter by category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Filter by date range (start date)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter by date range (end date)',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by minimum amount (in cents)',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiProperty({
    description: 'Filter by maximum amount (in cents)',
    example: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;
}
```

### **5. Bulk Operations**

#### **Bulk Expense Operations**

```typescript
class BulkCreateExpenseRequestDto {
  @ApiProperty({
    description: 'Array of expenses to create',
    type: [CreateExpenseRequestDto],
    example: [
      {
        groupId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 2500,
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        paymentMethodId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Dinner',
        date: '2024-01-15T18:30:00.000Z',
        addedBy: '123e4567-e89b-12d3-a456-426614174000',
        authorId: '123e4567-e89b-12d3-a456-426614174000',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseRequestDto)
  expenses: CreateExpenseRequestDto[];
}

class BulkOperationResponseDto {
  @ApiProperty({
    description: 'Number of successful operations',
    example: 5,
  })
  successCount: number;

  @ApiProperty({
    description: 'Number of failed operations',
    example: 1,
  })
  failureCount: number;

  @ApiProperty({
    description: 'Array of successfully created items',
    type: [ExpenseResponseDto],
  })
  successful: ExpenseResponseDto[];

  @ApiProperty({
    description: 'Array of failed operations with errors',
    type: [
      {
        index: { type: 'number', example: 2 },
        error: { type: 'string', example: 'Validation failed' },
        data: { type: 'object' },
      },
    ],
  })
  failed: Array<{
    index: number;
    error: string;
    data: any;
  }>;
}
```

## 📊 Implementation Checklist

### **Phase 1: Infrastructure (Week 1)**

- [ ] Create base response models (ApiResponse, PaginatedResponse)
- [ ] Create error response models (ApiError, ValidationError)
- [ ] Create common DTOs (PaginationQueryDto, FilterDto)
- [ ] Set up validation decorators and pipes
- [ ] Create utility functions for response formatting

### **Phase 2: Authentication Module (Week 2)**

- [ ] Enhanced RegisterRequestDto with validation
- [ ] Enhanced LoginRequestDto with validation
- [ ] Enhanced UpdateProfileDto with validation
- [ ] Create AuthResponseDto
- [ ] Add comprehensive examples and error responses
- [ ] Update auth controller with enhanced documentation

### **Phase 3: Core Modules (Week 3-4)**

- [ ] Expense module enhancements
- [ ] Group module enhancements
- [ ] Category module enhancements
- [ ] Payment method module enhancements
- [ ] User settings module enhancements

### **Phase 4: Advanced Features (Week 5)**

- [ ] Pagination implementation
- [ ] Filtering and sorting
- [ ] Bulk operations
- [ ] Search functionality
- [ ] Advanced query parameters

### **Phase 5: Testing and Validation (Week 6)**

- [ ] Test all enhanced endpoints
- [ ] Validate documentation accuracy
- [ ] Update Swagger configuration
- [ ] Create API documentation guide
- [ ] Performance testing

## 🎯 Expected Outcomes

### **Enhanced Developer Experience**

- ✅ **Clear Request/Response Models**: Detailed schemas with examples
- ✅ **Comprehensive Validation**: Input validation with clear error messages
- ✅ **Real-world Examples**: Practical request/response examples
- ✅ **Error Handling**: Specific error scenarios and solutions

### **Improved API Quality**

- ✅ **Consistent Response Format**: Standardized response structure
- ✅ **Better Error Messages**: Descriptive error responses
- ✅ **Input Validation**: Robust validation rules
- ✅ **Documentation Accuracy**: Up-to-date and accurate docs

### **Enhanced Features**

- ✅ **Pagination Support**: Standardized pagination responses
- ✅ **Filtering Options**: Flexible query parameters
- ✅ **Bulk Operations**: Efficient batch processing
- ✅ **Search Functionality**: Advanced search capabilities

## 📚 Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Class Validator Documentation](https://github.com/typestack/class-validator)
- [Class Transformer Documentation](https://github.com/typestack/class-transformer)
