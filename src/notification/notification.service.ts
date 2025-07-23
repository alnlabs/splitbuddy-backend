import { Injectable, Inject, forwardRef } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
// @ts-ignore
const env = require('../../env.js');

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectQueue('notification-queue')
    private readonly notificationQueue: Queue,
  ) {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  // Public methods for other modules: enqueue jobs
  async sendEmail(to: string, subject: string, text: string, html?: string) {
    await this.notificationQueue.add('send-email', { to, subject, text, html });
    return { enqueued: true };
  }

  async sendInApp(userId: string, content: string) {
    await this.notificationQueue.add('send-inapp', { userId, content });
    return { enqueued: true };
  }

  // Internal methods for processor
  async processSendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ) {
    let status = 'SENT';
    let error = null;
    let result = null;
    try {
      result = await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        text,
        html,
      });
    } catch (err) {
      status = 'FAILED';
      error = err.message || String(err);
    }
    await this.notificationRepo.save({
      recipient: to,
      type: 'email',
      subject,
      content: html || text,
      status,
      error,
    });
    if (status === 'FAILED') throw new Error(error);
    return result;
  }

  async processSendInApp(userId: string, content: string) {
    return this.notificationRepo.save({
      recipient: userId,
      type: 'in-app',
      content,
      status: 'SENT',
    });
  }

  // ...listNotifications and markAsRead remain unchanged...
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
}
