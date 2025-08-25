import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsUUID,
} from 'class-validator';

export class CreateGroupMemberDto {
  @ApiProperty({ description: 'The ID of the group this member belongs to' })
  @IsUUID()
  groupId: string;

  @ApiProperty({
    description: 'The ID of the user (optional for invited members)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'The email address of the group member' })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The full name of the group member',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'The status of the group member',
    enum: ['INVITED', 'ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'INVITED',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Whether the member is registered',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRegistered?: boolean;

  @ApiProperty({ description: 'When the member was invited', required: false })
  @IsOptional()
  @IsDate()
  invitedAt?: Date;

  @ApiProperty({
    description: 'When the member accepted the invitation',
    required: false,
  })
  @IsOptional()
  @IsDate()
  acceptedAt?: Date;
}

export class UpdateGroupMemberDto {
  @ApiProperty({
    description: 'The ID of the user (optional for invited members)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'The email address of the group member',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'The full name of the group member',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: 'The status of the group member',
    enum: ['INVITED', 'ACTIVE', 'INACTIVE', 'PENDING'],
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Whether the member is registered',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRegistered?: boolean;

  @ApiProperty({ description: 'When the member was invited', required: false })
  @IsOptional()
  @IsDate()
  invitedAt?: Date;

  @ApiProperty({
    description: 'When the member accepted the invitation',
    required: false,
  })
  @IsOptional()
  @IsDate()
  acceptedAt?: Date;
}

export class GroupMemberResponseDto {
  @ApiProperty({ description: 'The unique identifier of the group member' })
  id: string;

  @ApiProperty({ description: 'The ID of the group this member belongs to' })
  groupId: string;

  @ApiProperty({
    description: 'The ID of the user (null for invited members)',
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({ description: 'The email address of the group member' })
  email: string;

  @ApiProperty({
    description: 'The full name of the group member',
    nullable: true,
  })
  fullName: string | null;

  @ApiProperty({ description: 'The status of the group member' })
  status: string;

  @ApiProperty({ description: 'Whether the member is registered' })
  isRegistered: boolean;

  @ApiProperty({ description: 'When the member was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the member was invited', nullable: true })
  invitedAt: Date | null;

  @ApiProperty({
    description: 'When the member accepted the invitation',
    nullable: true,
  })
  acceptedAt: Date | null;
}
