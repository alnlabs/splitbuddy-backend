// @ts-ignore
const env = require('../env.js');
import { DataSource } from 'typeorm';
import { join } from 'path';

const createDataSource = async () => {
  return new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: [join(__dirname, 'entities', '*.ts')],
    migrations: [join(__dirname, 'migrations', '*.ts')],
    synchronize: false,
    logging: true,
  });
};

export default createDataSource;
