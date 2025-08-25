import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsUUID,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';

/**
 * User Registration Request DTO
 * Enhanced with comprehensive validation and examples
 */
export class RegisterRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    minLength: 8
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  )
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50
  })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName?: string;
}

/**
 * User Login Request DTO
 * Enhanced with validation and examples
 */
export class LoginRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!'
  })
  @IsString({ message: 'Password must be a string' })
  password: string;
}

/**
 * User Profile Update Request DTO
 * Enhanced with comprehensive validation and examples
 */
export class UpdateProfileRequestDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName?: string;

  @ApiProperty({
    description: 'User middle name',
    example: 'Michael',
    required: false,
    minLength: 2,
    maxLength: 50
  })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string' })
  @MinLength(2, { message: 'Middle name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  middleName?: string;

  @ApiProperty({
    description: 'User phone number (international format)',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiProperty({
    description: 'User date of birth (ISO date string)',
    example: '1990-01-15',
    required: false
  })
  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date' })
  dateOfBirth?: string;

  @ApiProperty({
    description: 'User gender',
    example: 'male',
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: false
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'], {
    message: 'Gender must be one of: male, female, other, prefer_not_to_say'
  })
  gender?: string;

  @ApiProperty({
    description: 'User nationality',
    example: 'American',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'Nationality must be a string' })
  @MaxLength(100, { message: 'Nationality cannot exceed 100 characters' })
  nationality?: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main Street',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(255, { message: 'Address cannot exceed 255 characters' })
  address?: string;

  @ApiProperty({
    description: 'User city',
    example: 'New York',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string;

  @ApiProperty({
    description: 'User state/province',
    example: 'NY',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  state?: string;

  @ApiProperty({
    description: 'User country',
    example: 'United States',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country?: string;

  @ApiProperty({
    description: 'User zip/postal code',
    example: '10001',
    required: false,
    maxLength: 20
  })
  @IsOptional()
  @IsString({ message: 'Zip code must be a string' })
  @MaxLength(20, { message: 'Zip code cannot exceed 20 characters' })
  zipCode?: string;

  @ApiProperty({
    description: 'Facebook profile URL',
    example: 'https://facebook.com/john.doe',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'Facebook profile URL must be a string' })
  @MaxLength(255, { message: 'Facebook profile URL cannot exceed 255 characters' })
  @Matches(/^https?:\/\/(www\.)?facebook\.com\/.+/, {
    message: 'Please provide a valid Facebook profile URL'
  })
  facebookProfileUrl?: string;

  @ApiProperty({
    description: 'Twitter profile URL',
    example: 'https://twitter.com/johndoe',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'Twitter profile URL must be a string' })
  @MaxLength(255, { message: 'Twitter profile URL cannot exceed 255 characters' })
  @Matches(/^https?:\/\/(www\.)?twitter\.com\/.+/, {
    message: 'Please provide a valid Twitter profile URL'
  })
  twitterProfileUrl?: string;

  @ApiProperty({
    description: 'LinkedIn profile URL',
    example: 'https://linkedin.com/in/johndoe',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'LinkedIn profile URL must be a string' })
  @MaxLength(255, { message: 'LinkedIn profile URL cannot exceed 255 characters' })
  @Matches(/^https?:\/\/(www\.)?linkedin\.com\/in\/.+/, {
    message: 'Please provide a valid LinkedIn profile URL'
  })
  linkedinProfileUrl?: string;

  @ApiProperty({
    description: 'GitHub profile URL',
    example: 'https://github.com/johndoe',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'GitHub profile URL must be a string' })
  @MaxLength(255, { message: 'GitHub profile URL cannot exceed 255 characters' })
  @Matches(/^https?:\/\/(www\.)?github\.com\/.+/, {
    message: 'Please provide a valid GitHub profile URL'
  })
  githubProfileUrl?: string;

  @ApiProperty({
    description: 'Personal website URL',
    example: 'https://johndoe.com',
    required: false,
    maxLength: 255
  })
  @IsOptional()
  @IsString({ message: 'Website URL must be a string' })
  @MaxLength(255, { message: 'Website URL cannot exceed 255 characters' })
  @Matches(/^https?:\/\/.+/, {
    message: 'Please provide a valid website URL starting with http:// or https://'
  })
  websiteUrl?: string;

  @ApiProperty({
    description: 'User email address (for email change)',
    example: 'newemail@example.com',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
}

/**
 * Change Password Request DTO
 * Enhanced with validation and examples
 */
export class ChangePasswordRequestDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPass123!'
  })
  @IsString({ message: 'Current password must be a string' })
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'NewSecurePass123!',
    minLength: 8
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  )
  newPassword: string;
}

/**
 * Request Password Reset DTO
 * Enhanced with validation and examples
 */
export class RequestPasswordResetRequestDto {
  @ApiProperty({
    description: 'Email address for password reset',
    example: 'john.doe@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

/**
 * Reset Password Request DTO
 * Enhanced with validation and examples
 */
export class ResetPasswordRequestDto {
  @ApiProperty({
    description: 'Reset token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString({ message: 'Reset token must be a string' })
  token: string;

  @ApiProperty({
    description: 'New password (min 8 characters, must contain uppercase, lowercase, number, and special character)',
    example: 'NewSecurePass123!',
    minLength: 8
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  )
  newPassword: string;
}

/**
 * Request Email Verification DTO
 * Enhanced with validation and examples
 */
export class RequestEmailVerificationRequestDto {
  @ApiProperty({
    description: 'Email address to verify',
    example: 'john.doe@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

/**
 * Google Authentication DTO
 * Enhanced with validation and examples
 */
export class GoogleAuthRequestDto {
  @ApiProperty({
    description: 'Google ID token or Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...'
  })
  @IsString({ message: 'ID token must be a string' })
  idToken: string;
}
