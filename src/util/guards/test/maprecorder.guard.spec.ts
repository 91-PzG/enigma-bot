import { Message } from 'discord.js';
import { MaprecorderGuard } from '../maprecorder.guard';

describe('maprecorderGuard', () => {
  let maprecorderGuard: MaprecorderGuard;
  let message: Message;

  beforeEach(() => {
    maprecorderGuard = new MaprecorderGuard();
    message = {
      content: '[Server ',
    } as Message;
  });

  it('should return true if message starts with [Server', () => {
    expect(maprecorderGuard.canActive('messageCreate', [message])).toBe(true);
  });

  it("should return false if message doesn't starts with [Server", () => {
    message.content = '!deploy';
    expect(maprecorderGuard.canActive('messageCreate', [message])).toBe(false);
  });
});
