import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

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

  const mockUserService = {
    createUser: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create an internal user successfully', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: 'password123',
      };

      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(createDto);

      expect(result).toEqual(mockUser);
      expect(service.createUser).toHaveBeenCalledWith(createDto);
    });

    it('should create an external user successfully', async () => {
      const createDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321',
      };

      mockUserService.createUser.mockResolvedValue(mockExternalUser);

      const result = await controller.createUser(createDto);

      expect(result).toEqual(mockExternalUser);
      expect(service.createUser).toHaveBeenCalledWith(createDto);
    });

    it('should handle validation errors', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        email: 'invalid-email',
      };

      const error = new BadRequestException('Invalid email format');
      mockUserService.createUser.mockRejectedValue(error);

      await expect(controller.createUser(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createUser).toHaveBeenCalledWith(createDto);
    });

    it('should handle duplicate user errors', async () => {
      const createDto: CreateUserDto = {
        firstName: 'John',
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123',
      };

      const error = new BadRequestException(
        'User with this email or username already exists',
      );
      mockUserService.createUser.mockRejectedValue(error);

      await expect(controller.createUser(createDto)).rejects.toThrow(
        'User with this email or username already exists',
      );
      expect(service.createUser).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all users when no query parameters provided', async () => {
      const users = [mockUser, mockExternalUser];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll({});

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith({});
    });

    it('should return users filtered by search query', async () => {
      const users = [mockUser];
      const query: UserQueryDto = { search: 'John' };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return users filtered by enabled status', async () => {
      const users = [mockUser];
      const query: UserQueryDto = { enabled: true };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return internal users only', async () => {
      const users = [mockUser];
      const query: UserQueryDto = { hasPassword: 'true' };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should return external users only', async () => {
      const users = [mockExternalUser];
      const query: UserQueryDto = { hasPassword: 'false' };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle complex query combinations', async () => {
      const users = [mockUser];
      const query: UserQueryDto = {
        search: 'John',
        enabled: true,
        hasPassword: 'true',
      };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await controller.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('user-1');
    });

    it('should handle user not found', async () => {
      const error = new NotFoundException('User not found');
      mockUserService.findById.mockRejectedValue(error);

      await expect(controller.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findById).toHaveBeenCalledWith('non-existent');
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
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', updateDto);

      expect(result).toEqual(updatedUser);
      expect(service.update).toHaveBeenCalledWith('user-1', updateDto);
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateUserDto = {
        firstName: 'John Updated',
      };

      const updatedUser = { ...mockUser, firstName: 'John Updated' };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-1', updateDto);

      expect(result.firstName).toBe('John Updated');
      expect(result.lastName).toBe(mockUser.lastName); // Should remain unchanged
      expect(service.update).toHaveBeenCalledWith('user-1', updateDto);
    });

    it('should handle user not found during update', async () => {
      const updateDto: UpdateUserDto = { firstName: 'Updated' };
      const error = new NotFoundException('User not found');
      mockUserService.update.mockRejectedValue(error);

      await expect(
        controller.update('non-existent', updateDto),
      ).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith('non-existent', updateDto);
    });

    it('should handle validation errors during update', async () => {
      const updateDto: UpdateUserDto = { email: 'invalid-email' };
      const error = new BadRequestException('Invalid email format');
      mockUserService.update.mockRejectedValue(error);

      await expect(controller.update('user-1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.update).toHaveBeenCalledWith('user-1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockUserService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('user-1');

      expect(result).toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith('user-1');
    });

    it('should handle user not found during deletion', async () => {
      const error = new NotFoundException('User not found');
      mockUserService.delete.mockRejectedValue(error);

      await expect(controller.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(service.delete).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('getUsers', () => {
    it('should return all users with default fields when no fields specified', async () => {
      const users = [mockUser, mockExternalUser];
      mockUserService.getUsers.mockResolvedValue(users);

      const result = await controller.getUsers();

      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalledWith(undefined);
    });

    it('should return users with specific fields', async () => {
      const users = [
        { id: 'user-1', firstName: 'John', email: 'john@example.com' },
      ];
      mockUserService.getUsers.mockResolvedValue(users);

      const result = await controller.getUsers('id,firstName,email');

      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalledWith([
        'id',
        'firstName',
        'email',
      ]);
    });

    it('should handle multiple fields', async () => {
      const users = [{ id: 'user-1', firstName: 'John', lastName: 'Doe' }];
      mockUserService.getUsers.mockResolvedValue(users);

      const result = await controller.getUsers('id,firstName,lastName');

      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalledWith([
        'id',
        'firstName',
        'lastName',
      ]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Failed to fetch users');
      mockUserService.getUsers.mockRejectedValue(error);

      await expect(controller.getUsers()).rejects.toThrow(
        'Failed to fetch users',
      );
      expect(service.getUsers).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty search query', async () => {
      const users: any[] = [];
      const query: UserQueryDto = { search: '' };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle null query parameters', async () => {
      const users = [mockUser];
      const query: UserQueryDto = {
        search: undefined,
        enabled: undefined,
        hasPassword: undefined,
      };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle database connection errors', async () => {
      const error = new Error('Database connection failed');
      mockUserService.createUser.mockRejectedValue(error);

      const createDto: CreateUserDto = {
        firstName: 'John',
        email: 'john@example.com',
      };

      await expect(controller.createUser(createDto)).rejects.toThrow(
        'Database connection failed',
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

      mockUserService.createUser.mockResolvedValue(largeUser);

      const result = await controller.createUser(createDto);

      expect(result).toEqual(largeUser);
      expect(service.createUser).toHaveBeenCalledWith(createDto);
    });

    it('should handle special characters in search', async () => {
      const users: any[] = [];
      const query: UserQueryDto = { search: 'John@#$%^&*()' };
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll(query);

      expect(result).toEqual(users);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle empty fields parameter in getUsers', async () => {
      const users = [mockUser];
      mockUserService.getUsers.mockResolvedValue(users);

      const result = await controller.getUsers('');

      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalledWith([]);
    });

    it('should handle undefined fields parameter in getUsers', async () => {
      const users = [mockUser];
      mockUserService.getUsers.mockResolvedValue(users);

      const result = await controller.getUsers(undefined);

      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalledWith(undefined);
    });

    it('should handle whitespace in fields parameter', async () => {
      const users = [mockUser];
      mockUserService.getUsers.mockResolvedValue(users);

      const result = await controller.getUsers(' id , firstName , email ');

      expect(result).toEqual(users);
      expect(service.getUsers).toHaveBeenCalledWith([
        'id',
        'firstName',
        'email',
      ]);
    });
  });
});
