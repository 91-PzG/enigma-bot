import { EmbedConfig } from '../../../../config/embeds.config';
import { HLLEvent } from '../../../../typeorm/entities';
import { DefaultMessage } from '../default.message';

describe('Default Message', () => {
  let message: DefaultMessage;
  let event: Partial<HLLEvent>;
  let config: Partial<EmbedConfig>;
  const decColor = 1193046;

  beforeEach(() => {
    event = {
      id: 5,
      //@ts-ignore
      organisator: 'Hans',
    };
    config = {
      color: '#123456',
      thumbnail: 'https://test.com/image.jpg',
    };
    message = new DefaultMessage(event as HLLEvent, config as EmbedConfig);
  });

  it('should be defined', () => {
    expect(message).toBeDefined();
  });

  it('should set color', () => {
    expect(message.color).toBe(decColor);
  });

  it('should set thumbnail', () => {
    expect(message.thumbnail?.url).toBe(config.thumbnail);
  });

  it('should set footer', () => {
    expect(message.footer?.text).toBe(`#${event.id} - Erstellt von ${event.organisator.name}`);
  });

  it('should set Timestamp', () => {
    expect(message.timestamp).toBeDefined();
  });
});
