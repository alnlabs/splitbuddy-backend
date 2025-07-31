import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationService } from './notification.service';

@Processor('notification-queue')
export class NotificationProcessor {
  constructor(private readonly notificationService: NotificationService) {}

  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { to, subject, text, html } = job.data;
    return this.notificationService.processSendEmail(to, subject, text, html);
  }

  @Process('send-inapp')
  async handleSendInApp(job: Job) {
    const { userId, content } = job.data;
    return this.notificationService.processSendInApp(userId, content);
  }
}
