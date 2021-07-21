import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { query, QueryOptions, QueryResult } from 'gamedig';
import { EmbedConfig } from '../../../config/embeds.config';
import { ServerConfig } from '../../../config/server.config';
import { DiscordService } from '../../discord.service';
import { mapRegistry, ServerService } from '../server.service';

const serverConfig: ServerConfig = {
  servers: [
    {
      type: 'hll',
      host: '176.57.168.74',
      port: 28215,
      name: 'Server #1',
    },
    {
      type: 'hll',
      host: '127.0.0.1',
      port: 9998,
      name: 'Server #2',
    },
  ],
  channel: 'channelId',
};
const embedConfig: Partial<EmbedConfig> = {
  thumbnail: 'thumbnail.png',
  color: '#0099ff',
  baseUrl: 'https://91-pzg.de/',
};
const queryResult1: QueryResult = {
  name: '91.PzG| #1 Warfare only | Mic + GER',
  map: 'foy',
  password: false,
  maxplayers: 100,
  players: [{ name: '91.PzG| Samu' }, { name: '91.PzG| Peter' }, { name: 'Hans' }],
  bots: [],
  connect: '176.57.168.79:28345',
  ping: 15,
};
const queryResult2: QueryResult = {
  name: '91.PzG| #2 Warfare only | Mic + GER',
  map: 'foy',
  password: true,
  maxplayers: 100,
  players: [{ name: '91.PzG| Samu' }, { name: 'Hans' }],
  bots: [],
  connect: '176.57.168.74:28215',
  ping: 17,
};

jest.mock('gamedig', () => {
  return {
    query: jest.fn().mockImplementation((options: QueryOptions) => {
      if (options.host == serverConfig.servers[0].host) return queryResult1;
      return queryResult2;
    }),
  };
});

describe('server service', () => {
  let channelMock: jest.Mocked<TextChannel>;
  let messageMock: Partial<Message>;
  let serverService: ServerService;
  let discordService: jest.Mocked<DiscordService>;
  const getEmbed = (queryResult: QueryResult): Partial<MessageEmbed> => {
    return {
      type: 'rich',
      title: queryResult.name,
      url: embedConfig.baseUrl,
      color: parseInt(embedConfig.color.replace('#', ''), 16),
      thumbnail: { url: embedConfig.thumbnail },
      image: {
        url: mapRegistry[queryResult.map].imageUrl,
      },
      fields: [
        {
          name: 'Players',
          value: `${Math.min(queryResult.players.length, 100)}/100`,
          inline: false,
        },
        {
          name: 'Queue',
          value: `${Math.max(queryResult.players.length - 100, 0)}/6`,
          inline: false,
        },
        {
          name: 'Clanmembers',
          value: `${
            queryResult.players.filter((f) => f.name != null && f.name.startsWith('91.')).length
          }/${queryResult.players.length}`,
          inline: false,
        },
        {
          name: 'Ping',
          value: queryResult.ping.toString(),
          inline: false,
        },
        {
          name: 'Socket',
          value: queryResult.connect,
          inline: false,
        },
        {
          name: 'Password',
          value: queryResult.password ? 'Yes' : 'No',
          inline: false,
        },
        {
          name: 'Map',
          value: mapRegistry[queryResult.map].name,
          inline: false,
        },
      ],
    };
  };

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
    } as unknown as jest.Mocked<TextChannel>;

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
      expect(query).toHaveBeenCalledWith(serverConfig.servers[0]);
      expect(query).toHaveBeenCalledWith(serverConfig.servers[1]);
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
      expect(serverService.messages[0].edit).toHaveBeenCalled();
      expect(serverService.messages[1].edit).toHaveBeenCalled();
    });
  });

  describe('embed', () => {
    it('should set correct fields', async () => {
      jest.clearAllMocks();
      await serverService.generateServerMessages();

      const validateEmbed = (embed: MessageEmbed, expectedEmbed: MessageEmbed) => {
        for (const [key, value] of Object.entries(expectedEmbed)) {
          expect(embed[key]).toEqual(value);
        }
      };

      validateEmbed(
        channelMock.send.mock.calls[0][0] as unknown as MessageEmbed,
        getEmbed(queryResult1) as MessageEmbed,
      );
      validateEmbed(
        channelMock.send.mock.calls[1][0] as unknown as MessageEmbed,
        getEmbed(queryResult2) as MessageEmbed,
      );
    });

    it('should add remaining time', async () => {
      jest.clearAllMocks();
      const date = ~~(Date.now() / 60000);
      serverService.mapTimestamps = [date, date];
      await serverService.generateServerMessages();

      expect(channelMock.send.mock.calls[0][0].fields.pop()).toEqual({
        name: 'Remaining Time',
        value: '1h 30min',
        inline: false,
      });
    });
  });

  describe('updateMapRuntime', () => {
    const mockMessage = (content: string) => {
      return { content } as Message;
    };

    it("shouldn't update timestamps if map changes to restart map", () => {
      serverService.updateMapRuntime(
        mockMessage(
          '[Server #1][MAP_RECORDER] map change detected previous: ``stmereeglise_warfare``  new:``utahbeach_warfare_RESTART``',
        ),
      );
      expect(serverService.mapTimestamps.length).toBe(0);
    });

    it("shouldn't update timestamps if message doesn't come from map recorder", () => {
      serverService.updateMapRuntime(
        mockMessage(
          '[Server #1][CAM] map change detected previous: ``stmereeglise_warfare``  new:``utahbeach_warfare``',
        ),
      );
      expect(serverService.mapTimestamps.length).toBe(0);
    });

    it('should set timestamps', () => {
      serverService.updateMapRuntime(
        mockMessage(
          '[Server #1][MAP_RECORDER] map change detected previous: ``stmereeglise_warfare``  new:``utahbeach_warfare``',
        ),
      );
      expect(serverService.mapTimestamps[1]).toBeDefined();
      expect(serverService.mapTimestamps[0]).toBeUndefined();
      serverService.mapTimestamps = [];
      serverService.updateMapRuntime(
        mockMessage(
          '[Server #2][MAP_RECORDER] map change detected previous: ``stmereeglise_warfare``  new:``utahbeach_warfare``',
        ),
      );
      expect(serverService.mapTimestamps[0]).toBeDefined();
      expect(serverService.mapTimestamps[1]).toBeUndefined();
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
      serverService.messages[0].edit = jest.fn().mockRejectedValue(errorMessage);
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
