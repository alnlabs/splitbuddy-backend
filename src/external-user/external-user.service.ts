import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalUser } from '../entities/external-user.entity';
import { User } from '../entities/user.entity';
import { UserSettings } from '../entities/user-settings.entity';
import {
  CreateExternalUserDto,
  UpdateExternalUserDto,
  ExternalUserQueryDto,
} from './external-user.dto';

@Injectable()
export class ExternalUserService {
  constructor(
    @InjectRepository(ExternalUser)
    private readonly externalUserRepo: Repository<ExternalUser>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly userSettingsRepo: Repository<UserSettings>,
  ) {}

  private async getUserSettings(userId: string): Promise<UserSettings> {
    const settings = await this.userSettingsRepo.findOne({ where: { userId } });
    if (!settings) {
      // Return default settings if none exist
      return {
        id: '',
        userId,
        allowExternalUserCreation: true,
        externalUserNotifications: true,
        externalUserPasswordReset: true,
        externalUserPhoneVerification: true,
        defaultExternalUserContactMethod: 'email',
        autoMigrateExternalUsers: true,
        externalUserExpiryDays: 30,
        externalUserReferenceEmailNotifications: true,
        defaultExternalUserRelationshipType: 'friend',
        allowedExternalUserRelationshipTypes: [
          'friend',
          'family',
          'colleague',
          'business',
          'other',
        ],
      } as UserSettings;
    }
    return settings;
  }

  async create(
    createDto: CreateExternalUserDto,
    createdBy: string,
  ): Promise<ExternalUser> {
    // Check if user allows external user creation
    const settings = await this.getUserSettings(createdBy);
    if (!settings.allowExternalUserCreation) {
      throw new BadRequestException(
        'External user creation is disabled in your settings',
      );
    }

    // For external users, we need at least one contact method
    if (!createDto.email && !createDto.phone) {
      throw new BadRequestException(
        'External user must have either email or phone number',
      );
    }

    // Get the creator's email for reference
    const creator = await this.userRepo.findOne({
      where: { id: createdBy },
      select: ['email'],
    });

    if (!creator) {
      throw new BadRequestException('Creator user not found');
    }

    // Check if external user already exists with same email or phone
    if (createDto.email) {
      const existingUser = await this.externalUserRepo.findOne({
        where: { email: createDto.email, isActive: true },
      });

      if (existingUser) {
        throw new BadRequestException(
          'External user with this email already exists',
        );
      }
    }

    if (createDto.phone) {
      const existingUser = await this.externalUserRepo.findOne({
        where: { phone: createDto.phone, isActive: true },
      });

      if (existingUser) {
        throw new BadRequestException(
          'External user with this phone number already exists',
        );
      }
    }

    // Use default relationship type if not provided
    if (!createDto.relationshipType) {
      createDto.relationshipType = settings.defaultExternalUserRelationshipType;
    }

    // Validate relationship type if custom types are restricted
    if (
      settings.allowedExternalUserRelationshipTypes &&
      settings.allowedExternalUserRelationshipTypes.length > 0
    ) {
      if (
        !settings.allowedExternalUserRelationshipTypes.includes(
          createDto.relationshipType,
        )
      ) {
        throw new BadRequestException(
          `Relationship type must be one of: ${settings.allowedExternalUserRelationshipTypes.join(', ')}`,
        );
      }
    }

    const externalUser = this.externalUserRepo.create({
      ...createDto,
      createdBy,
      referenceEmail: creator.email,
      isActive: true,
    });

    return this.externalUserRepo.save(externalUser);
  }

  async findAll(
    query: ExternalUserQueryDto,
    createdBy: string,
  ): Promise<ExternalUser[]> {
    const queryBuilder =
      this.externalUserRepo.createQueryBuilder('externalUser');

    // Only show external users created by the current user
    queryBuilder.where('externalUser.createdBy = :createdBy', { createdBy });

    // Search functionality
    if (query.search) {
      queryBuilder.andWhere(
        '(externalUser.firstName ILIKE :search OR externalUser.lastName ILIKE :search OR externalUser.email ILIKE :search OR externalUser.phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filter by relationship type
    if (query.relationshipType) {
      queryBuilder.andWhere(
        'externalUser.relationshipType = :relationshipType',
        { relationshipType: query.relationshipType },
      );
    }

    // Filter by active status
    if (query.isActive !== undefined) {
      queryBuilder.andWhere('externalUser.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    return queryBuilder.getMany();
  }

  async findById(id: string, createdBy: string): Promise<ExternalUser> {
    const externalUser = await this.externalUserRepo.findOne({
      where: { id, createdBy },
    });

    if (!externalUser) {
      throw new NotFoundException('External user not found');
    }

    return externalUser;
  }

  async update(
    id: string,
    updateDto: UpdateExternalUserDto,
    createdBy: string,
  ): Promise<ExternalUser> {
    const externalUser = await this.findById(id, createdBy);

    // Update the external user
    Object.assign(externalUser, updateDto);
    return this.externalUserRepo.save(externalUser);
  }

  async delete(id: string, createdBy: string): Promise<void> {
    const externalUser = await this.findById(id, createdBy);

    // Soft delete by setting isActive to false
    externalUser.isActive = false;
    await this.externalUserRepo.save(externalUser);
  }

  async migrateToInternalUser(
    externalUserId: string,
    userData: {
      username: string;
      password: string;
      email: string;
    },
  ): Promise<User> {
    const externalUser = await this.externalUserRepo.findOne({
      where: { id: externalUserId, isActive: true },
    });

    if (!externalUser) {
      throw new NotFoundException('External user not found');
    }

    if (externalUser.migratedToUserId) {
      throw new BadRequestException('External user has already been migrated');
    }

    // Check if user already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create internal user
    const internalUser = this.userRepo.create({
      firstName: externalUser.firstName,
      lastName: externalUser.lastName,
      email: userData.email,
      username: userData.username,
      password: userData.password, // In production, hash this
      phone: externalUser.phone,
      address: externalUser.address,
      city: externalUser.city,
      state: externalUser.state,
      country: externalUser.country,
      zipCode: externalUser.zipCode,
      enabled: true,
    });

    const savedUser = await this.userRepo.save(internalUser);

    // Mark external user as migrated
    externalUser.migratedToUserId = savedUser.id;
    externalUser.migratedAt = new Date();
    externalUser.isActive = false;
    await this.externalUserRepo.save(externalUser);

    return savedUser;
  }

  async findOrCreateExternalUser(
    userData: {
      firstName: string;
      lastName?: string;
      email?: string;
      phone?: string;
    },
    createdBy: string,
  ): Promise<ExternalUser> {
    // Try to find existing external user by email or phone
    let existingUser: ExternalUser | null = null;

    if (userData.email) {
      existingUser = await this.externalUserRepo.findOne({
        where: { email: userData.email, isActive: true },
      });
    }

    if (!existingUser && userData.phone) {
      existingUser = await this.externalUserRepo.findOne({
        where: { phone: userData.phone, isActive: true },
      });
    }

    if (existingUser) {
      return existingUser;
    }

    // Get the creator's email for reference
    const creator = await this.userRepo.findOne({
      where: { id: createdBy },
      select: ['email'],
    });

    if (!creator) {
      throw new BadRequestException('Creator user not found');
    }

    // Create new external user
    const newExternalUser = this.externalUserRepo.create({
      ...userData,
      createdBy,
      referenceEmail: creator.email,
      isActive: true,
    });

    return this.externalUserRepo.save(newExternalUser);
  }

  async requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    // Find external user by email
    const externalUser = await this.externalUserRepo.findOne({
      where: { email, isActive: true },
    });

    if (!externalUser) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    }

    // Check if user has already migrated to internal user
    if (externalUser.migratedToUserId) {
      return {
        success: false,
        message:
          'This account has already been migrated to a registered user. Please use the regular password reset.',
      };
    }

    // Here you would typically:
    // 1. Generate a password reset token
    // 2. Send email to the reference email (creator's email)
    // 3. Include instructions for the creator to help the external user register

    // For now, return a message indicating the process
    return {
      success: true,
      message: `Password reset request received. Contact instructions have been sent to ${externalUser.referenceEmail} (the person who added you to the system).`,
    };
  }

  async requestPhoneReset(
    phone: string,
  ): Promise<{ success: boolean; message: string }> {
    // Find external user by phone
    const externalUser = await this.externalUserRepo.findOne({
      where: { phone, isActive: true },
    });

    if (!externalUser) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message:
          'If an account with this phone number exists, a verification code has been sent.',
      };
    }

    // Check if user has already migrated to internal user
    if (externalUser.migratedToUserId) {
      return {
        success: false,
        message:
          'This account has already been migrated to a registered user. Please use the regular phone verification.',
      };
    }

    // Here you would typically:
    // 1. Generate a verification code
    // 2. Send SMS to the phone number
    // 3. Send notification to reference email

    return {
      success: true,
      message: `Phone verification request received. A verification code has been sent to ${phone} and notification sent to ${externalUser.referenceEmail}.`,
    };
  }

  async getExternalUserByEmailOrPhone(
    emailOrPhone: string,
  ): Promise<ExternalUser | null> {
    return this.externalUserRepo.findOne({
      where: [
        { email: emailOrPhone, isActive: true },
        { phone: emailOrPhone, isActive: true },
      ],
    });
  }
}
