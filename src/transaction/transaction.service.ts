import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async create(dto: any, userId?: string) {
    // Business rules
    if (dto.amount == null || dto.amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (dto.type === 'loan_given' || dto.type === 'loan_taken') {
      if (!dto.counterparty)
        throw new Error('Counterparty is required for loans');
      // Optionally require interestRate
    }
    if (dto.type === 'chit_investment' && !dto.groupId) {
      throw new Error('groupId is required for chitti investments');
    }
    if ((dto.type === 'gold' || dto.type === 'asset_loan') && !dto.assetType) {
      throw new Error('assetType is required for gold/asset loans');
    }
    // Permission: Only group members can add to group
    if (dto.groupId && userId) {
      // TODO: Check if userId is a member of groupId (requires GroupMemberService)
    }
    // Set owner
    if (userId) dto.userId = userId;
    const transaction = this.transactionRepo.create(dto);
    await this.transactionRepo.save(transaction);
    return transaction;
  }

  async getById(id: string) {
    return this.transactionRepo.findOne({ where: { id } });
  }

  async list(type?: string, groupId?: string) {
    const where: any = {};
    if (type) where.type = type;
    if (groupId) where.groupId = groupId;
    return this.transactionRepo.find({ where, order: { date: 'DESC' } });
  }

  async update(id: string, dto: any, userId?: string) {
    // Permission: Only owner can update
    const existing = await this.getById(id);
    if (userId && existing && existing.userId && existing.userId !== userId) {
      throw new Error('You do not have permission to update this transaction');
    }
    // Business rules (same as create)
    if (dto.amount != null && dto.amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (
      (dto.type === 'loan_given' || dto.type === 'loan_taken') &&
      !dto.counterparty
    ) {
      throw new Error('Counterparty is required for loans');
    }
    if (dto.type === 'chit_investment' && !dto.groupId) {
      throw new Error('groupId is required for chitti investments');
    }
    if ((dto.type === 'gold' || dto.type === 'asset_loan') && !dto.assetType) {
      throw new Error('assetType is required for gold/asset loans');
    }
    await this.transactionRepo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string) {
    await this.transactionRepo.delete(id);
    return { deleted: true };
  }

  async summary(start: string, end: string) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.date >= :start', { start })
      .andWhere('t.date <= :end', { end })
      .groupBy('t.type');
    const results = await qb.getRawMany();
    let income = 0,
      expense = 0;
    for (const row of results) {
      if (row.type === 'income') income += Number(row.total);
      if (row.type === 'expense') expense += Number(row.total);
    }
    return { income, expense, net: income - expense, breakdown: results };
  }

  async loans(type: string, status?: string) {
    const validTypes: Transaction['type'][] = [
      'loan_given',
      'loan_taken',
      'income',
      'expense',
      'chit_investment',
      'gold',
      'asset_loan',
    ];
    if (!validTypes.includes(type as Transaction['type'])) {
      throw new Error('Invalid transaction type');
    }
    const where: Partial<Transaction> = { type: type as Transaction['type'] };
    if (status) where.status = status;
    // @ts-ignore
    return this.transactionRepo.find({ where, order: { date: 'DESC' } });
  }

  async chittiStatus(groupId: string) {
    return this.transactionRepo.find({
      where: { type: 'chit_investment', groupId },
      order: { date: 'DESC' },
    });
  }

  async assets(type: string) {
    return this.transactionRepo.find({
      where: { type: type as Transaction['type'] },
      order: { date: 'DESC' },
    });
  }

  async netCashFlow(start: string, end: string) {
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .select('t.type', 'type')
      .addSelect('SUM(t.amount)', 'total')
      .where('t.date >= :start', { start })
      .andWhere('t.date <= :end', { end })
      .groupBy('t.type');
    const results = await qb.getRawMany();
    let income = 0,
      expense = 0;
    for (const row of results) {
      if (row.type === 'income') income += Number(row.total);
      if (row.type === 'expense') expense += Number(row.total);
    }
    return { netCashFlow: income - expense, income, expense };
  }
}
