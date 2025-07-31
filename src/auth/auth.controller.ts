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

interface UserRequest extends ExpressRequest {
  user: {
    userId: string;
    username: string;
  };
}

class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  email: string;
  @ApiProperty({ description: 'User password (min 6 characters)' })
  password: string;
  @ApiProperty({ description: 'User first name' })
  firstName: string;
  @ApiProperty({ required: false, description: 'User last name' })
  lastName?: string;
}

class LoginDto {
  @ApiProperty({ description: 'User email' })
  email: string;
  @ApiProperty({ description: 'User password' })
  password: string;
}

class UpdateProfileDto {
  @ApiProperty({ required: false, description: 'User first name' })
  firstName?: string;
  @ApiProperty({ required: false, description: 'User last name' })
  lastName?: string;
  @ApiProperty({ required: false, description: 'User phone number' })
  phone?: string;
  @ApiProperty({ required: false, description: 'User middle name' })
  middleName?: string;
  @ApiProperty({ required: false, description: 'User date of birth' })
  dateOfBirth?: string;
  @ApiProperty({ required: false, description: 'User gender' })
  gender?: string;
  @ApiProperty({ required: false, description: 'User nationality' })
  nationality?: string;
  @ApiProperty({ required: false, description: 'User address' })
  address?: string;
  @ApiProperty({ required: false, description: 'User city' })
  city?: string;
  @ApiProperty({ required: false, description: 'User state' })
  state?: string;
  @ApiProperty({ required: false, description: 'User country' })
  country?: string;
  @ApiProperty({ required: false, description: 'User zip code' })
  zipCode?: string;
  @ApiProperty({ required: false, description: 'Facebook profile URL' })
  facebookProfileUrl?: string;
  @ApiProperty({ required: false, description: 'Twitter profile URL' })
  twitterProfileUrl?: string;
  @ApiProperty({ required: false, description: 'LinkedIn profile URL' })
  linkedinProfileUrl?: string;
  @ApiProperty({ required: false, description: 'GitHub profile URL' })
  githubProfileUrl?: string;
  @ApiProperty({ required: false, description: 'Personal website URL' })
  websiteUrl?: string;
  @ApiProperty({ required: false, description: 'User email address' })
  email?: string;
}

class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  currentPassword: string;
  @ApiProperty({ description: 'New password (min 6 characters)' })
  newPassword: string;
}

class RequestPasswordResetDto {
  @ApiProperty({ description: 'Email address for password reset' })
  email: string;
}

class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token received via email' })
  token: string;
  @ApiProperty({ description: 'New password (min 6 characters)' })
  newPassword: string;
}

class RequestEmailVerificationDto {
  @ApiProperty({ description: 'Email address to verify' })
  email: string;
}

class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token' })
  idToken: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already exists',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: UserRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req: UserRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, dto);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid old password',
  })
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
  @ApiResponse({ status: 200, description: 'Reset email sent if user exists' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('request-email-verification')
  @ApiOperation({ summary: 'Request email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Bad request - User not found' })
  async requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.requestEmailVerification(dto.email);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('google/login')
  @ApiOperation({ summary: 'Login with Google OAuth' })
  @ApiResponse({ status: 200, description: 'Google login successful' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid Google token',
  })
  async googleLogin(@Body() dto: GoogleAuthDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('google/verify')
  @ApiOperation({ summary: 'Verify Google ID token' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  async googleVerify(@Body() dto: GoogleAuthDto) {
    return this.authService.googleVerify(dto.idToken);
  }
}
