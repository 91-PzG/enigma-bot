import { registerAs } from '@nestjs/config';

export interface DiscordConfig {
  token: string;
  commandPrefix: string;
  clanChat: string;
  eventCategory: string;
  guild: string;
  memberRole: string;
  recruitRole: string;
  reserveRole: string;
  divisions: {
    infanterie: string;
    armor: string;
    artillerie: string;
    recon: string;
  };
  ranks: {
    clanrat: string;
    officer: string;
    sergant: string;
    corporal: string;
  };
}

export default registerAs(
  'discord',
  (): DiscordConfig => ({
    token: process.env.DISCORD_TOKEN as string,
    commandPrefix: process.env.PREFIX || '!',
    clanChat: process.env.CLAN_CHAT as string,
    eventCategory: process.env.EVENT_CATEGORY as string,
    guild: process.env.GUILD_ID as string,
    memberRole: process.env.MEMBER_ID as string,
    recruitRole: process.env.RECRUIT_ID as string,
    reserveRole: process.env.RESERVE_ID,
    divisions: {
      infanterie: process.env.INFANTERIE,
      armor: process.env.ARMOR,
      artillerie: process.env.ARTILLERIE,
      recon: process.env.RECON,
    },
    ranks: {
      clanrat: process.env.CLANRAT,
      officer: process.env.OFFICER,
      sergant: process.env.SERGANT,
      corporal: process.env.CORPORAL,
    },
  }),
);
