import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { env } from '../config/env.config';

@Injectable()
export class NotificationService {
  private readonly hasRedis: boolean;

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {
    this.hasRedis = !!(env.redis.host && env.redis.port);
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    if (this.hasRedis) {
      await this.emailQueue.add('send-email', {
        to,
        subject,
        text,
        html,
        smtp: {
          host: env.smtp.host,
          port: env.smtp.port,
          user: env.smtp.user,
          pass: env.smtp.pass,
          from: env.smtp.from,
        },
      });
    } else {
      // Fallback: log the email instead of queuing
      console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Text: ${text}`);
    }
  }

  async sendInApp(userId: string, message: string): Promise<void> {
    if (this.hasRedis) {
      await this.notificationQueue.add('send-notification', {
        userId,
        message,
      });
    } else {
      // Fallback: save directly to database
      await this.notificationRepo.save({
        recipient: userId,
        type: 'in-app',
        content: message,
        status: 'SENT',
      });
    }
  }

  async listNotifications(recipient?: string, type?: string) {
    const where: any = {};
    if (recipient) where.recipient = recipient;
    if (type) where.type = type;
    return this.notificationRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: string) {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) throw new Error('Notification not found');
    notification.status = 'READ';
    return this.notificationRepo.save(notification);
  }

  async processSendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    // This would be implemented in the processor
    console.log(`Sending email to ${to}: ${subject}`);
    return { success: true };
  }

  async processSendInApp(userId: string, content: string) {
    return this.notificationRepo.save({
      recipient: userId,
      type: 'in-app',
      content,
      status: 'SENT',
    });
  }
}
