import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get(':userId')
  async getByUserId(@Param('userId') userId: string) {
    return this.userSettingsService.getByUserId(userId);
  }

  @Patch(':userId')
  async update(@Param('userId') userId: string, @Body() dto: any) {
    return this.userSettingsService.createOrUpdate(userId, dto);
  }
}
