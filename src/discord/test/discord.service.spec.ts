import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProvider } from 'discord-nestjs';
import { Collection, GuildMember, TextChannel, User } from 'discord.js';
import { DiscordConfig } from '../../config/discord.config';
import { DiscordService } from '../../discord/discord.service';

describe('AuthService', () => {
  let discordService: DiscordService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockImplementation(
        (): DiscordConfig => ({
          token: 'token',
          commandPrefix: '!',
          clanChat: 'clanChat',
          eventCategory: 'eventCategory',
          guild: 'guild',
          memberRole: 'memberRole',
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configServiceMock },
        DiscordService,
      ],
    }).compile();

    discordService = module.get<DiscordService>(DiscordService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(discordService).toBeDefined();
  });

  describe('setup', () => {
    it('should load config', () => {
      expect(configService.get).toHaveBeenCalledWith('discord');
    });

    it('should load client', () => {
      //@ts-ignore
      discordService.discordProvider = {
        getClient: jest.fn().mockReturnValue(new Object()),
      } as ClientProvider;

      discordService.onReady();

      expect(discordService.client).toBeTruthy();
    });
  });

  describe('getEventChannels', () => {
    it('should return correct DTOs', () => {
      const channels: unknown[] = [
        {
          type: 'dm',
        },
        {
          type: 'text',
          parentID: 'asdsa',
        },
        {
          type: 'text',
          parentID: 'eventCategory',
          id: 1,
          name: 'name1',
        },
        {
          type: 'text',
          parentID: 'eventCategory',
          id: 2,
          name: 'name2',
        },
      ];

      discordService.client = {
        channels: {
          //@ts-ignore
          cache: channels,
        },
      };

      const channelDtos = discordService.getEventChannels();
      expect(channelDtos).toEqual([
        { id: 1, name: 'name1' },
        { id: 2, name: 'name2' },
      ]);
    });
  });

  describe('getChannelById', () => {
    it('should resolve', () => {
      expect.assertions(1);
      discordService.client = {
        //@ts-ignore
        channels: {
          fetch: jest.fn().mockResolvedValue(new Object()),
        },
      };

      return expect(discordService.getChannelById('')).resolves.toEqual({});
    });

    it('should return undefined if promise rejects', () => {
      expect.assertions(1);
      discordService.client = {
        //@ts-ignore
        channels: {
          fetch: jest.fn().mockRejectedValue(new Object()),
        },
      };

      return expect(discordService.getChannelById('')).rejects.toBeTruthy();
    });
  });

  describe('getMessageById', () => {
    it('should reject if no channel found', () => {
      expect.assertions(1);
      discordService.getChannelById = jest.fn().mockRejectedValue({});

      return expect(discordService.getMessageById('', '')).rejects.toBeTruthy();
    });

    it('should return undefined if promise rejects', () => {
      expect.assertions(1);
      discordService.getChannelById = jest.fn().mockResolvedValue({
        messages: { fetch: jest.fn().mockRejectedValue({}) },
      });

      return expect(discordService.getMessageById('', '')).rejects.toBeTruthy();
    });

    it('should resolve', () => {
      expect.assertions(1);
      discordService.getChannelById = jest.fn().mockResolvedValue({
        messages: { fetch: jest.fn().mockResolvedValue({}) },
      });

      return expect(
        discordService.getMessageById('', ''),
      ).resolves.toBeTruthy();
    });
  });

  describe('getGuild', () => {
    it('should return correct value', () => {
      discordService.client = {
        //@ts-ignore
        guilds: {
          //@ts-ignore
          cache: {
            get: jest.fn().mockReturnValue(undefined).mockReturnValueOnce({}),
          },
        },
      };

      expect(discordService.getGuild()).toEqual({});
      expect(discordService.getGuild()).toEqual(undefined);
    });
  });

  describe('getMember', () => {
    it('should return undefined if guild is undefined', () => {
      discordService.getGuild = jest.fn().mockReturnValue(undefined);

      expect(discordService.getMember({} as User)).toEqual(undefined);
    });
    it('should return correct value', () => {
      discordService.getGuild = jest.fn().mockReturnValue({
        members: {
          fetch: jest.fn().mockReturnValue({}).mockReturnValueOnce(undefined),
        },
      });

      expect(discordService.getMember({} as User)).toEqual(undefined);
      expect(discordService.getMember({} as User)).toEqual({});
    });
  });

  describe('getEmojiById', () => {
    it('should return correct value', () => {
      discordService.client = {
        emojis: {
          //@ts-ignore
          cache: {
            get: jest.fn().mockReturnValue({}).mockReturnValueOnce(undefined),
          },
        },
      };

      expect(discordService.getEmojiById('')).toEqual(undefined);
      expect(discordService.getEmojiById('')).toEqual({});
    });
  });

  describe('getClanMembers', () => {
    it('should reject if channel is undefined', () => {
      expect.assertions(1);
      discordService.getChannelById = jest.fn().mockRejectedValue(undefined);

      return expect(discordService.getClanMembers()).rejects.not.toBeTruthy();
    });
    it('should resolve', () => {
      expect.assertions(1);
      discordService.getChannelById = jest
        .fn()
        .mockResolvedValue({ members: new Collection() });

      return expect(discordService.getClanMembers()).resolves.toBeTruthy();
    });
  });

  describe('create text channel', () => {
    it('should reject if guild is undefined', () => {
      expect.assertions(1);
      discordService.getGuild = jest.fn().mockReturnValue(undefined);

      return expect(discordService.createTextChannel('')).rejects.toBeTruthy();
    });
    it('should reject if creation fails', () => {
      expect.assertions(1);
      discordService.getGuild = jest.fn().mockReturnValue({
        channels: {
          create: jest.fn().mockRejectedValue({}),
        },
      });

      return expect(discordService.createTextChannel('')).rejects.toBeTruthy();
    });
    it('should resolve to id if creation succeds', () => {
      expect.assertions(1);
      const channelId = '5';
      discordService.getGuild = jest.fn().mockReturnValue({
        channels: {
          create: jest.fn().mockResolvedValue({ id: channelId }),
        },
      });
      discordService.getChannelById = jest.fn().mockResolvedValue({});

      return expect(discordService.createTextChannel('')).resolves.toBe(
        channelId,
      );
    });
  });

  describe('isClanMember', () => {
    it('should return correct value', () => {
      const member: GuildMember = {
        roles: {
          //@ts-ignore
          cache: {
            has: jest.fn().mockReturnValue(false).mockReturnValueOnce(true),
          },
        },
      };
      expect(discordService.isClanMember(member)).toBe(true);
      expect(discordService.isClanMember(member)).toBe(false);
    });
  });

  describe('clearChannel', () => {
    it('call bulk delete with correct values', async () => {
      const collection = new Collection();
      const channel: TextChannel = {
        //@ts-ignore
        messages: {
          fetch: jest.fn().mockReturnValue(collection),
        },
        bulkDelete: jest.fn(),
      };
      await discordService.clearChannel(channel);
      expect(channel.bulkDelete).toHaveBeenCalledWith(collection);
    });
  });
});
