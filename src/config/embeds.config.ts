import { registerAs } from '@nestjs/config';

export interface EmbedConfig {
  color: string;
  baseUrl: string;
  thumbnail: string;
  squadleadEmoji: string;
  commanderEmoji: string;
}

export default registerAs(
  'embed',
  (): EmbedConfig => ({
    color: process.env.COLOR as string,
    baseUrl: process.env.BASE_URL as string,
    thumbnail: process.env.THUMBNAIL as string,
    squadleadEmoji: process.env.SQUADLEAD_EMOJI as string,
    commanderEmoji: process.env.SQUADLEAD_EMOJI as string,
  }),
);
