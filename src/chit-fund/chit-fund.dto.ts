import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ChitFundType } from '../entities/chit-fund.entity';

export class CreateChitFundDto {
  @IsString()
  name: string;

  @IsEnum([
    'registered',
    'unregistered',
    'company',
    'government',
    'online',
    'auction',
    'lottery',
    'fixed',
  ])
  type: ChitFundType;

  @IsArray()
  members: string[];

  @IsNumber()
  amount: number;

  @IsNumber()
  duration: number;

  @IsNumber()
  monthlyContribution: number;

  @IsOptional()
  @IsString()
  biddingType?: 'auction' | 'lottery' | 'fixed';

  @IsOptional()
  @IsString()
  foreman?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsBoolean()
  isRegistered?: boolean;

  @IsOptional()
  @IsBoolean()
  isGovernment?: boolean;

  @IsOptional()
  @IsBoolean()
  isOnline?: boolean;

  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsNumber()
  commission?: number;

  @IsOptional()
  @IsArray()
  payoutOrder?: string[];

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateChitFundDto extends CreateChitFundDto {}
