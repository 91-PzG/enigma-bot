import { registerAs } from '@nestjs/config';
import { ColorResolvable } from 'discord.js';

export interface EmbedConfig {
  color: ColorResolvable;
  baseUrl: string;
  thumbnail: string;
  squadleadEmoji: string;
  commanderEmoji: string;
  rifleman: string;
  lockedEmoji: string;
  closedEmoji: string;
}

export default registerAs('embed', (): EmbedConfig => {
  return {
    color: process.env.COLOR as `#${string}`,
    baseUrl: process.env.BASE_URL,
    thumbnail: process.env.THUMBNAIL,
    rifleman: process.env.RIFLEMAN_EMOJI || '💂',
    squadleadEmoji: process.env.SQUADLEAD_EMOJI || '🤠',
    commanderEmoji: process.env.COMMANDER_EMOJI || '🕵️‍♂️',
    lockedEmoji: '🔒',
    closedEmoji: '🛑',
  };
});
