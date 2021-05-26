import { registerAs } from '@nestjs/config';
import { QueryOptions } from 'gamedig';

export interface ServerConfig {
  servers: QueryOptions[];
  channel: string;
}

export default registerAs(
  'server',
  (): ServerConfig => ({
    servers: [
      { type: 'hll', host: process.env.SERVER2_HOST, port: parseInt(process.env.SERVER2_PORT) },
      {
        type: 'hll',
        host: process.env.SERVER1_HOST,
        port: parseInt(process.env.SERVER1_PORT),
      },
    ],
    channel: process.env.SERVER_CHANNEL,
  }),
);
