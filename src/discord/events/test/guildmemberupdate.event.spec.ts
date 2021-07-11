import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Collection, GuildMember, GuildMemberRoleManager, Role } from 'discord.js';
import { Repository } from 'typeorm';
import { Member, Rank } from '../../../postgres/entities';
import { DiscordUtil } from '../../util/discord.util';
import { GuildMemberUpdate } from '../guildmemberupdate.event';

describe('Guildmemberupdate event', () => {
  let guildMemberUpdate: GuildMemberUpdate;
  let discordUtil: jest.Mocked<DiscordUtil>;
  let memberRepository: jest.Mocked<Repository<Member>>;

  beforeEach(async () => {
    const discordUtilMock: Partial<DiscordUtil> = {
      isClanMember: jest.fn(),
      updateMember: jest.fn(),
      createMember: jest.fn(),
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
    discordUtil = module.get(DiscordUtil);
    memberRepository = module.get(getRepositoryToken(Member));
  });

  it('should be defined', () => {
    expect(guildMemberUpdate).toBeDefined();
  });

  describe('update existing member', () => {
    const member: Partial<Member> = {
      id: 'one',
      rank: Rank.OFFICER,
    };
    let oldMember: GuildMember;
    let newMember: GuildMember;

    beforeEach(() => {
      jest.resetAllMocks();
      memberRepository.findOne = jest.fn().mockImplementation((id: String) => {
        if (id == member.id) return member;
        return null;
      });
      discordUtil.isClanMember = jest.fn().mockReturnValue(true);
      newMember = {
        roles: { cache: new Collection<string, Role>() } as GuildMemberRoleManager,
        id: 'one',
      } as GuildMember;
      oldMember = {
        roles: { cache: new Collection<string, Role>() } as GuildMemberRoleManager,
      } as GuildMember;
    });

    it('should get member from database', async () => {
      await guildMemberUpdate.guildMemberUpdate(oldMember, newMember);
      expect(memberRepository.findOne).toHaveBeenCalled();
    });

    it('should call updateMember with correct parameters', async () => {
      await guildMemberUpdate.guildMemberUpdate(oldMember, newMember);
      expect(discordUtil.updateMember).toHaveBeenCalledWith(newMember, {
        id: 'one',
        rank: Rank.OFFICER,
      });
    });

    it('should set memberTill if member lost clanmember role', async () => {
      discordUtil.isClanMember = jest.fn().mockReturnValue(false).mockReturnValueOnce(true);
      await guildMemberUpdate.guildMemberUpdate(oldMember, newMember);
      const member = discordUtil.updateMember.mock.calls[0][1];
      expect(member.memberTill).toBeTruthy();
    });

    it('should create new member if no db entry is found', async () => {
      memberRepository.findOne = jest.fn().mockResolvedValue(null);
      await guildMemberUpdate.guildMemberUpdate(oldMember, newMember);
      expect(discordUtil.createMember).toHaveBeenCalled();
    });
  });

  describe('new member', () => {
    const member: Partial<Member> = {
      id: 'one',
      rank: Rank.OFFICER,
    };
    let oldMember: GuildMember;
    let newMember: GuildMember;

    beforeEach(() => {
      jest.resetAllMocks();
      discordUtil.isClanMember = jest.fn().mockReturnValue(true).mockReturnValueOnce(false);
      newMember = {
        roles: { cache: new Collection<string, Role>() } as GuildMemberRoleManager,
        id: 'one',
      } as GuildMember;
      oldMember = {
        roles: { cache: new Collection<string, Role>() } as GuildMemberRoleManager,
      } as GuildMember;
      discordUtil.createMember = jest.fn().mockResolvedValue(member);
    });

    it('should create new member', async () => {
      await guildMemberUpdate.guildMemberUpdate(oldMember, newMember);
      expect(discordUtil.createMember).toHaveBeenCalled();
    });

    it('should call updateMember with correct values', async () => {
      await guildMemberUpdate.guildMemberUpdate(oldMember, newMember);
      expect(discordUtil.updateMember).toHaveBeenCalledWith(newMember, member);
    });
  });

  describe('not clan member', () => {
    let oldMember: GuildMember;
    let newMember: GuildMember;

    beforeEach(() => {
      jest.resetAllMocks();
      discordUtil.isClanMember = jest.fn().mockReturnValue(false);
      newMember = {
        roles: { cache: new Collection<string, Role>() } as GuildMemberRoleManager,
        id: 'one',
      } as GuildMember;
      oldMember = {
        roles: { cache: new Collection<string, Role>() } as GuildMemberRoleManager,
      } as GuildMember;
    });

    it('should not call updateMember', async () => {
      await guildMemberUpdate.guildMemberUpdate(oldMember, newMember);
      expect(discordUtil.updateMember).not.toHaveBeenCalled();
    });
  });
});
