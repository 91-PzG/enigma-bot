import { Test, TestingModule } from '@nestjs/testing';
import { DiscordService } from '../../discord/discord.service';
import { ChannelService } from '../channels.service';
import { DiscordChannelDto } from '../dtos/discord-channel.dto';

describe('ChannelsController', () => {
  let service: ChannelService;
  let channels: DiscordChannelDto[] = [
    { id: '814224154697007115', name: 'test-channel' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: DiscordService,
          useValue: { getEventChannels: jest.fn().mockReturnValue(channels) },
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('channel List', () => {
    it('should return channels', () => {
      expect(service.getChannels()).toEqual(channels);
    });
  });
});
