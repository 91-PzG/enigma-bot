import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from '../../../postgres/entities';
import { DiscordUtil } from '../../util/discord.util';
import { GuildMemberUpdate } from '../guildmemberupdate.event';

describe('Guildmemberupdate event', () => {
  let guildMemberUpdate: GuildMemberUpdate;

  beforeEach(async () => {
    const discordUtilMock: Partial<DiscordUtil> = {
      isClanMember: jest.fn(),
      updateMember: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: DiscordUtil, useValue: discordUtilMock },
        {
          provide: getRepositoryToken(Member),
          useValue: {
            findOne: jest.fn(),
          },
        },
        GuildMemberUpdate,
      ],
    }).compile();

    guildMemberUpdate = module.get<GuildMemberUpdate>(GuildMemberUpdate);
  });

  it('should be defined', () => {
    expect(guildMemberUpdate).toBeDefined();
  });
});
