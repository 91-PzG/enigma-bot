import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Collection, GuildMember, GuildMemberRoleManager, Role, User } from 'discord.js';
import { DiscordConfig } from '../../../config/discord.config';
import { AccessRoles, Division, Member, Rank } from '../../../postgres/entities';
import { DiscordUtil } from '../../util/discord.util';

describe('updateUsers command', () => {
  const discordConfig: Partial<DiscordConfig> = {
    recruitRole: 'recruit',
    reserveRole: 'reserve',
    memberRole: 'member',
    ranks: {
      clanrat: 'clanrat',
      corporal: 'corporal',
      officer: 'officer',
      sergant: 'sergant',
    },
    accessRoles: {
      eventOrga: 'eventOrga',
      humanResources: 'hr',
    },
    divisions: {
      armor: 'armor',
      infanterie: 'infanterie',
      recon: 'recon',
      artillerie: 'artillerie',
    },
  };
  let discordUtil: DiscordUtil;

  beforeEach(async () => {
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockReturnValue(discordConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ConfigService, useValue: configServiceMock }, DiscordUtil],
    }).compile();

    discordUtil = module.get<DiscordUtil>(DiscordUtil);
  });

  it('should be defined', () => {
    expect(discordUtil).toBeDefined();
  });

  describe('getDivision', () => {
    it('should return correct division', () => {
      const armorCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.divisions.armor, null],
      ]);
      const reconCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.divisions.recon, null],
      ]);
      const artillerieCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.divisions.artillerie, null],
      ]);
      const infanterieCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.divisions.infanterie, null],
      ]);
      expect(discordUtil.getDivision(armorCollection)).toBe(Division.ARMOR);
      expect(discordUtil.getDivision(reconCollection)).toBe(Division.RECON);
      expect(discordUtil.getDivision(artillerieCollection)).toBe(Division.ARTILLERY);
      expect(discordUtil.getDivision(infanterieCollection)).toBe(Division.INFANTERIE);
    });

    it('should default to infanterie', () => {
      const emptyCollection: Collection<string, Role> = new Collection<string, Role>([]);
      expect(discordUtil.getDivision(emptyCollection)).toBe(Division.INFANTERIE);
    });
  });

  describe('getRank', () => {
    it('should return correct rank', () => {
      const clanratCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.ranks.clanrat, null],
      ]);
      const officerCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.ranks.officer, null],
      ]);
      const sergantCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.ranks.sergant, null],
      ]);
      const corporalCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.ranks.corporal, null],
      ]);
      const recruitCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.recruitRole, null],
      ]);
      expect(discordUtil.getRank(clanratCollection)).toBe(Rank.CLANRAT);
      expect(discordUtil.getRank(officerCollection)).toBe(Rank.OFFICER);
      expect(discordUtil.getRank(sergantCollection)).toBe(Rank.SERGANT);
      expect(discordUtil.getRank(corporalCollection)).toBe(Rank.CORPORAL);
      expect(discordUtil.getRank(recruitCollection)).toBe(Rank.RECRUIT);
    });

    it('should default to infanterie', () => {
      const emptyCollection: Collection<string, Role> = new Collection<string, Role>([]);
      expect(discordUtil.getRank(emptyCollection)).toBe(Rank.SOLDIER);
    });
  });

  describe('isClanMember', () => {
    it('should return true if collection contains clanmember role', () => {
      const memberCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.memberRole, null],
      ]);
      expect(discordUtil.isClanMember(memberCollection)).toBe(true);
    });

    it("should return false if collection doesn't contains clanmember role", () => {
      const emptyCollection: Collection<string, Role> = new Collection<string, Role>([]);
      expect(discordUtil.isClanMember(emptyCollection)).toBe(false);
    });
  });

  describe('getRoles', () => {
    let memberMock: Member;

    beforeEach(() => {
      memberMock = { roles: [] } as Member;
    });

    it('member', () => {
      const collection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.memberRole, null],
      ]);
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.MEMBER]);
    });

    it('eventorga', () => {
      const collection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.accessRoles.eventOrga, null],
      ]);
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.EVENTORGA]);
    });

    it('humanresources', () => {
      const collection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.accessRoles.humanResources, null],
      ]);
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.HUMANRESOURCES]);
    });

    it('clanrat', () => {
      const collection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.ranks.clanrat, null],
      ]);
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.CLANRAT]);
    });

    it('officer', () => {
      const officerCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.ranks.officer, null],
      ]);
      const sergantCollection: Collection<string, Role> = new Collection<string, Role>([
        [discordConfig.ranks.sergant, null],
      ]);
      expect(discordUtil.getRoles(officerCollection, memberMock)).toEqual([AccessRoles.OFFICER]);
      expect(discordUtil.getRoles(sergantCollection, memberMock)).toEqual([AccessRoles.OFFICER]);
    });

    it('clanrat', () => {
      const collection: Collection<string, Role> = new Collection<string, Role>([]);
      memberMock.roles.includes = jest.fn().mockReturnValue(true);
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.SQUADLEAD]);
    });

    it('default to guest', () => {
      const collection: Collection<string, Role> = new Collection<string, Role>([]);
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.GUEST]);
    });
  });

  describe('createMember', () => {
    let user: GuildMember;
    beforeEach(() => {
      user = { id: 'id', roles: {} as GuildMemberRoleManager } as GuildMember;
    });
  });
});
