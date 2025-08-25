import { Controller, Get, Patch, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserSettingsService } from './user-settings.service';
import {
  UpdateUserSettingsDto,
  ExternalUserSettingsDto,
  LoanSettingsDto,
  NotificationSettingsDto,
  SecuritySettingsDto,
  PrivacySettingsDto,
  AppPreferencesDto,
} from './user-settings.dto';

@ApiTags('User Settings')
@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get user settings by user ID' })
  @ApiResponse({
    status: 200,
    description: 'User settings retrieved successfully',
  })
  async getByUserId(@Param('userId') userId: string) {
    return this.userSettingsService.getByUserId(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings updated successfully',
  })
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }

  @Get(':userId/external-user-settings')
  @ApiOperation({ summary: 'Get external user settings for a user' })
  @ApiResponse({
    status: 200,
    description: 'External user settings retrieved successfully',
  })
  async getExternalUserSettings(@Param('userId') userId: string) {
    const settings = await this.userSettingsService.getByUserId(userId);
    return {
      allowExternalUserCreation: settings.allowExternalUserCreation,
      externalUserNotifications: settings.externalUserNotifications,
      externalUserPasswordReset: settings.externalUserPasswordReset,
      externalUserPhoneVerification: settings.externalUserPhoneVerification,
      defaultExternalUserContactMethod:
        settings.defaultExternalUserContactMethod,
      autoMigrateExternalUsers: settings.autoMigrateExternalUsers,
      externalUserExpiryDays: settings.externalUserExpiryDays,
      externalUserReferenceEmailNotifications:
        settings.externalUserReferenceEmailNotifications,
      defaultExternalUserRelationshipType:
        settings.defaultExternalUserRelationshipType,
      allowedExternalUserRelationshipTypes:
        settings.allowedExternalUserRelationshipTypes,
    };
  }

  @Patch(':userId/external-user-settings')
  @ApiOperation({ summary: 'Update external user settings' })
  @ApiResponse({
    status: 200,
    description: 'External user settings updated successfully',
  })
  async updateExternalUserSettings(
    @Param('userId') userId: string,
    @Body() dto: ExternalUserSettingsDto,
  ) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }

  @Get(':userId/loan-settings')
  @ApiOperation({ summary: 'Get loan settings for a user' })
  @ApiResponse({
    status: 200,
    description: 'Loan settings retrieved successfully',
  })
  async getLoanSettings(@Param('userId') userId: string) {
    return this.userSettingsService.getLoanSettings(userId);
  }

  @Patch(':userId/loan-settings')
  @ApiOperation({ summary: 'Update loan settings' })
  @ApiResponse({
    status: 200,
    description: 'Loan settings updated successfully',
  })
  async updateLoanSettings(
    @Param('userId') userId: string,
    @Body() dto: LoanSettingsDto,
  ) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }

  @Get(':userId/notification-settings')
  @ApiOperation({ summary: 'Get notification settings for a user' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
  })
  async getNotificationSettings(@Param('userId') userId: string) {
    return this.userSettingsService.getNotificationSettings(userId);
  }

  @Patch(':userId/notification-settings')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Notification settings updated successfully',
  })
  async updateNotificationSettings(
    @Param('userId') userId: string,
    @Body() dto: NotificationSettingsDto,
  ) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }

  @Get(':userId/security-settings')
  @ApiOperation({ summary: 'Get security settings for a user' })
  @ApiResponse({
    status: 200,
    description: 'Security settings retrieved successfully',
  })
  async getSecuritySettings(@Param('userId') userId: string) {
    return this.userSettingsService.getSecuritySettings(userId);
  }

  @Patch(':userId/security-settings')
  @ApiOperation({ summary: 'Update security settings' })
  @ApiResponse({
    status: 200,
    description: 'Security settings updated successfully',
  })
  async updateSecuritySettings(
    @Param('userId') userId: string,
    @Body() dto: SecuritySettingsDto,
  ) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }

  @Get(':userId/privacy-settings')
  @ApiOperation({ summary: 'Get privacy settings for a user' })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings retrieved successfully',
  })
  async getPrivacySettings(@Param('userId') userId: string) {
    return this.userSettingsService.getPrivacySettings(userId);
  }

  @Patch(':userId/privacy-settings')
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings updated successfully',
  })
  async updatePrivacySettings(
    @Param('userId') userId: string,
    @Body() dto: PrivacySettingsDto,
  ) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }

  @Get(':userId/app-preferences')
  @ApiOperation({ summary: 'Get app preferences for a user' })
  @ApiResponse({
    status: 200,
    description: 'App preferences retrieved successfully',
  })
  async getAppPreferences(@Param('userId') userId: string) {
    return this.userSettingsService.getAppPreferences(userId);
  }

  @Patch(':userId/app-preferences')
  @ApiOperation({ summary: 'Update app preferences' })
  @ApiResponse({
    status: 200,
    description: 'App preferences updated successfully',
  })
  async updateAppPreferences(
    @Param('userId') userId: string,
    @Body() dto: AppPreferencesDto,
  ) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }

  @Patch(':userId/reset-to-defaults')
  @ApiOperation({ summary: 'Reset user settings to defaults' })
  @ApiResponse({
    status: 200,
    description: 'User settings reset to defaults successfully',
  })
  async resetToDefaults(@Param('userId') userId: string) {
    return this.userSettingsService.resetToDefaults(userId);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete user settings' })
  @ApiResponse({
    status: 200,
    description: 'User settings deleted successfully',
  })
  async deleteSettings(@Param('userId') userId: string) {
    await this.userSettingsService.deleteSettings(userId);
    return { message: 'User settings deleted successfully' };
  }
}
