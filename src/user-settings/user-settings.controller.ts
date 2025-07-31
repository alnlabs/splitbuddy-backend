import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

class UpdateUserSettingsDto {
  @ApiProperty({ required: false, description: 'Theme preference' }) theme?: string;
  @ApiProperty({ required: false, description: 'Language preference' }) language?: string;
  @ApiProperty({ required: false, description: 'Currency preference' }) currency?: string;
  @ApiProperty({ required: false, description: 'Email notifications enabled' }) emailNotifications?: boolean;
  @ApiProperty({ required: false, description: 'Push notifications enabled' }) pushNotifications?: boolean;
  @ApiProperty({ required: false, description: 'In-app notifications enabled' }) inAppNotifications?: boolean;
  @ApiProperty({ required: false, description: 'Reminders enabled' }) reminders?: boolean;
  @ApiProperty({ required: false, description: 'Default group ID' }) defaultGroupId?: string;
  @ApiProperty({ required: false, description: 'Default category ID' }) defaultCategoryId?: string;
  @ApiProperty({ required: false, description: 'Default payment method ID' }) defaultPaymentMethodId?: string;
  @ApiProperty({ required: false, description: 'Two-factor authentication enabled' }) twoFactorAuth?: boolean;
  @ApiProperty({ required: false, description: 'Login alerts enabled' }) loginAlerts?: boolean;
  @ApiProperty({ required: false, description: 'Biometric login enabled' }) biometricLogin?: boolean;
  @ApiProperty({ required: false, description: 'Offline mode enabled' }) offlineMode?: boolean;
  @ApiProperty({ required: false, description: 'Cloud sync enabled' }) cloudSync?: boolean;
  @ApiProperty({ required: false, description: 'Export data enabled' }) exportData?: boolean;
}

@ApiTags('User Settings')
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':userId')
  @ApiOperation({ summary: 'Get user settings by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User settings not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getByUserId(@Param('userId') userId: string) {
    return this.userSettingsService.getByUserId(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':userId')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User settings updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('userId') userId: string, @Body() dto: UpdateUserSettingsDto) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }
}
