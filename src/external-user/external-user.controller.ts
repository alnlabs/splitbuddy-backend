import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExternalUserService } from './external-user.service';
import {
  CreateExternalUserDto,
  UpdateExternalUserDto,
  ExternalUserQueryDto,
} from './external-user.dto';

@ApiTags('External Users')
@Controller('external-users')
export class ExternalUserController {
  constructor(private readonly externalUserService: ExternalUserService) {}

  @Post()
  @ApiOperation({ summary: 'Create an external user' })
  @ApiResponse({
    status: 201,
    description: 'External user created successfully',
  })
  async create(@Body() dto: CreateExternalUserDto, @Req() req: any) {
    const userId = req.user?.id || (req.headers['x-user-id'] as string);
    return this.externalUserService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all external users created by current user' })
  @ApiResponse({
    status: 200,
    description: 'External users retrieved successfully',
  })
  async findAll(@Query() query: ExternalUserQueryDto, @Req() req: any) {
    const userId = req.user?.id || (req.headers['x-user-id'] as string);
    return this.externalUserService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get external user by ID' })
  @ApiResponse({
    status: 200,
    description: 'External user retrieved successfully',
  })
  async findById(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || (req.headers['x-user-id'] as string);
    return this.externalUserService.findById(id, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update external user' })
  @ApiResponse({
    status: 200,
    description: 'External user updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExternalUserDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || (req.headers['x-user-id'] as string);
    return this.externalUserService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete external user (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'External user deleted successfully',
  })
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || (req.headers['x-user-id'] as string);
    return this.externalUserService.delete(id, userId);
  }

  @Post(':id/migrate')
  @ApiOperation({ summary: 'Migrate external user to internal user' })
  @ApiResponse({
    status: 201,
    description: 'External user migrated successfully',
  })
  async migrateToInternalUser(
    @Param('id') id: string,
    @Body() userData: { username: string; password: string; email: string },
  ) {
    return this.externalUserService.migrateToInternalUser(id, userData);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset for external user' })
  @ApiResponse({
    status: 200,
    description: 'Password reset request processed',
  })
  async requestPasswordReset(@Body() body: { email: string }) {
    return this.externalUserService.requestPasswordReset(body.email);
  }

  @Post('reset-phone')
  @ApiOperation({ summary: 'Request phone verification for external user' })
  @ApiResponse({
    status: 200,
    description: 'Phone verification request processed',
  })
  async requestPhoneReset(@Body() body: { phone: string }) {
    return this.externalUserService.requestPhoneReset(body.phone);
  }

  @Get('lookup/:emailOrPhone')
  @ApiOperation({ summary: 'Look up external user by email or phone' })
  @ApiResponse({
    status: 200,
    description: 'External user found',
  })
  async getExternalUserByEmailOrPhone(
    @Param('emailOrPhone') emailOrPhone: string,
  ) {
    const user =
      await this.externalUserService.getExternalUserByEmailOrPhone(
        emailOrPhone,
      );
    if (!user) {
      return { found: false };
    }
    return {
      found: true,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      referenceEmail: user.referenceEmail,
      migrated: !!user.migratedToUserId,
    };
  }
}
