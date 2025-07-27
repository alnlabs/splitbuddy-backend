import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ChitFundService } from '../chit-fund/chit-fund.service';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class PlansService {
  constructor(
    private chitFundService: ChitFundService,
    private transactionService: TransactionService,
  ) {}

  async getAllPlansForUser(userId: string) {
    console.log('getAllPlansForUser called with userId:', userId);
    const chits = (await this.chitFundService.findAll()).filter(
      (chit) => chit.members && chit.members.includes(userId),
    );
    console.log(
      'Found chits for user:',
      chits.length,
      chits.map((c) => ({ id: c.id, name: c.name, members: c.members })),
    );
    const transactions = await this.transactionService.list();
    const userTransactions = transactions.filter(
      (t) => t.userId === userId && t.type !== 'expense',
    );
    console.log('Found transactions for user:', userTransactions.length);
    const plans = [
      ...chits.map((chit) => ({ ...chit, type: 'chit' })),
      ...userTransactions.map((t) => ({ ...t, type: t.type })),
    ];
    console.log('Total plans returned:', plans.length);
    return plans;
  }

  async createPlan(body: any, userId: string) {
    if (!body.type) throw new BadRequestException('type is required');
    if (body.type === 'chit') {
      return this.chitFundService.create({
        ...body,
        members: body.members || [userId],
      });
    } else {
      return this.transactionService.create({ ...body }, userId);
    }
  }

  async getPlanById(id: string) {
    // Try chit fund first
    const chit = await this.chitFundService.findOne(id);
    if (chit) return { ...chit, type: 'chit' };
    // Try transaction
    const txn = await this.transactionService.getById(id);
    if (txn && txn.type !== 'expense') return { ...txn, type: txn.type };
    throw new NotFoundException('Plan not found');
  }

  async updatePlan(id: string, body: any, userId: string) {
    // Try chit fund first
    const chit = await this.chitFundService.findOne(id);
    if (chit) {
      await this.chitFundService.update(id, body);
      return this.chitFundService.findOne(id);
    }
    // Try transaction
    const txn = await this.transactionService.getById(id);
    if (txn && txn.type !== 'expense') {
      await this.transactionService.update(id, body, userId);
      return this.transactionService.getById(id);
    }
    throw new NotFoundException('Plan not found');
  }

  async deletePlan(id: string) {
    // Try chit fund first
    const chit = await this.chitFundService.findOne(id);
    if (chit) return this.chitFundService.remove(id);
    // Try transaction
    const txn = await this.transactionService.getById(id);
    if (txn && txn.type !== 'expense')
      return this.transactionService.delete(id);
    throw new NotFoundException('Plan not found');
  }
}
