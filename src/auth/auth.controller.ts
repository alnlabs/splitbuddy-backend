import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

interface UserRequest extends ExpressRequest {
  user: {
    userId: string;
    username: string;
  };
}

class RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  facebookProfileUrl?: string;
  twitterProfileUrl?: string;
  linkedinProfileUrl?: string;
  githubProfileUrl?: string;
  websiteUrl?: string;
}

class LoginDto {
  username: string;
  password: string;
}

class UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  facebookProfileUrl?: string;
  twitterProfileUrl?: string;
  linkedinProfileUrl?: string;
  githubProfileUrl?: string;
  websiteUrl?: string;
  email?: string;
}

class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class RequestPasswordResetDto {
  email: string;
}

class ResetPasswordDto {
  token: string;
  newPassword: string;
}

class RequestEmailVerificationDto {
  email: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: UserRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  async updateProfile(
    @Request() req: UserRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  async changePassword(
    @Request() req: UserRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('request-email-verification')
  async requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.requestEmailVerification(dto.email);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
}
