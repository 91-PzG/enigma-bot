import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST,
  //@ts-ignore
  port: parseInt(process.env.DATABASE_PORT, 10) || 5434,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  sync: process.env.DATABASE_SYNC,
}));
