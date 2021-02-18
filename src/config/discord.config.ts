import { registerAs } from '@nestjs/config';

export default registerAs('discord', () => ({
  token: process.env.DISCORD_TOKEN,
}));
