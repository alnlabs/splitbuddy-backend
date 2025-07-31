import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { ApiProperty } from '@nestjs/swagger';

class CreatePaymentMethodDto {
  @ApiProperty() name: string;
  @ApiProperty({ required: false }) authorId?: string;
}

class UpdatePaymentMethodDto {
  @ApiProperty({ required: false }) name?: string;
}

@Controller('payment-method')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  async create(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(dto);
  }

  @Post('record')
  async recordPayment(@Body() dto: any) {
    return this.paymentMethodService.recordPayment(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.paymentMethodService.getById(id);
  }

  @Get()
  async list() {
    return this.paymentMethodService.list();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.paymentMethodService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.paymentMethodService.delete(id);
  }
}
