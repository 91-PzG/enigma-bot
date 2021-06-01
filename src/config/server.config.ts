import { registerAs } from '@nestjs/config';
import { QueryOptions } from 'gamedig';

interface ServerQueryOptions extends QueryOptions {
  name: string;
}

export interface ServerConfig {
  servers: ServerQueryOptions[];
  channel: string;
}

export default registerAs(
  'server',
  (): ServerConfig => ({
    servers: [
      {
        type: 'hll',
        host: process.env.SERVER2_HOST,
        port: parseInt(process.env.SERVER2_PORT),
        name: '91.PzG| #2 Warfare & Offensive | Mic + GER',
      },
      {
        type: 'hll',
        host: process.env.SERVER1_HOST,
        port: parseInt(process.env.SERVER1_PORT),
        name: '91.PzG| #1 Warfare only | Mic + GER',
      },
    ],
    channel: process.env.SERVER_CHANNEL,
  }),
);
