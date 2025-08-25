import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Payment } from '../entities/payment.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: any) {
    const paymentMethod = this.paymentMethodRepo.create(dto);
    await this.paymentMethodRepo.save(paymentMethod);
    return paymentMethod;
  }

  async getById(id: string) {
    return this.paymentMethodRepo.findOne({ where: { id } });
  }

  async list(userId?: string) {
    if (userId) {
      // Return user-specific payment methods
      return this.paymentMethodRepo.find({
        where: { authorId: userId },
        order: { name: 'ASC' },
      });
    } else {
      // Return all payment methods (for admin purposes)
      return this.paymentMethodRepo.find({ order: { name: 'ASC' } });
    }
  }

  async update(id: string, dto: any) {
    await this.paymentMethodRepo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string) {
    await this.paymentMethodRepo.delete(id);
    return { deleted: true };
  }

  async recordPayment(dto: any) {
    const payment = this.paymentRepo.create(dto);
    await this.paymentRepo.save(payment);
    // Notify payer and payee
    const content = `A payment of ${dto.amount} was recorded for group ${dto.groupId}.`;
    if (dto.payerId) {
      try {
        await this.notificationService.sendInApp(dto.payerId, content);
      } catch (error) {
        // Log error but don't fail the payment recording
        console.error('Failed to send notification to payer:', error);
      }
    }
    if (dto.payeeId) {
      try {
        await this.notificationService.sendInApp(dto.payeeId, content);
      } catch (error) {
        // Log error but don't fail the payment recording
        console.error('Failed to send notification to payee:', error);
      }
    }
    // Optionally, send emails if you have payer/payee emails
    return payment;
  }
}
