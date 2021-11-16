import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommandInteraction, GuildMember, InteractionReplyOptions } from 'discord.js';
import { Repository } from 'typeorm';
import { DiscordService } from '../../../discord/discord.service';
import { DiscordUtil } from '../../../discord/util/discord.util';
import { Member } from '../../../typeorm/entities';
import { UpdateUsersCommand } from '../updateusers.command';

jest.useFakeTimers();

describe('updateUsers command', () => {
  let updateUsersCommand: UpdateUsersCommand;
  let discordService: jest.Mocked<DiscordService>;
  let repostitory: jest.Mocked<Repository<Member>>;
  let util: jest.Mocked<DiscordUtil>;

  beforeEach(async () => {
    const discordServiceMock: Partial<DiscordService> = {
      getClanMembers: jest.fn().mockResolvedValue([]),
    };
    const discordUtilMock: Partial<DiscordUtil> = {
      createMember: jest.fn(),
      updateMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DiscordService, useValue: discordServiceMock },
        { provide: DiscordUtil, useValue: discordUtilMock },
        {
          provide: getRepositoryToken(Member),
          useValue: {
            findOne: jest.fn(),
          },
        },
        UpdateUsersCommand,
      ],
    }).compile();

    updateUsersCommand = module.get<UpdateUsersCommand>(UpdateUsersCommand);
    discordService = module.get(DiscordService);
    repostitory = module.get(getRepositoryToken(Member));
    util = module.get(DiscordUtil);
  });

  it('should be defined', () => {
    expect(updateUsersCommand).toBeDefined();
  });

  describe('updateUserCommand', () => {
    let interaction: Partial<CommandInteraction> = {
      reply: jest.fn(),
      followUp: jest.fn(),
      valueOf: jest.fn(),
    };
    const reply: InteractionReplyOptions = { ephemeral: true };

    it('should send reply', async () => {
      await updateUsersCommand.handler(interaction as CommandInteraction);
      reply.content = 'Updating clanmembers...';
      expect(interaction.reply).toHaveBeenLastCalledWith(reply);
    });

    it('should send follow up', async () => {
      await updateUsersCommand.handler(interaction as CommandInteraction);
      reply.content = 'Successfully updated clanmembers';
      expect(interaction.followUp).toHaveBeenLastCalledWith(reply);
    });

    describe('updateUser', () => {
      const users: Partial<GuildMember>[] = [
        { id: '1', valueOf: jest.fn(), toString: jest.fn() },
        { id: '2', valueOf: jest.fn(), toString: jest.fn() },
        { id: '3', valueOf: jest.fn(), toString: jest.fn() },
        { id: '4', valueOf: jest.fn(), toString: jest.fn() },
      ];

      beforeEach(async () => {
        discordService.getClanMembers = jest.fn().mockResolvedValue(users);
        repostitory.findOne = jest.fn().mockImplementation((id: string): Member => {
          if (Number.parseInt(id) % 2 == 0) return null;
          const member: Partial<Member> = { id: 'test', avatar: 'ava' };
          return member as Member;
        });
      });

      it('should call findOne for each user', async () => {
        await updateUsersCommand.handler(interaction as CommandInteraction);
        for (const user of users) {
          expect(repostitory.findOne).toHaveBeenCalledWith(user.id);
        }
      });

      it('should call createMember if findOne returns null', async () => {
        await updateUsersCommand.handler(interaction as CommandInteraction);
        for (const user of users) {
          if (Number.parseInt(user.id) % 2 == 0)
            expect(util.createMember).toHaveBeenCalledWith(user);
        }
      });

      it('should call updateMember if findOne returns not null', async () => {
        await updateUsersCommand.handler(interaction as CommandInteraction);
        for (const user of users) {
          if (Number.parseInt(user.id) % 2 == 1)
            expect(util.updateMember).toHaveBeenCalledWith(user, { id: 'test', avatar: 'ava' });
        }
      });
    });
  });
});
