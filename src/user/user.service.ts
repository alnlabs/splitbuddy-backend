import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createDto: CreateUserDto): Promise<User> {
    // Determine if this is an internal or external user
    const isInternalUser = createDto.username && createDto.password;

    if (isInternalUser) {
      // Internal user - requires username, password, and email
      if (!createDto.email) {
        throw new BadRequestException(
          'Internal users must have an email address',
        );
      }

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: [{ email: createDto.email }, { username: createDto.username }],
      });

      if (existingUser) {
        throw new BadRequestException(
          'User with this email or username already exists',
        );
      }
    } else {
      // External user - requires at least one contact method
      if (!createDto.email && !createDto.phone) {
        throw new BadRequestException(
          'External user must have either email or phone number',
        );
      }

      // Check if external user already exists with same email or phone
      if (createDto.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: createDto.email },
        });

        if (existingUser) {
          throw new BadRequestException('User with this email already exists');
        }
      }

      if (createDto.phone) {
        const existingUser = await this.userRepository.findOne({
          where: { phone: createDto.phone },
        });

        if (existingUser) {
          throw new BadRequestException(
            'User with this phone number already exists',
          );
        }
      }

      // Generate a unique username for external users
      createDto.username = createDto.email || `external_${Date.now()}`;
    }

    const user = this.userRepository.create({
      ...createDto,
      enabled: true,
    });

    return this.userRepository.save(user);
  }

  async findAll(query: UserQueryDto): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Search functionality
    if (query.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filter by enabled status
    if (query.enabled !== undefined) {
      queryBuilder.andWhere('user.enabled = :enabled', {
        enabled: query.enabled,
      });
    }

    // Filter by user type (internal vs external)
    if (query.hasPassword === 'true') {
      queryBuilder.andWhere('user.password IS NOT NULL');
    } else if (query.hasPassword === 'false') {
      queryBuilder.andWhere('user.password IS NULL');
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // Update the user
    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findById(id);

    // Soft delete by setting enabled to false
    user.enabled = false;
    await this.userRepository.save(user);
  }

  async getUsers(fields?: string[]) {
    try {
      let query = this.userRepository.createQueryBuilder('user');

      if (fields && fields.length > 0) {
        // Only select specified fields
        const selectFields = fields.map((field) => `user.${field}`);
        query = query.select(selectFields);
      } else {
        // Select all fields except password
        query = query.select([
          'user.id',
          'user.email',
          'user.firstName',
          'user.lastName',
          'user.username',
          'user.phone',
          'user.middleName',
          'user.dateOfBirth',
          'user.gender',
          'user.nationality',
          'user.address',
          'user.city',
          'user.state',
          'user.country',
          'user.zipCode',
          'user.facebookProfileUrl',
          'user.twitterProfileUrl',
          'user.linkedinProfileUrl',
          'user.githubProfileUrl',
          'user.websiteUrl',
          'user.enabled',
          'user.createdAt',
          'user.updatedAt',
        ]);
      }

      const users = await query.getMany();
      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Helper method to check if user is internal (has password) or external (no password)
  isInternalUser(user: User): boolean {
    return !!user.password;
  }
}
