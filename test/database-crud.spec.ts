import { TestDatabase } from './utils/test-database';
import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';

describe('Database CRUD Operations', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await TestDatabase.initialize();
  });

  afterAll(async () => {
    await TestDatabase.close();
  });

  beforeEach(async () => {
    await TestDatabase.cleanup();
  });

  describe('User Entity CRUD', () => {
    it('should create a user', async () => {
      // Arrange
      const userRepository = dataSource.getRepository(User);
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        password: 'hashedPassword123',
        enabled: true,
      };

      // Act
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      // Assert
      expect(savedUser).toBeDefined();
      expect(savedUser.id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
    });

    it('should read a user by id', async () => {
      // Arrange
      const userRepository = dataSource.getRepository(User);
      const userData = {
        email: 'read@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        password: 'hashedPassword123',
        enabled: true,
      };
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      // Act
      const foundUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(savedUser.id);
      expect(foundUser!.email).toBe(userData.email);
    });

    it('should update a user', async () => {
      // Arrange
      const userRepository = dataSource.getRepository(User);
      const userData = {
        email: 'update@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        username: 'bobjohnson',
        password: 'hashedPassword123',
        enabled: true,
      };
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      // Act
      const updateData = {
        firstName: 'Updated Bob',
        lastName: 'Updated Johnson',
      };
      await userRepository.update(savedUser.id, updateData);
      const updatedUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });

      // Assert
      expect(updatedUser).toBeDefined();
      expect(updatedUser!.firstName).toBe(updateData.firstName);
      expect(updatedUser!.lastName).toBe(updateData.lastName);
      expect(updatedUser!.email).toBe(userData.email); // Should remain unchanged
    });

    it('should delete a user', async () => {
      // Arrange
      const userRepository = dataSource.getRepository(User);
      const userData = {
        email: 'delete@example.com',
        firstName: 'Delete',
        lastName: 'Me',
        username: 'deleteme',
        password: 'hashedPassword123',
        enabled: true,
      };
      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      // Act
      await userRepository.delete(savedUser.id);
      const deletedUser = await userRepository.findOne({
        where: { id: savedUser.id },
      });

      // Assert
      expect(deletedUser).toBeNull();
    });

    it('should find users by email', async () => {
      // Arrange
      const userRepository = dataSource.getRepository(User);
      const userData = {
        email: 'find@example.com',
        firstName: 'Find',
        lastName: 'Me',
        username: 'findme',
        password: 'hashedPassword123',
        enabled: true,
      };
      const user = userRepository.create(userData);
      await userRepository.save(user);

      // Act
      const foundUser = await userRepository.findOne({
        where: { email: userData.email },
      });

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(userData.email);
    });

    it('should handle duplicate email constraint', async () => {
      // Arrange
      const userRepository = dataSource.getRepository(User);
      const userData = {
        email: 'duplicate@example.com',
        firstName: 'First',
        lastName: 'User',
        username: 'firstuser',
        password: 'hashedPassword123',
        enabled: true,
      };

      // Create first user
      const user1 = userRepository.create(userData);
      await userRepository.save(user1);

      // Act & Assert - Try to create second user with same email
      const user2 = userRepository.create(userData);
      await expect(userRepository.save(user2)).rejects.toThrow();
    });
  });

  describe('Database Connection', () => {
    it('should be connected to test database', async () => {
      // Act
      const isConnected = dataSource.isInitialized;

      // Assert
      expect(isConnected).toBe(true);
    });

    it('should have correct database name', async () => {
      // Act
      const databaseName = dataSource.options.database;

      // Assert
      expect(databaseName).toBe('splitbuddy_test');
    });
  });
});
