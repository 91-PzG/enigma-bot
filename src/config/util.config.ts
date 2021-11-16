import { registerAs } from '@nestjs/config';

export interface UtilConfig {
  discordCompatibility: string;
  debugMode: string;
}

export default registerAs(
  'discord',
  (): UtilConfig => ({
    discordCompatibility: process.env.DISCORD_COMPATIBILITY,
    debugMode: process.env.DEBUG_MODE,
  }),
);
