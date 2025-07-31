import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { env } from '../config/env.config';

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
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
  }

  async sendInApp(userId: number, message: string): Promise<void> {
    await this.notificationQueue.add('send-notification', {
      userId,
      message,
    });
  }
}
