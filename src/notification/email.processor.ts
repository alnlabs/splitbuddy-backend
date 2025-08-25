import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationService } from './notification.service';

@Processor('email')
export class EmailProcessor {
  constructor(private readonly notificationService: NotificationService) {}

  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { to, subject, text, html } = job.data;
    return this.notificationService.processSendEmail({ to, subject, text, html });
  }
}
