import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsController } from '../channels.controller';
import { ChannelService } from '../channels.service';
import { DiscordChannelDto } from '../dtos/discord-channel.dto';

describe('ChannelsController', () => {
  let controller: ChannelsController;
  let channels: DiscordChannelDto[] = [
    { id: '814224154697007115', name: 'test-channel' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsController],
      providers: [
        {
          provide: ChannelService,
          useValue: { getChannels: jest.fn().mockReturnValue(channels) },
        },
      ],
    }).compile();

    controller = module.get<ChannelsController>(ChannelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('channel List', () => {
    it('should return channels', () => {
      expect(controller.getChannels()).toEqual(channels);
    });
  });
});
