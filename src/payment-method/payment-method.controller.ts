import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('record')
  async recordPayment(@Body() dto: any) {
    return this.paymentMethodService.recordPayment(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.paymentMethodService.getById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async list(@Request() req) {
    return this.paymentMethodService.list(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.paymentMethodService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.paymentMethodService.delete(id);
  }
}
