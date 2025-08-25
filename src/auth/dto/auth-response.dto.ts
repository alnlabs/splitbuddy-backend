import { ApiProperty } from '@nestjs/swagger';

/**
 * User Profile Response DTO
 * Detailed user profile information returned by API
 */
export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    description: 'User middle name',
    example: 'Michael',
    required: false
  })
  middleName?: string;

  @ApiProperty({
    description: 'User username (generated from email)',
    example: 'john.doe'
  })
  username: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'User date of birth',
    example: '1990-01-15',
    required: false
  })
  dateOfBirth?: string;

  @ApiProperty({
    description: 'User gender',
    example: 'male',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: false
  })
  gender?: string;

  @ApiProperty({
    description: 'User nationality',
    example: 'American',
    required: false
  })
  nationality?: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main Street',
    required: false
  })
  address?: string;

  @ApiProperty({
    description: 'User city',
    example: 'New York',
    required: false
  })
  city?: string;

  @ApiProperty({
    description: 'User state/province',
    example: 'NY',
    required: false
  })
  state?: string;

  @ApiProperty({
    description: 'User country',
    example: 'United States',
    required: false
  })
  country?: string;

  @ApiProperty({
    description: 'User zip/postal code',
    example: '10001',
    required: false
  })
  zipCode?: string;

  @ApiProperty({
    description: 'Facebook profile URL',
    example: 'https://facebook.com/john.doe',
    required: false
  })
  facebookProfileUrl?: string;

  @ApiProperty({
    description: 'Twitter profile URL',
    example: 'https://twitter.com/johndoe',
    required: false
  })
  twitterProfileUrl?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
    required: false
  })
  linkedinProfileUrl?: string;

  @ApiProperty({
    description: 'GitHub profile URL',
    example: 'https://github.com/johndoe',
    required: false
  })
  githubProfileUrl?: string;

  @ApiProperty({
    description: 'Personal website URL',
    example: 'https://johndoe.com',
    required: false
  })
  websiteUrl?: string;

  @ApiProperty({
    description: 'Whether the user email is verified',
    example: true
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'User account status',
    example: 'active',
    enum: ['active', 'inactive', 'suspended', 'pending']
  })
  status: string;

  @ApiProperty({
    description: 'User profile picture URL',
    example: 'https://example.com/avatar.jpg',
    required: false
  })
  profilePicture?: string;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2024-01-15T18:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2024-01-15T18:30:00.000Z'
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Date when the user last logged in',
    example: '2024-01-15T18:30:00.000Z',
    required: false
  })
  lastLoginAt?: Date;
}

/**
 * Authentication Response DTO
 * Response structure for login and registration endpoints
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token for API authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  })
  token: string;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer'
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Refresh token for getting new access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'User profile information'
  })
  userProfile: UserProfileResponseDto;
}

/**
 * Login Response DTO
 * Specific response for login endpoint
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Indicates if the login was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Authentication data including token and user profile'
  })
  data: AuthResponseDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Login successful'
  })
  message: string;
}

/**
 * Registration Response DTO
 * Specific response for registration endpoint
 */
export class RegisterResponseDto {
  @ApiProperty({
    description: 'Indicates if the registration was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Authentication data including token and user profile'
  })
  data: AuthResponseDto;

  @ApiProperty({
    description: 'Success message with additional instructions',
    example: 'User registered successfully. Please check your email for verification.'
  })
  message: string;
}

/**
 * Profile Response DTO
 * Response for profile retrieval endpoint
 */
export class ProfileResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'User profile information'
  })
  data: UserProfileResponseDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Profile retrieved successfully'
  })
  message: string;
}

/**
 * Profile Update Response DTO
 * Response for profile update endpoint
 */
export class ProfileUpdateResponseDto {
  @ApiProperty({
    description: 'Indicates if the update was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Updated user profile information'
  })
  data: UserProfileResponseDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Profile updated successfully'
  })
  message: string;
}

/**
 * Password Change Response DTO
 * Response for password change endpoint
 */
export class PasswordChangeResponseDto {
  @ApiProperty({
    description: 'Indicates if the password change was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Password changed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the password was changed',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;
}

/**
 * Password Reset Request Response DTO
 * Response for password reset request endpoint
 */
export class PasswordResetRequestResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Password reset email sent if user exists'
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the request was processed',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;
}

/**
 * Password Reset Response DTO
 * Response for password reset endpoint
 */
export class PasswordResetResponseDto {
  @ApiProperty({
    description: 'Indicates if the password reset was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Password reset successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the password was reset',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;
}

/**
 * Email Verification Request Response DTO
 * Response for email verification request endpoint
 */
export class EmailVerificationRequestResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Verification email sent'
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the request was processed',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;
}

/**
 * Email Verification Response DTO
 * Response for email verification endpoint
 */
export class EmailVerificationResponseDto {
  @ApiProperty({
    description: 'Indicates if the verification was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the email was verified',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;
}

/**
 * Google Authentication Response DTO
 * Response for Google OAuth endpoints
 */
export class GoogleAuthResponseDto {
  @ApiProperty({
    description: 'Indicates if the authentication was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Authentication data including token and user profile'
  })
  data: AuthResponseDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Google authentication successful'
  })
  message: string;

  @ApiProperty({
    description: 'Authentication method used',
    example: 'google_oauth',
    enum: ['google_oauth', 'firebase']
  })
  authMethod: string;
}

/**
 * Google Token Verification Data DTO
 * Nested data structure for token verification response
 */
export class GoogleTokenVerificationDataDto {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true
  })
  valid: boolean;

  @ApiProperty({
    description: 'User information from the token',
    example: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      picture: 'https://example.com/avatar.jpg'
    },
    required: false
  })
  userInfo?: {
    email: string;
    name: string;
    picture?: string;
  };
}

/**
 * Google Token Verification Response DTO
 * Response for Google token verification endpoint
 */
export class GoogleTokenVerificationResponseDto {
  @ApiProperty({
    description: 'Indicates if the token verification was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Token verification data'
  })
  data: GoogleTokenVerificationDataDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Token verified successfully'
  })
  message: string;
}

/**
 * Logout Response DTO
 * Response for logout endpoint
 */
export class LogoutResponseDto {
  @ApiProperty({
    description: 'Indicates if the logout was successful',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Success message',
    example: 'Logout successful'
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the logout occurred',
    example: '2024-01-15T18:30:00.000Z'
  })
  timestamp: string;
}
