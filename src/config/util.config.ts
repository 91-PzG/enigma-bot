import { registerAs } from '@nestjs/config';

export interface UtilConfig {
  discordCompatibility: string;
  debugMode: string;
}

export default registerAs(
  'discord',
  (): UtilConfig => ({
    discordCompatibility: process.env.DEBUG_MODE,
    debugMode: process.env.DEBUG_MODE,
  }),
);
