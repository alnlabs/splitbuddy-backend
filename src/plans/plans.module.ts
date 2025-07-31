import { Module } from '@nestjs/common';
import { PlansController } from './plans.controller';
import { PlansService } from './plans.service';
import { ChitFundModule } from '../chit-fund/chit-fund.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [ChitFundModule, TransactionModule],
  controllers: [PlansController],
  providers: [PlansService],
})
export class PlansModule {}
