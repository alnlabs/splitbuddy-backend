import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiProperty } from '@nestjs/swagger';

class SendEmailDto {
  @ApiProperty() to: string;
  @ApiProperty() subject: string;
  @ApiProperty() text: string;
  @ApiProperty({ required: false }) html?: string;
}

class SendInAppDto {
  @ApiProperty() userId: string;
  @ApiProperty() content: string;
}

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send-email')
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.notificationService.sendEmail(
      dto.to,
      dto.subject,
      dto.text,
      dto.html,
    );
    return { message: 'Email sent', result };
  }

  @Post('send-inapp')
  async sendInApp(@Body() dto: SendInAppDto) {
    const result = await this.notificationService.sendInApp(
      dto.userId,
      dto.content,
    );
    return { message: 'In-app notification sent', result };
  }

  @Get('list')
  async list(
    @Query('recipient') recipient?: string,
    @Query('type') type?: string,
  ) {
    const notifications = await this.notificationService.listNotifications(
      recipient,
      type,
    );
    return { notifications };
  }

  @Patch('mark-read/:id')
  async markAsRead(@Param('id') id: string) {
    const result = await this.notificationService.markAsRead(id);
    return { message: 'Notification marked as read', result };
  }
}
