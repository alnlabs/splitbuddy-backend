import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationService } from './notification.service';

@Processor('notification')
export class NotificationProcessor {
  constructor(private readonly notificationService: NotificationService) {}

  @Process('send-notification')
  async handleSendInApp(job: Job) {
    const { userId, message } = job.data;
    return this.notificationService.processSendInApp(userId, message);
  }
}
