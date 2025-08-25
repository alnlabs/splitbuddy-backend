# Unit Testing Setup with Database Integration

This document explains how to set up and run unit tests with database integration for the SplitBuddy backend project.

## 🏗️ Architecture Overview

The testing setup includes:

- **Test Database**: Isolated PostgreSQL database for testing
- **Test Utilities**: Helper functions for database operations
- **Jest Configuration**: Custom configuration for database tests
- **Docker Setup**: Containerized test environment

## 📁 File Structure

```
test/
├── setup.ts                    # Global test setup
├── jest.config.ts             # Jest configuration for unit tests
├── jest-e2e.json              # Jest configuration for e2e tests
└── utils/
    └── test-database.ts       # Database utilities

src/
├── data-source.test.ts        # Test database configuration
└── [modules]/
    └── *.spec.ts              # Unit test files

scripts/
└── setup-test-db.sh          # Test environment setup script
```

## 🚀 Quick Start

### 1. Setup Test Environment

```bash
# Setup test database and environment
npm run test:setup
```

This will:

- Create `.env.test` from template
- Start PostgreSQL and Redis containers
- Verify database connectivity

### 2. Run Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run tests with coverage
npm run test:unit:cov
```

### 3. Cleanup

```bash
# Stop test containers
docker-compose -f docker-compose.test.yml down
```

## 🧪 Writing Unit Tests

### Basic Test Structure

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestDatabase } from '../../test/utils/test-database';
import { YourService } from './your.service';
import { YourEntity } from '../entities/your.entity';

describe('YourService (Unit Tests with Database)', () => {
  let service: YourService;
  let repository: Repository<YourEntity>;
  let dataSource: any;

  beforeEach(async () => {
    // Get the test data source
    dataSource = TestDatabase.getDataSource();

    // Create test module with actual repository
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: getRepositoryToken(YourEntity),
          useValue: dataSource.getRepository(YourEntity),
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    repository = module.get<Repository<YourEntity>>(
      getRepositoryToken(YourEntity),
    );
  });

  it('should create a new entity', async () => {
    // Arrange
    const entityData = { name: 'Test Entity' };

    // Act
    const result = await service.create(entityData);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe(entityData.name);
  });
});
```

### Test Database Utilities

The `TestDatabase` class provides:

```typescript
// Initialize test database
await TestDatabase.initialize();

// Get data source instance
const dataSource = TestDatabase.getDataSource();

// Clean up all tables
await TestDatabase.cleanup();

// Close database connection
await TestDatabase.close();
```

### Helper Functions

```typescript
// Create test user
const user = await createTestUser(dataSource, {
  email: 'test@example.com',
  firstName: 'John',
});

// Create test group
const group = await createTestGroup(dataSource, {
  name: 'Test Group',
});

// Create test category
const category = await createTestCategory(dataSource, {
  name: 'Test Category',
});
```

## 🔧 Configuration

### Test Database Configuration (`src/data-source.test.ts`)

```typescript
const TestDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'splitbuddy_user_test',
  password: process.env.DB_PASSWORD || 'SplitBuddy2024!Test',
  database: process.env.DB_DATABASE || 'splitbuddy_test',
  entities: [join(__dirname, 'entities', '*.ts')],
  migrations: [join(__dirname, 'migrations', '*.ts')],
  synchronize: true, // Auto-sync for tests
  logging: false, // Disable logging for cleaner output
  dropSchema: true, // Drop schema before each test run
});
```

### Jest Configuration (`test/jest.config.ts`)

```typescript
const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts',
    '!**/*.entity.ts',
    '!**/*.dto.ts',
    '!**/migrations/**',
    '!**/scripts/**',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
  testTimeout: 30000, // 30 seconds for database operations
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
```

## 🐳 Docker Test Environment

### Test Containers (`docker-compose.test.yml`)

- **PostgreSQL**: Port 5434 (to avoid conflicts)
- **Redis**: Port 6380 (to avoid conflicts)
- **Test Runner**: Optional service for CI/CD

### Environment Variables (`.env.test`)

```bash
NODE_ENV=test
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=splitbuddy_user_test
DB_PASSWORD=SplitBuddy2024!Test
DB_DATABASE=splitbuddy_test
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=test-jwt-secret-key-for-testing-only-not-secure
```

## 📊 Test Coverage

### Running Coverage

```bash
npm run test:unit:cov
```

### Coverage Configuration

The Jest configuration excludes:

- Module files (`*.module.ts`)
- Main entry points (`main.ts`, `index.ts`)
- Entity and DTO files
- Migration files
- Script files

### Coverage Report

Coverage reports are generated in the `coverage/` directory and include:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

## 🔄 Test Lifecycle

### Global Setup (`test/setup.ts`)

```typescript
// Runs once before all tests
beforeAll(async () => {
  await TestDatabase.initialize();
});

// Runs once after all tests
afterAll(async () => {
  await TestDatabase.close();
});

// Runs before each test
beforeEach(async () => {
  await TestDatabase.cleanup();
});
```

### Test Isolation

Each test runs in isolation:

1. Database is cleaned up before each test
2. Fresh data is created for each test
3. No test data persists between tests

## 🚨 Best Practices

### 1. Test Data Management

```typescript
// ✅ Good: Create specific test data
const user = await createTestUser(dataSource, {
  email: 'specific@test.com',
  firstName: 'Test',
});

// ❌ Bad: Rely on existing data
const user = await userRepository.findOne({
  where: { email: 'some@email.com' },
});
```

### 2. Assertions

```typescript
// ✅ Good: Specific assertions
expect(result.email).toBe('test@example.com');
expect(result.firstName).toBe('John');
expect(result.id).toBeDefined();

// ❌ Bad: Vague assertions
expect(result).toBeDefined();
```

### 3. Error Testing

```typescript
// ✅ Good: Test error conditions
it('should throw error for duplicate email', async () => {
  const userData = { email: 'duplicate@test.com' };
  await service.create(userData);

  await expect(service.create(userData)).rejects.toThrow();
});
```

### 4. Database Cleanup

```typescript
// ✅ Good: Clean up after complex tests
afterEach(async () => {
  await TestDatabase.cleanup();
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**

   ```bash
   # Check if containers are running
   docker ps

   # Restart test environment
   npm run test:setup
   ```

2. **Test Timeout**

   ```typescript
   // Increase timeout for slow tests
   it('should handle complex operation', async () => {
     // Test code
   }, 60000); // 60 seconds
   ```

3. **Entity Not Found**
   ```typescript
   // Ensure entity is imported in data source
   entities: [join(__dirname, 'entities', '*.ts')];
   ```

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug
```

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: Unit Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Setup test database
        run: npm run test:setup
      - name: Run unit tests
        run: npm run test:unit:cov
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeORM Testing](https://typeorm.io/testing)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
