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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {
  RegisterRequestDto,
  LoginRequestDto,
  UpdateProfileRequestDto,
  ChangePasswordRequestDto,
  RequestPasswordResetRequestDto,
  ResetPasswordRequestDto,
  RequestEmailVerificationRequestDto,
  GoogleAuthRequestDto,
} from './dto';
import {
  RegisterResponseDto,
  LoginResponseDto,
  ProfileResponseDto,
  ProfileUpdateResponseDto,
  PasswordChangeResponseDto,
  PasswordResetRequestResponseDto,
  PasswordResetResponseDto,
  EmailVerificationRequestResponseDto,
  EmailVerificationResponseDto,
  GoogleAuthResponseDto,
  GoogleTokenVerificationResponseDto,
  LogoutResponseDto,
} from './dto';
import { ApiError } from '../common/dto';

interface UserRequest extends ExpressRequest {
  user: {
    userId: string;
    username: string;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email verification. The user will receive a verification email.'
  })
  @ApiBody({
    type: RegisterRequestDto,
    description: 'User registration information',
    examples: {
      example1: {
        summary: 'Basic Registration',
        description: 'Register with required fields only',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe'
        }
      },
      example2: {
        summary: 'Complete Registration',
        description: 'Register with all available fields',
        value: {
          email: 'jane.smith@example.com',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Smith'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
    examples: {
      success: {
        summary: 'Registration Success',
        value: {
          success: true,
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            tokenType: 'Bearer',
            expiresIn: 3600,
            userProfile: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              emailVerified: false,
              status: 'pending',
              createdAt: '2024-01-15T18:30:00.000Z',
              updatedAt: '2024-01-15T18:30:00.000Z'
            }
          },
          message: 'User registered successfully. Please check your email for verification.'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation error or user already exists',
    type: ApiError,
    examples: {
      validationError: {
        summary: 'Validation Error',
        value: {
          statusCode: 400,
          message: 'Validation failed',
          errors: [
            {
              field: 'email',
              message: 'Please provide a valid email address',
              value: 'invalid-email'
            },
            {
              field: 'password',
              message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
              value: 'weak'
            }
          ],
          timestamp: '2024-01-15T18:30:00.000Z',
          path: '/api/v1/auth/register',
          errorCode: 'VALIDATION_ERROR'
        }
      },
      userExists: {
        summary: 'User Already Exists',
        value: {
          statusCode: 400,
          message: 'User already exists',
          timestamp: '2024-01-15T18:30:00.000Z',
          path: '/api/v1/auth/register',
          errorCode: 'USER_EXISTS'
        }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiError
  })
  async register(@Body() dto: RegisterRequestDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticates a user with email and password, returning a JWT token for API access.'
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Standard Login',
        description: 'Login with email and password',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
    examples: {
      success: {
        summary: 'Login Success',
        value: {
          success: true,
          data: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            tokenType: 'Bearer',
            expiresIn: 3600,
            userProfile: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe',
              username: 'john.doe',
              emailVerified: true,
              status: 'active',
              createdAt: '2024-01-15T18:30:00.000Z',
              updatedAt: '2024-01-15T18:30:00.000Z',
              lastLoginAt: '2024-01-15T18:30:00.000Z'
            }
          },
          message: 'Login successful'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
    type: ApiError,
    examples: {
      invalidCredentials: {
        summary: 'Invalid Credentials',
        value: {
          statusCode: 401,
          message: 'Invalid email or password',
          timestamp: '2024-01-15T18:30:00.000Z',
          path: '/api/v1/auth/login',
          errorCode: 'INVALID_CREDENTIALS'
        }
      },
      emailNotVerified: {
        summary: 'Email Not Verified',
        value: {
          statusCode: 401,
          message: 'Please verify your email before logging in',
          timestamp: '2024-01-15T18:30:00.000Z',
          path: '/api/v1/auth/login',
          errorCode: 'EMAIL_NOT_VERIFIED'
        }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiError
  })
  async login(@Body() dto: LoginRequestDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the current user\'s profile information. Requires JWT authentication.'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
    examples: {
      success: {
        summary: 'Profile Retrieved',
        value: {
          success: true,
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Michael',
            username: 'john.doe',
            phone: '+1234567890',
            dateOfBirth: '1990-01-15',
            gender: 'male',
            nationality: 'American',
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            country: 'United States',
            zipCode: '10001',
            facebookProfileUrl: 'https://facebook.com/john.doe',
            twitterProfileUrl: 'https://twitter.com/johndoe',
            linkedinProfileUrl: 'https://linkedin.com/in/johndoe',
            githubProfileUrl: 'https://github.com/johndoe',
            websiteUrl: 'https://johndoe.com',
            emailVerified: true,
            status: 'active',
            profilePicture: 'https://example.com/avatar.jpg',
            createdAt: '2024-01-15T18:30:00.000Z',
            updatedAt: '2024-01-15T18:30:00.000Z',
            lastLoginAt: '2024-01-15T18:30:00.000Z'
          },
          message: 'Profile retrieved successfully'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ApiError
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ApiError
  })
  async getProfile(@Request() req: UserRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates the current user\'s profile information. Only provided fields will be updated.'
  })
  @ApiBody({
    type: UpdateProfileRequestDto,
    description: 'Profile information to update',
    examples: {
      example1: {
        summary: 'Update Basic Info',
        description: 'Update basic profile information',
        value: {
          firstName: 'John',
          lastName: 'Smith',
          phone: '+1234567890'
        }
      },
      example2: {
        summary: 'Update Address',
        description: 'Update address information',
        value: {
          address: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          country: 'United States',
          zipCode: '90210'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileUpdateResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation error',
    type: ApiError
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ApiError
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ApiError
  })
  async updateProfile(
    @Request() req: UserRequest,
    @Body() dto: UpdateProfileRequestDto,
  ) {
    return this.authService.updateProfile(req.user.userId, dto);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change user password',
    description: 'Changes the current user\'s password. Requires current password verification.'
  })
  @ApiBody({
    type: ChangePasswordRequestDto,
    description: 'Password change information',
    examples: {
      example1: {
        summary: 'Change Password',
        description: 'Change password with current and new password',
        value: {
          currentPassword: 'CurrentPass123!',
          newPassword: 'NewSecurePass123!'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: PasswordChangeResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid current password or validation error',
    type: ApiError
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ApiError
  })
  async changePassword(
    @Request() req: UserRequest,
    @Body() dto: ChangePasswordRequestDto,
  ) {
    return this.authService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('request-password-reset')
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Sends a password reset email to the provided email address if the user exists.'
  })
  @ApiBody({
    type: RequestPasswordResetRequestDto,
    description: 'Email address for password reset',
    examples: {
      example1: {
        summary: 'Request Reset',
        description: 'Request password reset for email',
        value: {
          email: 'john.doe@example.com'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if user exists',
    type: PasswordResetRequestResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid email format',
    type: ApiError
  })
  async requestPasswordReset(@Body() dto: RequestPasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password with token',
    description: 'Resets the user password using a valid reset token received via email.'
  })
  @ApiBody({
    type: ResetPasswordRequestDto,
    description: 'Password reset information',
    examples: {
      example1: {
        summary: 'Reset Password',
        description: 'Reset password with token and new password',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          newPassword: 'NewSecurePass123!'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: PasswordResetResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid token or validation error',
    type: ApiError
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
    type: ApiError
  })
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('request-email-verification')
  @ApiOperation({
    summary: 'Request email verification',
    description: 'Sends a verification email to the provided email address if the user exists and is not verified.'
  })
  @ApiBody({
    type: RequestEmailVerificationRequestDto,
    description: 'Email address to verify',
    examples: {
      example1: {
        summary: 'Request Verification',
        description: 'Request email verification',
        value: {
          email: 'john.doe@example.com'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent',
    type: EmailVerificationRequestResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User not found or already verified',
    type: ApiError
  })
  async requestEmailVerification(@Body() dto: RequestEmailVerificationRequestDto) {
    return this.authService.requestEmailVerification(dto.email);
  }

  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify email with token',
    description: 'Verifies the user email using a valid verification token received via email.'
  })
  @ApiQuery({
    name: 'token',
    description: 'Email verification token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: EmailVerificationResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
    type: ApiError
  })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('google/login')
  @ApiOperation({
    summary: 'Login with Google OAuth',
    description: 'Authenticates a user using Google OAuth or Firebase ID token. Supports both Google OAuth and Firebase Authentication.'
  })
  @ApiBody({
    type: GoogleAuthRequestDto,
    description: 'Google ID token or Firebase ID token',
    examples: {
      example1: {
        summary: 'Google OAuth Token',
        description: 'Login with Google OAuth ID token',
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...'
        }
      },
      example2: {
        summary: 'Firebase ID Token',
        description: 'Login with Firebase ID token',
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
    type: GoogleAuthResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid Google token',
    type: ApiError
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiError
  })
  async googleLogin(@Body() dto: GoogleAuthRequestDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('google/signup')
  @ApiOperation({
    summary: 'Signup with Google OAuth',
    description: 'Creates a new user account using Google OAuth or Firebase ID token. Supports both Google OAuth and Firebase Authentication.'
  })
  @ApiBody({
    type: GoogleAuthRequestDto,
    description: 'Google ID token or Firebase ID token',
    examples: {
      example1: {
        summary: 'Google OAuth Token',
        description: 'Signup with Google OAuth ID token',
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...'
        }
      },
      example2: {
        summary: 'Firebase ID Token',
        description: 'Signup with Firebase ID token',
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Google signup successful',
    type: GoogleAuthResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already exists',
    type: ApiError
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid Google token',
    type: ApiError
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ApiError
  })
  async googleSignup(@Body() dto: GoogleAuthRequestDto) {
    return this.authService.googleSignup(dto);
  }

  @Post('google/verify')
  @ApiOperation({
    summary: 'Verify Google ID token',
    description: 'Verifies a Google OAuth or Firebase ID token and returns user information from the token.'
  })
  @ApiBody({
    type: GoogleAuthRequestDto,
    description: 'Google ID token or Firebase ID token to verify',
    examples: {
      example1: {
        summary: 'Verify Token',
        description: 'Verify Google or Firebase ID token',
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Token verified successfully',
    type: GoogleTokenVerificationResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token',
    type: ApiError
  })
  async googleVerify(@Body() dto: GoogleAuthRequestDto) {
    return this.authService.googleVerify(dto.idToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the current user by invalidating the JWT token.'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ApiError
  })
  async logout(@Request() req: UserRequest) {
    return this.authService.logout(req.user.userId);
  }
}
