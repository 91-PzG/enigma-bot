import { registerAs } from '@nestjs/config';

export interface DiscordConfig {
  token: string
  commandPrefix: string
  clanChat:string,
  eventCategory:string,
  guild:string
  memberRole:string,
}

export default registerAs('discord', ():DiscordConfig => ({
  token: process.env.DISCORD_TOKEN as string,
  commandPrefix: process.env.PREFIX||'!',
  clanChat:process.env.CLAN_CHAT as string,
  eventCategory:process.env.EVENT_CATEGORY as string,
  guild:process.env.GUILD_ID as string,
  memberRole:process.env.MEMBER_ID as string,
}));
