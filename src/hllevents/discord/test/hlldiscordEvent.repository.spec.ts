import { Test, TestingModule } from '@nestjs/testing';
import { HLLDiscordEventRepository } from '../hlldiscordevent.repository';

describe('HLLDiscordEventRepository', () => {
  let repository: HLLDiscordEventRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HLLDiscordEventRepository],
    }).compile();

    repository = module.get<HLLDiscordEventRepository>(HLLDiscordEventRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create Entity', () => {
    it('should create event', () => {
      const event = {
        save: jest.fn(),
      };
      repository.create = jest.fn().mockReturnValue(event);

      repository.createEntity('channel', 'info', 'enrolment');
      expect(event.save).toHaveBeenCalled();
      expect(event).toEqual({
        channelId: 'channel',
        informationMsg: 'info',
        enrolmentMsg: 'enrolment',
        save: event.save,
      });
    });
  });
});
