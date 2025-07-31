import { DataSource } from 'typeorm';
import { join } from 'path';
import { env } from './config/env.config';

const createDataSource = async () => {
  return new DataSource({
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
};

export default createDataSource;
