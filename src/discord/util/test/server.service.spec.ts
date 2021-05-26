import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Message, TextChannel } from 'discord.js';
import { query, QueryOptions, QueryResult } from 'gamedig';
import { EmbedConfig } from '../../../config/embeds.config';
import { ServerConfig } from '../../../config/server.config';
import { DiscordService } from '../../discord.service';
import { ServerService } from '../server.service';

const serverConfig: ServerConfig = {
  server1: {
    type: 'hll',
    host: '176.57.168.74',
    port: 28215,
  },
  server2: {
    type: 'hll',
    host: '127.0.0.1',
    port: 9998,
  },
  channel: 'channelId',
};
const embedConfig: Partial<EmbedConfig> = {
  thumbnail: 'thumbnail.png',
};
const queryResult1: QueryResult = {
  name: '91.PzG| #1 Warfare only | Mic + GER',
  map: 'foy',
  password: false,
  maxplayers: 100,
  players: [{ name: '91.PzG| Samu' }, { name: 'Hans' }],
  bots: [],
  connect: '176.57.168.74:28215',
  ping: 15,
};

jest.mock('gamedig', () => {
  return {
    query: jest.fn().mockImplementation((options: QueryOptions) => {
      if (options.host == serverConfig.server1.host) return queryResult1;
      return null;
    }),
  };
});

describe('server service', () => {
  let channelMock: Partial<TextChannel>;
  let messageMock: Partial<Message>;
  let serverService: ServerService;
  let discordService: jest.Mocked<DiscordService>;

  beforeEach(async () => {
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockImplementation((value: string) => {
        if (value == 'embed') return embedConfig;
        if (value == 'server') return serverConfig;
        return null;
      }),
    };

    messageMock = {
      edit: jest.fn().mockReturnThis(),
      valueOf: jest.fn(),
    };

    channelMock = {
      send: jest.fn().mockResolvedValue(messageMock),
      valueOf: jest.fn(),
    };

    const discordServiceMock: Partial<DiscordService> = {
      getChannelById: jest.fn().mockResolvedValue(channelMock),
      clearChannel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configServiceMock },
        {
          provide: DiscordService,
          useValue: discordServiceMock,
        },
        ServerService,
      ],
    }).compile();

    serverService = module.get<ServerService>(ServerService);
    discordService = module.get(DiscordService);
  });

  it('should be defined', () => {
    expect(serverService).toBeDefined();
  });

  describe('serverQuery', () => {
    it('should query both servers', async () => {
      await serverService.generateServerMessages();
      expect(query).toHaveBeenCalledWith(serverConfig.server1);
      expect(query).toHaveBeenCalledWith(serverConfig.server2);
    });
  });

  describe('create and edit', () => {
    it('should run createMessages first', async () => {
      await serverService.generateServerMessages();
      expect(discordService.clearChannel).toHaveBeenCalled();
      expect(discordService.getChannelById).toHaveBeenCalled();
      expect(channelMock.send).toHaveBeenCalledTimes(2);
    });

    it('should then edit messages', async () => {
      await serverService.generateServerMessages();
      jest.clearAllMocks();
      await serverService.generateServerMessages();
      expect(serverService.msg1.edit).toHaveBeenCalled();
      expect(serverService.msg2.edit).toHaveBeenCalled();
    });
  });

  describe('embed', () => {
    it('should set correct fields', async () => {
      await serverService.generateServerMessages();
      //TODO
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      //@ts-ignore
      serverService.logger = { log: jest.fn() };
    });

    it('should log error during message create', async () => {
      const errorMessage = 'Error while sending message';
      channelMock.send = jest.fn().mockRejectedValue(errorMessage);
      await serverService.generateServerMessages();
      expect(serverService.logger.log).toHaveBeenCalledWith(errorMessage);
    });

    it('should log error during message edit', async () => {
      const errorMessage = 'Error while editing message';
      await serverService.generateServerMessages();
      serverService.msg1.edit = jest.fn().mockRejectedValue(errorMessage);
      await serverService.generateServerMessages();
      expect(serverService.logger.log).toHaveBeenCalledWith(errorMessage);
    });

    it('should log error during server query', async () => {
      const errorMessage = 'Error while querying from API';
      //@ts-ignore
      query.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          reject(errorMessage);
        });
      });
      await serverService.generateServerMessages();
      //@ts-ignore
      for (const call of serverService.logger.log.mock.calls) {
        expect(call[0]).toBe(errorMessage);
      }
    });
  });
});
