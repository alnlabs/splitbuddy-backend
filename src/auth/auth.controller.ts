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
import {
  ApiProperty,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Username for the account' }) username: string;
  @ApiProperty({ description: 'Email address' }) email: string;
  @ApiProperty({ description: 'Password (min 6 characters)' }) password: string;
  @ApiProperty({ description: 'First name' }) firstName: string;
  @ApiProperty({ required: false, description: 'Last name' }) lastName?: string;
  @ApiProperty({ required: false, description: 'Phone number' }) phone?: string;
  @ApiProperty({ required: false, description: 'Middle name' })
  middleName?: string;
  @ApiProperty({ required: false, description: 'Date of birth' })
  dateOfBirth?: string;
  @ApiProperty({ required: false, description: 'Gender' }) gender?: string;
  @ApiProperty({ required: false, description: 'Nationality' })
  nationality?: string;
  @ApiProperty({ required: false, description: 'Address' }) address?: string;
  @ApiProperty({ required: false, description: 'City' }) city?: string;
  @ApiProperty({ required: false, description: 'State' }) state?: string;
  @ApiProperty({ required: false, description: 'Country' }) country?: string;
  @ApiProperty({ required: false, description: 'ZIP code' }) zipCode?: string;
  @ApiProperty({ required: false, description: 'Facebook profile URL' })
  facebookProfileUrl?: string;
  @ApiProperty({ required: false, description: 'Twitter profile URL' })
  twitterProfileUrl?: string;
  @ApiProperty({ required: false, description: 'LinkedIn profile URL' })
  linkedinProfileUrl?: string;
  @ApiProperty({ required: false, description: 'GitHub profile URL' })
  githubProfileUrl?: string;
  @ApiProperty({ required: false, description: 'Website URL' })
  websiteUrl?: string;
}

class LoginDto {
  @ApiProperty({ description: 'Username or email' }) username: string;
  @ApiProperty({ description: 'Password' }) password: string;
}

class UpdateProfileDto {
  @ApiProperty({ required: false, description: 'First name' })
  firstName?: string;
  @ApiProperty({ required: false, description: 'Last name' }) lastName?: string;
  @ApiProperty({ required: false, description: 'Phone number' }) phone?: string;
  @ApiProperty({ required: false, description: 'Middle name' })
  middleName?: string;
  @ApiProperty({ required: false, description: 'Date of birth' })
  dateOfBirth?: string;
  @ApiProperty({ required: false, description: 'Gender' }) gender?: string;
  @ApiProperty({ required: false, description: 'Nationality' })
  nationality?: string;
  @ApiProperty({ required: false, description: 'Address' }) address?: string;
  @ApiProperty({ required: false, description: 'City' }) city?: string;
  @ApiProperty({ required: false, description: 'State' }) state?: string;
  @ApiProperty({ required: false, description: 'Country' }) country?: string;
  @ApiProperty({ required: false, description: 'ZIP code' }) zipCode?: string;
  @ApiProperty({ required: false, description: 'Facebook profile URL' })
  facebookProfileUrl?: string;
  @ApiProperty({ required: false, description: 'Twitter profile URL' })
  twitterProfileUrl?: string;
  @ApiProperty({ required: false, description: 'LinkedIn profile URL' })
  linkedinProfileUrl?: string;
  @ApiProperty({ required: false, description: 'GitHub profile URL' })
  githubProfileUrl?: string;
  @ApiProperty({ required: false, description: 'Website URL' })
  websiteUrl?: string;
  @ApiProperty({ required: false, description: 'Email address' })
  email?: string;
}

class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' }) currentPassword: string;
  @ApiProperty({ description: 'New password (min 6 characters)' })
  newPassword: string;
}

class RequestPasswordResetDto {
  @ApiProperty({ description: 'Email address' }) email: string;
}

class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token from email' }) token: string;
  @ApiProperty({ description: 'New password (min 6 characters)' })
  newPassword: string;
}

class RequestEmailVerificationDto {
  @ApiProperty({ description: 'Email address' }) email: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: UserRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req: UserRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('request-email-verification')
  @ApiOperation({ summary: 'Request email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.requestEmailVerification(dto.email);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('google-signup')
  @ApiOperation({ summary: 'Sign up with Google' })
  @ApiResponse({ status: 201, description: 'User registered with Google' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async googleSignup(@Body() dto: GoogleSignupDto) {
    return this.authService.googleSignup(dto);
  }

  @Post('google-login')
  @ApiOperation({ summary: 'Login with Google' })
  @ApiResponse({ status: 200, description: 'Login with Google successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('google-verify')
  @ApiOperation({ summary: 'Verify Google token' })
  @ApiResponse({ status: 200, description: 'Google token verified' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async googleVerify(@Body() dto: GoogleVerifyDto) {
    return this.authService.googleVerify(dto.idToken);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: UserRequest) {
    return this.authService.logout(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('create-default-data')
  @ApiOperation({ summary: 'Create default data for user' })
  @ApiResponse({ status: 200, description: 'Default data created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDefaultData(@Request() req: UserRequest) {
    return this.authService.createDefaultData(req.user.userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('default-data-status')
  @ApiOperation({ summary: 'Check default data status' })
  @ApiResponse({ status: 200, description: 'Default data status retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkDefaultDataStatus(@Request() req: UserRequest) {
    return this.authService.checkDefaultDataStatus(req.user.userId);
  }
}
