import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    username: 'johndoe',
    password: 'hashedPassword123',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    zipCode: '10001',
    enabled: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockExternalUser = {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+0987654321',
    username: 'jane.smith@example.com',
    password: null,
    address: null,
    city: null,
    state: null,
    country: null,
    zipCode: null,
    enabled: true,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    describe('Internal User Creation', () => {
      it('should create an internal user successfully', async () => {
        const createDto: CreateUserDto = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          username: 'johndoe',
          password: 'password123',
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
        jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
        jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser as any);

        const result = await service.createUser(createDto);

        expect(result).toEqual(mockUser);
        expect(userRepository.create).toHaveBeenCalledWith({
          ...createDto,
          enabled: true,
        });
        expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      });

      it('should throw error for internal user without email', async () => {
        const createDto: CreateUserDto = {
          firstName: 'John',
          username: 'johndoe',
          password: 'password123',
        };

        await expect(service.createUser(createDto)).rejects.toThrow(
          'Internal users must have an email address',
        );
      });

      it('should throw error for duplicate email', async () => {
        const createDto: CreateUserDto = {
          firstName: 'John',
          email: 'existing@example.com',
          username: 'johndoe',
          password: 'password123',
        };

        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValue(mockUser as any);

        await expect(service.createUser(createDto)).rejects.toThrow(
          'User with this email or username already exists',
        );
      });

      it('should throw error for duplicate username', async () => {
        const createDto: CreateUserDto = {
          firstName: 'John',
          email: 'new@example.com',
          username: 'johndoe', // Existing username
          password: 'password123',
        };

        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValue(mockUser as any);

        await expect(service.createUser(createDto)).rejects.toThrow(
          'User with this email or username already exists',
        );
      });
    });

    describe('External User Creation', () => {
      it('should create an external user with email successfully', async () => {
        const createDto: CreateUserDto = {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(userRepository, 'create')
          .mockReturnValue(mockExternalUser as any);
        jest
          .spyOn(userRepository, 'save')
          .mockResolvedValue(mockExternalUser as any);

        const result = await service.createUser(createDto);

        expect(result).toEqual(mockExternalUser);
        expect(userRepository.create).toHaveBeenCalledWith({
          ...createDto,
          username: 'jane.smith@example.com',
          enabled: true,
        });
      });

      it('should create an external user with phone successfully', async () => {
        const createDto: CreateUserDto = {
          firstName: 'Jane',
          phone: '+0987654321',
        };

        const externalUserWithPhone = {
          ...mockExternalUser,
          phone: '+0987654321',
          username: 'external_1704067200000',
        };
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
        jest
          .spyOn(userRepository, 'create')
          .mockReturnValue(externalUserWithPhone as any);
        jest
          .spyOn(userRepository, 'save')
          .mockResolvedValue(externalUserWithPhone as any);

        const result = await service.createUser(createDto);

        expect(result).toEqual(externalUserWithPhone);
        expect(userRepository.create).toHaveBeenCalledWith({
          ...createDto,
          username: expect.stringMatching(/^external_\d+$/),
          enabled: true,
        });
      });

      it('should throw error for external user without email or phone', async () => {
        const createDto: CreateUserDto = {
          firstName: 'Jane',
        };

        await expect(service.createUser(createDto)).rejects.toThrow(
          'External user must have either email or phone number',
        );
      });

      it('should throw error for duplicate email in external user', async () => {
        const createDto: CreateUserDto = {
          firstName: 'Jane',
          email: 'existing@example.com',
        };

        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValue(mockUser as any);

        await expect(service.createUser(createDto)).rejects.toThrow(
          'User with this email already exists',
        );
      });

      it('should throw error for duplicate phone in external user', async () => {
        const createDto: CreateUserDto = {
          firstName: 'Jane',
          phone: '+1234567890',
        };

        jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValue(mockUser as any);

        await expect(service.createUser(createDto)).rejects.toThrow(
          'User with this phone number already exists',
        );
      });
    });

    it('should handle database errors', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        email: 'john@example.com',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.createUser(createDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users when no query parameters provided', async () => {
      const users = [mockUser, mockExternalUser];
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({});

      expect(result).toEqual(users);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
    });

    it('should filter users by search query', async () => {
      const users = [mockUser];
      const query: UserQueryDto = { search: 'John' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: '%John%' },
      );
    });

    it('should filter users by enabled status', async () => {
      const users = [mockUser];
      const query: UserQueryDto = { enabled: true };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.enabled = :enabled',
        { enabled: true },
      );
    });

    it('should filter internal users (hasPassword: true)', async () => {
      const users = [mockUser];
      const query: UserQueryDto = { hasPassword: 'true' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.password IS NOT NULL',
      );
    });

    it('should filter external users (hasPassword: false)', async () => {
      const users = [mockExternalUser];
      const query: UserQueryDto = { hasPassword: 'false' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.password IS NULL',
      );
    });

    it('should handle complex query combinations', async () => {
      const users = [mockUser];
      const query: UserQueryDto = {
        search: 'John',
        enabled: true,
        hasPassword: 'true',
      };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent' },
      });
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateDto: UpdateUserDto = {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        email: 'john.updated@example.com',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

      const result = await service.update('user-1', updateDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateUserDto = {
        firstName: 'John Updated',
      };

      const updatedUser = { ...mockUser, firstName: 'John Updated' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser as any);

      const result = await service.update('user-1', updateDto);

      expect(result.firstName).toBe('John Updated');
      expect(result.lastName).toBe(mockUser.lastName); // Should remain unchanged
    });

    it('should throw NotFoundException when user not found during update', async () => {
      const updateDto: UpdateUserDto = { firstName: 'Updated' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle database errors during update', async () => {
      const updateDto: UpdateUserDto = { firstName: 'Updated' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.update('user-1', updateDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('delete', () => {
    it('should soft delete user successfully', async () => {
      const disabledUser = { ...mockUser, enabled: false };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(disabledUser as any);

      await service.delete('user-1');

      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        enabled: false,
      });
    });

    it('should throw NotFoundException when user not found during deletion', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUsers', () => {
    it('should return all users with default fields when no fields specified', async () => {
      const users = [mockUser, mockExternalUser];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.getUsers();

      expect(result).toEqual(users);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
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
    });

    it('should return users with specific fields', async () => {
      const users = [
        { id: 'user-1', firstName: 'John', email: 'john@example.com' },
      ];
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.getUsers(['id', 'firstName', 'email']);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'user.id',
        'user.firstName',
        'user.email',
      ]);
    });

    it('should handle database errors', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      await expect(service.getUsers()).rejects.toThrow(
        'Failed to fetch users: Database error',
      );
    });
  });

  describe('isInternalUser', () => {
    it('should return true for internal user (has password)', () => {
      const result = service.isInternalUser(mockUser as User);
      expect(result).toBe(true);
    });

    it('should return false for external user (no password)', () => {
      const result = service.isInternalUser(mockExternalUser as any);
      expect(result).toBe(false);
    });

    it('should return false for user with null password', () => {
      const userWithNullPassword = { ...mockUser, password: null };
      const result = service.isInternalUser(userWithNullPassword as any);
      expect(result).toBe(false);
    });

    it('should return false for user with undefined password', () => {
      const userWithUndefinedPassword = { ...mockUser, password: undefined };
      const result = service.isInternalUser(userWithUndefinedPassword as any);
      expect(result).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty search query', async () => {
      const users: any[] = [];
      const query: UserQueryDto = { search: '' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query);

      expect(result).toEqual(users);
      // Empty search should NOT trigger the search condition
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalledWith(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: '%%' },
      );
    });

    it('should handle special characters in search', async () => {
      const users: any[] = [];
      const query: UserQueryDto = { search: 'John@#$%^&*()' };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(users),
      };

      jest
        .spyOn(userRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll(query);

      expect(result).toEqual(users);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: '%John@#$%^&*()%' },
      );
    });

    it('should handle large user data', async () => {
      const largeUser = {
        ...mockUser,
        firstName: 'A'.repeat(1000),
        lastName: 'B'.repeat(1000),
        address: 'C'.repeat(2000),
      };

      const createDto: CreateUserDto = {
        firstName: largeUser.firstName,
        lastName: largeUser.lastName,
        email: 'large@example.com',
        address: largeUser.address,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(largeUser as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue(largeUser as any);

      const result = await service.createUser(createDto);

      expect(result).toEqual(largeUser);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createDto,
        username: 'large@example.com',
        enabled: true,
      });
    });

    it('should handle database connection errors', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        email: 'john@example.com',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser as any);
      jest
        .spyOn(userRepository, 'save')
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createUser(createDto)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle null values in optional fields', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        email: 'john@example.com',
        lastName: undefined,
        phone: undefined,
        address: undefined,
        city: undefined,
        state: undefined,
        country: undefined,
        zipCode: undefined,
      };

      const userWithNulls = { ...mockUser, ...createDto };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(userWithNulls as any);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(userWithNulls as any);

      const result = await service.createUser(createDto);

      expect(result.lastName).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.address).toBeUndefined();
      expect(result.city).toBeUndefined();
      expect(result.state).toBeUndefined();
      expect(result.country).toBeUndefined();
      expect(result.zipCode).toBeUndefined();
    });
  });
});
