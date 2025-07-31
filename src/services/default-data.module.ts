import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultDataService } from './default-data.service';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Category } from '../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, Category])],
  providers: [DefaultDataService],
  exports: [DefaultDataService],
})
export class DefaultDataModule {}
