import { DataSource } from 'typeorm';
import { join } from 'path';
import { env } from './config/env.config';

console.log('DB_HOST:', env.database.host);
console.log('DB_PORT:', env.database.port);
console.log('DB_USERNAME:', env.database.username);
console.log('DB_PASSWORD:', env.database.password ? '***' : 'undefined');
console.log('DB_DATABASE:', env.database.database);

const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.database,
  entities: [join(__dirname, 'entities', '*.ts')],
  migrations: [join(__dirname, 'migrations', '*.ts')],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
