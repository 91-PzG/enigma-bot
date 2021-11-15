import { DiscordClientProvider } from '@discord-nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Collection, GuildMember, TextChannel, User } from 'discord.js';
import { DiscordChannelDto } from '../../channels/dtos/discord-channel.dto';
import { DiscordConfig } from '../../config/discord.config';
import { DiscordService } from '../../discord/discord.service';

describe('DiscordService', () => {
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
          recruitRole: 'recruitRole',
          reserveRole: 'reserveRole',
          ranks: {
            clanrat: 'clanrat',
            officer: 'officer',
            sergant: 'sergant',
            corporal: 'corporal',
          },
          divisions: {
            infanterie: 'inf',
            armor: 'armor',
            artillerie: 'arti',
            recon: 'recon',
          },
          accessRoles: {
            humanResources: 'hr',
            eventOrga: 'eo',
          },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configServiceMock },
        { provide: DiscordClientProvider, useValue: { getClient: jest.fn().mockReturnValue({}) } },
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
      discordService.onReady();

      expect(discordService.client).toBeTruthy();
    });
  });

  describe('getEventChannels', () => {
    it('should return correct DTOs', () => {
      const channels: any[] = [
        {
          type: 'DM',
          parentId: 'eventCategory',
        },
        {
          type: 'GUILD_TEXT',
          parentId: 'asdsa',
        },
        {
          type: 'GUILD_TEXT',
          parentId: 'eventCategory',
          id: 1,
          name: 'name1',
        },
        {
          type: 'GUILD_TEXT',
          parentId: 'eventCategory',
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

      return expect(discordService.getChannelById('')).resolves.toBeUndefined();
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

      return expect(discordService.getMessageById('', '')).resolves.toBeTruthy();
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
        guilds: {
          //@ts-ignore
          cache: {
            get: jest.fn().mockReturnValue({
              emojis: {
                fetch: jest.fn().mockReturnValue({}).mockReturnValueOnce(undefined),
              },
            }),
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
      discordService.getChannelById = jest.fn().mockResolvedValue({ members: new Collection() });

      return expect(discordService.getClanMembers()).resolves.toBeTruthy();
    });
  });

  describe('create event channel if not exists', () => {
    beforeEach(() => {
      discordService.getEventChannels = jest.fn().mockReturnValue([]);
    });
    it('should return existing channel', () => {
      expect.assertions(1);
      const channels: DiscordChannelDto[] = [
        { id: 'id1', name: 'one' },
        { id: 'id2', name: 'two' },
      ];
      const fullChannel = { id: 'id2', name: 'two', property: 'test' };
      discordService.getEventChannels = jest.fn().mockReturnValue(channels);
      discordService.getChannelById = jest.fn().mockResolvedValue(fullChannel);

      return expect(discordService.createEventChannelIfNotExists('two')).resolves.toBe(fullChannel);
    });

    it('should reject if guild is undefined', () => {
      expect.assertions(1);
      discordService.getGuild = jest.fn().mockReturnValue(undefined);

      return expect(discordService.createEventChannelIfNotExists('')).rejects.toBeTruthy();
    });
    it('should reject if creation fails', () => {
      expect.assertions(1);
      discordService.getGuild = jest.fn().mockReturnValue({
        channels: {
          create: jest.fn().mockRejectedValue({}),
        },
      });

      return expect(discordService.createEventChannelIfNotExists('')).rejects.toBeTruthy();
    });
    it('should resolve to channel if creation succeds', () => {
      expect.assertions(1);
      const channelId = '5';
      discordService.getGuild = jest.fn().mockReturnValue({
        channels: {
          create: jest.fn().mockResolvedValue({ id: channelId }),
        },
      });
      discordService.getChannelById = jest.fn().mockResolvedValue({});

      return expect(discordService.createEventChannelIfNotExists('')).resolves.toEqual({ id: '5' });
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
