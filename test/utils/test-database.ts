import { DataSource } from 'typeorm';
import TestDataSource from '../../src/data-source.test';

export class TestDatabase {
  private static dataSource: DataSource;

  static async initialize(): Promise<DataSource> {
    if (!this.dataSource) {
      this.dataSource = await TestDataSource.initialize();
    }
    return this.dataSource;
  }

  static async cleanup(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      // Clear all tables
      const entities = this.dataSource.entityMetadatas;
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.clear();
      }
    }
  }

  static async close(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  static getDataSource(): DataSource {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error(
        'Test database not initialized. Call initialize() first.',
      );
    }
    return this.dataSource;
  }
}

// Helper function to create test data
export const createTestUser = async (
  dataSource: DataSource,
  userData: any = {},
) => {
  const userRepository = dataSource.getRepository('User');
  const defaultUser = {
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: true,
    ...userData,
  };

  return await userRepository.save(defaultUser);
};

// Helper function to create test group
export const createTestGroup = async (
  dataSource: DataSource,
  groupData: any = {},
) => {
  const groupRepository = dataSource.getRepository('Group');
  const defaultGroup = {
    name: 'Test Group',
    description: 'Test group description',
    currency: 'USD',
    ...groupData,
  };

  return await groupRepository.save(defaultGroup);
};

// Helper function to create test category
export const createTestCategory = async (
  dataSource: DataSource,
  categoryData: any = {},
) => {
  const categoryRepository = dataSource.getRepository('Category');
  const defaultCategory = {
    name: 'Test Category',
    icon: '🍕',
    color: '#FF5733',
    ...categoryData,
  };

  return await categoryRepository.save(defaultCategory);
};
