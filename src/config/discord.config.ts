import { registerAs } from '@nestjs/config';

export interface DiscordConfig {
  token: string;
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
  accessRoles: {
    humanResources: string;
    eventOrga: string;
  };
}

export default registerAs(
  'discord',
  (): DiscordConfig => ({
    token: process.env.DISCORD_TOKEN,
    clanChat: process.env.CLAN_CHAT,
    eventCategory: process.env.EVENT_CATEGORY,
    guild: process.env.GUILD_ID,
    memberRole: process.env.MEMBER_ID,
    recruitRole: process.env.RECRUIT_ID,
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
    accessRoles: {
      humanResources: process.env.HUMANRESOURCES,
      eventOrga: process.env.EVENTORGA,
    },
  }),
);
