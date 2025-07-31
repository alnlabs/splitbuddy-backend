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
import { ApiProperty } from '@nestjs/swagger';
import {
  GoogleSignupDto,
  GoogleLoginDto,
  GoogleVerifyDto,
} from './google-auth.dto';

interface UserRequest extends ExpressRequest {
  user: {
    userId: string;
    username: string;
  };
}

class RegisterDto {
  @ApiProperty() username: string;
  @ApiProperty() email: string;
  @ApiProperty() password: string;
  @ApiProperty() firstName: string;
  @ApiProperty({ required: false }) lastName?: string;
  @ApiProperty({ required: false }) phone?: string;
  @ApiProperty({ required: false }) middleName?: string;
  @ApiProperty({ required: false }) dateOfBirth?: string;
  @ApiProperty({ required: false }) gender?: string;
  @ApiProperty({ required: false }) nationality?: string;
  @ApiProperty({ required: false }) address?: string;
  @ApiProperty({ required: false }) city?: string;
  @ApiProperty({ required: false }) state?: string;
  @ApiProperty({ required: false }) country?: string;
  @ApiProperty({ required: false }) zipCode?: string;
  @ApiProperty({ required: false }) facebookProfileUrl?: string;
  @ApiProperty({ required: false }) twitterProfileUrl?: string;
  @ApiProperty({ required: false }) linkedinProfileUrl?: string;
  @ApiProperty({ required: false }) githubProfileUrl?: string;
  @ApiProperty({ required: false }) websiteUrl?: string;
}

class LoginDto {
  @ApiProperty() username: string;
  @ApiProperty() password: string;
}

class UpdateProfileDto {
  @ApiProperty({ required: false }) firstName?: string;
  @ApiProperty({ required: false }) lastName?: string;
  @ApiProperty({ required: false }) phone?: string;
  @ApiProperty({ required: false }) middleName?: string;
  @ApiProperty({ required: false }) dateOfBirth?: string;
  @ApiProperty({ required: false }) gender?: string;
  @ApiProperty({ required: false }) nationality?: string;
  @ApiProperty({ required: false }) address?: string;
  @ApiProperty({ required: false }) city?: string;
  @ApiProperty({ required: false }) state?: string;
  @ApiProperty({ required: false }) country?: string;
  @ApiProperty({ required: false }) zipCode?: string;
  @ApiProperty({ required: false }) facebookProfileUrl?: string;
  @ApiProperty({ required: false }) twitterProfileUrl?: string;
  @ApiProperty({ required: false }) linkedinProfileUrl?: string;
  @ApiProperty({ required: false }) githubProfileUrl?: string;
  @ApiProperty({ required: false }) websiteUrl?: string;
  @ApiProperty({ required: false }) email?: string;
}

class ChangePasswordDto {
  @ApiProperty() currentPassword: string;
  @ApiProperty() newPassword: string;
}

class RequestPasswordResetDto {
  @ApiProperty() email: string;
}

class ResetPasswordDto {
  @ApiProperty() token: string;
  @ApiProperty() newPassword: string;
}

class RequestEmailVerificationDto {
  @ApiProperty() email: string;
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

  @Post('google-signup')
  async googleSignup(@Body() dto: GoogleSignupDto) {
    console.log('[AuthController] /auth/google-signup called with dto:', dto);
    return this.authService.googleSignup(dto);
  }

  @Post('google-login')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('google-verify')
  async googleVerify(@Body() dto: GoogleVerifyDto) {
    console.log(
      '[AuthController] /auth/google-verify called with idToken:',
      dto.idToken ? dto.idToken.substring(0, 12) + '...' : 'undefined',
    );
    return this.authService.googleVerify(dto.idToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req: UserRequest) {
    return this.authService.logout(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('default-data/create')
  async createDefaultData(@Request() req: UserRequest) {
    return this.authService.createDefaultData(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('default-data/status')
  async checkDefaultDataStatus(@Request() req: UserRequest) {
    return this.authService.checkDefaultDataStatus(req.user.userId);
  }
}
