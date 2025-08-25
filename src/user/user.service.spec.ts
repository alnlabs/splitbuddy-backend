import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { TestDatabase, createTestUser } from '../../test/utils/test-database';
import { Repository } from 'typeorm';

describe('UserService (Unit Tests with Database)', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let dataSource: any;

  beforeEach(async () => {
    // Get the test data source
    dataSource = TestDatabase.getDataSource();

    // Create a test module with the actual repository
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: dataSource.getRepository(User),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should create a new internal user', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
      };

      // Act
      const result = await service.createUser(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
      expect(result.firstName).toBe(userData.firstName);
      expect(result.lastName).toBe(userData.lastName);
      expect(result.id).toBeDefined();
    });

    it('should throw error when creating user with duplicate email', async () => {
      // Arrange
      const userData = {
        email: 'duplicate@example.com',
        password: 'hashedPassword123',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
      };

      // Create first user
      await service.createUser(userData);

      // Act & Assert
      await expect(service.createUser(userData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should find users by search query', async () => {
      // Arrange
      const userData = {
        email: 'findme@example.com',
        password: 'hashedPassword123',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
      };
      const createdUser = await service.createUser(userData);

      // Act
      const foundUsers = await service.findAll({ search: 'Jane' });

      // Assert
      expect(foundUsers).toBeDefined();
      expect(foundUsers.length).toBeGreaterThan(0);
      expect(foundUsers[0].id).toBe(createdUser.id);
      expect(foundUsers[0].email).toBe(userData.email);
    });

    it('should return empty array when no users found', async () => {
      // Act
      const result = await service.findAll({ search: 'nonexistent' });

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      // Arrange
      const userData = {
        email: 'findbyid@example.com',
        password: 'hashedPassword123',
        firstName: 'Bob',
        lastName: 'Johnson',
        username: 'bobjohnson',
      };
      const createdUser = await service.createUser(userData);

      // Act
      const foundUser = await service.findById(createdUser.id);

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(userData.email);
    });

    it('should throw NotFoundException when user not found by id', async () => {
      // Act & Assert
      await expect(service.findById('non-existent-id')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update user information', async () => {
      // Arrange
      const userData = {
        email: 'update@example.com',
        password: 'hashedPassword123',
        firstName: 'Original',
        lastName: 'Name',
        isEmailVerified: true,
      };
      const createdUser = await service.create(userData);
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      // Act
      const updatedUser = await service.update(createdUser.id, updateData);

      // Assert
      expect(updatedUser).toBeDefined();
      expect(updatedUser.firstName).toBe(updateData.firstName);
      expect(updatedUser.lastName).toBe(updateData.lastName);
      expect(updatedUser.email).toBe(userData.email); // Should remain unchanged
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      // Arrange
      const userData = {
        email: 'delete@example.com',
        password: 'hashedPassword123',
        firstName: 'Delete',
        lastName: 'Me',
        isEmailVerified: true,
      };
      const createdUser = await service.create(userData);

      // Act
      await service.delete(createdUser.id);

      // Assert
      const deletedUser = await service.findById(createdUser.id);
      expect(deletedUser).toBeNull();
    });
  });
});
