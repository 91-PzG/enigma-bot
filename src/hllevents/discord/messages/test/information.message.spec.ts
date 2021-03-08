import { EmbedField } from 'discord.js';
import { EmbedConfig } from '../../../../config/embeds.config';
import { HLLEvent } from '../../../../postgres/entities';
import { InformationMessage } from '../information.message';

describe('Default Message', () => {
  let message: InformationMessage;
  let event: Partial<HLLEvent>;
  let config: Partial<EmbedConfig>;

  beforeEach(() => {
    event = {
      id: 5,
      //@ts-ignore
      organisator: { name: 'Hans' },
      duration: '1h',
      meetingPoint: 'treffpunkt',
      password: 'pw',
      moderator: 'mod',
    };
    config = {
      color: '#123456',
      thumbnail: 'https://test.com/image.jpg',
    };
    message = new InformationMessage(event as HLLEvent, config as EmbedConfig);
  });

  it('should be defined', () => {
    expect(message).toBeDefined();
  });

  it('add optional fields', () => {
    const fields: EmbedField[] = [
      {
        name: 'Dauer:',
        value: '1h',
        inline: true,
      },
      {
        name: 'Treffpunkt:',
        value: 'treffpunkt',
        inline: true,
      },
      {
        name: 'Passwort:',
        value: 'pw',
        inline: true,
      },
      {
        name: 'Leiter:',
        value: 'mod',
        inline: true,
      },
    ];
    fields.forEach((field) => {
      expect(message.fields.some((f) => f.name === field.name && f.value === field.value)).toBe(
        true,
      );
    });
  });
});
