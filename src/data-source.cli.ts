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
  entities: [
    join(__dirname, 'entities', 'app.entity.ts'),
    join(__dirname, 'entities', 'category.entity.ts'),
    join(__dirname, 'entities', 'chit-fund.entity.ts'),
    join(__dirname, 'entities', 'client.entity.ts'),
    join(__dirname, 'entities', 'expense-split.entity.ts'),
    join(__dirname, 'entities', 'expense.entity.ts'),
    join(__dirname, 'entities', 'external-user.entity.ts'),
    join(__dirname, 'entities', 'invitation.entity.ts'),
    join(__dirname, 'entities', 'loan-payment.entity.ts'),
    join(__dirname, 'entities', 'loan.entity.ts'),
    join(__dirname, 'entities', 'notification.entity.ts'),
    join(__dirname, 'entities', 'payment-method.entity.ts'),
    join(__dirname, 'entities', 'payment.entity.ts'),
    join(__dirname, 'entities', 'settings.entity.ts'),
    join(__dirname, 'entities', 'transaction.entity.ts'),
    join(__dirname, 'entities', 'user-group-member.entity.ts'),
    join(__dirname, 'entities', 'user-group.entity.ts'),
    join(__dirname, 'entities', 'user-settings.entity.ts'),
    join(__dirname, 'entities', 'user.entity.ts'),
  ],
  migrations: [join(__dirname, 'migrations', '*.ts')],
  synchronize: false,
  logging: true,
});

export default AppDataSource;
