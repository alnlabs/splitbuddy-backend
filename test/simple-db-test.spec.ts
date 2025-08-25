import { DataSource } from 'typeorm';

describe('Simple Database Test', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    // Create a simple data source with minimal configuration
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5434'),
      username: process.env.DB_USERNAME || 'splitbuddy_user_test',
      password: process.env.DB_PASSWORD || 'SplitBuddy2024!Test',
      database: process.env.DB_DATABASE || 'splitbuddy_test',
      synchronize: false, // Don't auto-sync
      logging: false,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should connect to the test database', async () => {
    // Act
    const isConnected = dataSource.isInitialized;

    // Assert
    expect(isConnected).toBe(true);
  });

  it('should have correct database configuration', async () => {
    // Act
    const databaseName = dataSource.options.database;
    const host = (dataSource.options as any).host;
    const port = (dataSource.options as any).port;

    // Assert
    expect(databaseName).toBe('splitbuddy_test');
    expect(host).toBe('localhost');
    expect(port).toBe(5434);
  });

  it('should be able to execute a simple query', async () => {
    // Act
    const result = await dataSource.query('SELECT 1 as test');

    // Assert
    expect(result).toBeDefined();
    expect(result[0].test).toBe(1);
  });

  it('should be able to check database version', async () => {
    // Act
    const result = await dataSource.query('SELECT version()');

    // Assert
    expect(result).toBeDefined();
    expect(result[0].version).toContain('PostgreSQL');
  });
});
