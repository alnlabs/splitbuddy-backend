import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChitFund } from '../entities/chit-fund.entity';
import { CreateChitFundDto, UpdateChitFundDto } from './chit-fund.dto';

@Injectable()
export class ChitFundService {
  constructor(
    @InjectRepository(ChitFund)
    private readonly chitFundRepository: Repository<ChitFund>,
  ) {}

  create(dto: CreateChitFundDto) {
    const chit = this.chitFundRepository.create(dto);
    return this.chitFundRepository.save(chit);
  }

  findAll() {
    return this.chitFundRepository.find();
  }

  findOne(id: string) {
    return this.chitFundRepository.findOne({ where: { id } });
  }

  update(id: string, dto: UpdateChitFundDto) {
    return this.chitFundRepository.update(id, dto);
  }

  remove(id: string) {
    return this.chitFundRepository.delete(id);
  }
}
