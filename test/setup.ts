import { TestDatabase } from './utils/test-database';

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log('🚀 Initializing test database...');
  await TestDatabase.initialize();
  console.log('✅ Test database initialized');
});

// Global teardown - runs once after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up test database...');
  await TestDatabase.close();
  console.log('✅ Test database closed');
});

// Setup before each test
beforeEach(async () => {
  await TestDatabase.cleanup();
});

// Global test timeout
jest.setTimeout(30000);
