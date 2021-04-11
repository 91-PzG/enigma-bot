import { registerAs } from '@nestjs/config';
import { QueryOptions } from 'gamedig';

export interface ServerConfig {
  server1: QueryOptions;
  server2: QueryOptions;
  channel: string;
}

export default registerAs(
  'server',
  (): ServerConfig => ({
    server1: {
      type: 'hll',
      host: process.env.SERVER1_HOST,
      port: parseInt(process.env.SERVER1_PORT),
    },
    server2: {
      type: 'hll',
      host: process.env.SERVER2_HOST,
      port: parseInt(process.env.SERVER2_PORT),
    },
    channel: process.env.SERVER_CHANNEL,
  }),
);
