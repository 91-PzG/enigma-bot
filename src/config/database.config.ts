import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT as string, 10) || 5434,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    synchronize: process.env.DATABASE_SYNC === 'true',
    database: process.env.DATABASE_NAME,
  }),
);
