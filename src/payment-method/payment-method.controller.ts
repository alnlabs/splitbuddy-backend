import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

class CreatePaymentMethodDto {
  @ApiProperty({ description: 'Payment method name' }) name: string;
  @ApiProperty({ required: false, description: 'Author ID' }) authorId?: string;
}

class UpdatePaymentMethodDto {
  @ApiProperty({ required: false, description: 'Payment method name' }) name?: string;
}

class RecordPaymentDto {
  @ApiProperty({ description: 'Payment method ID' }) paymentMethodId: string;
  @ApiProperty({ description: 'Payment amount' }) amount: number;
  @ApiProperty({ description: 'Payer ID' }) payerId: string;
  @ApiProperty({ description: 'Payee ID' }) payeeId: string;
  @ApiProperty({ description: 'Group ID' }) groupId: string;
  @ApiProperty({ required: false, description: 'Payment description' }) description?: string;
}

@ApiTags('Payment Methods')
@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({ status: 201, description: 'Payment method created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('record')
  @ApiOperation({ summary: 'Record a payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async recordPayment(@Body() dto: RecordPaymentDto) {
    return this.paymentMethodService.recordPayment(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({ status: 200, description: 'Payment method retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(@Param('id') id: string) {
    return this.paymentMethodService.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'List all payment methods' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list() {
    return this.paymentMethodService.list();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ summary: 'Update payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({ status: 200, description: 'Payment method updated successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.paymentMethodService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID' })
  @ApiResponse({ status: 200, description: 'Payment method deleted successfully' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string) {
    return this.paymentMethodService.delete(id);
  }
}
