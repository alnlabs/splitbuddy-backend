import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChitFund } from '../entities/chit-fund.entity';
import { ChitFundController } from './chit-fund.controller';
import { ChitFundService } from './chit-fund.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChitFund])],
  controllers: [ChitFundController],
  providers: [ChitFundService],
  exports: [ChitFundService],
})
export class ChitFundModule {}
