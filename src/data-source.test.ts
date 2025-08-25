import { DataSource } from 'typeorm';
import { join } from 'path';

// Load test environment variables
import { config } from 'dotenv';
import * as path from 'path';

// Load test environment variables
config({ path: path.resolve(process.cwd(), '.env.test') });

const TestDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  username: process.env.DB_USERNAME || 'splitbuddy_user_test',
  password: process.env.DB_PASSWORD || 'SplitBuddy2024!Test',
  database: process.env.DB_DATABASE || 'splitbuddy_test',
  entities: [join(__dirname, 'entities', 'user.entity.ts')], // Only include User entity
  migrations: [join(__dirname, 'migrations', '*.ts')],
  synchronize: true, // Auto-sync for tests
  logging: false, // Disable logging for cleaner test output
  dropSchema: true, // Drop schema before each test run
});

export default TestDataSource;
