import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' }) to: string;
  @ApiProperty({ description: 'Email subject' }) subject: string;
  @ApiProperty({ description: 'Email text content' }) text: string;
  @ApiProperty({ required: false, description: 'Email HTML content' }) html?: string;
}

class SendInAppDto {
  @ApiProperty({ description: 'User ID' }) userId: string;
  @ApiProperty({ description: 'Notification content' }) content: string;
}

@ApiTags('Notifications')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('send-email')
  @ApiOperation({ summary: 'Send email notification' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendEmail(@Body() dto: SendEmailDto) {
    const result = await this.notificationService.sendEmail(
      dto.to,
      dto.subject,
      dto.text,
      dto.html,
    );
    return { message: 'Email sent', result };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('send-inapp')
  @ApiOperation({ summary: 'Send in-app notification' })
  @ApiResponse({ status: 200, description: 'In-app notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendInApp(@Body() dto: SendInAppDto) {
    const result = await this.notificationService.sendInApp(
      dto.userId,
      dto.content,
    );
    return { message: 'In-app notification sent', result };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  @ApiOperation({ summary: 'List notifications with optional filters' })
  @ApiQuery({ name: 'recipient', required: false, description: 'Filter by recipient' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('mark-read/:id')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAsRead(@Param('id') id: string) {
    const result = await this.notificationService.markAsRead(id);
    return { message: 'Notification marked as read', result };
  }
}
