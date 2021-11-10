import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Collection, GuildMember, Role, User } from 'discord.js';
import { Repository } from 'typeorm';
import { DiscordConfig } from '../../../config/discord.config';
import { AccessRoles, Contact, Division, Member, Rank } from '../../../postgres/entities';
import { DiscordUtil } from '../../util/discord.util';

describe('discordutil', () => {
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
  let memberRepository: jest.Mocked<Repository<Member>>;
  let contactRepository: jest.Mocked<Repository<Contact>>;

  beforeEach(async () => {
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockReturnValue(discordConfig),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configServiceMock },
        {
          provide: getRepositoryToken(Member),
          useValue: { save: jest.fn().mockImplementation((member: Member) => member) },
        },
        {
          provide: getRepositoryToken(Contact),
          useValue: { save: jest.fn().mockImplementation((contact: Contact) => contact) },
        },
        DiscordUtil,
      ],
    }).compile();

    discordUtil = module.get<DiscordUtil>(DiscordUtil);
    memberRepository = module.get(getRepositoryToken(Member));
    contactRepository = module.get(getRepositoryToken(Contact));
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

    it('squadlead', () => {
      const collection = new Collection<string, Role>();
      memberMock.roles = [AccessRoles.SQUADLEAD];
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.SQUADLEAD]);
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

    it('default to guest', () => {
      memberMock.roles = null;
      const collection: Collection<string, Role> = new Collection<string, Role>([]);
      expect(discordUtil.getRoles(collection, memberMock)).toEqual([AccessRoles.GUEST]);
    });
  });

  describe('updateMember', () => {
    let guildMember: GuildMember;
    let member: Member;

    beforeEach(() => {
      const user: Partial<User> = {
        avatarURL: () => 'avatar.png',
        valueOf: jest.fn(),
        toString: jest.fn(),
      };
      const roles = new Collection<string, Role>([
        [discordConfig.memberRole, null],
        [discordConfig.divisions.armor, null],
        [discordConfig.ranks.officer, null],
        [discordConfig.accessRoles.eventOrga, null],
      ]);
      guildMember = {
        user,
        id: 'id',
        roles: {
          cache: roles,
        },
        displayName: 'displayName',
      } as GuildMember;

      member = {
        id: 'id',
        memberSince: new Date('12.05.2001 19:00:00'),
        reserve: true,
        avatar: 'oldavatar.jpg',
        division: Division.ARTILLERY,
        rank: Rank.SOLDIER,
        roles: [AccessRoles.SQUADLEAD, AccessRoles.MEMBER, AccessRoles.CLANRAT],
        contact: {
          name: 'oldname',
        },
      } as Member;

      memberRepository.save.mockClear();
      contactRepository.save.mockClear();
    });

    it('should update all properties on member', async () => {
      await discordUtil.updateMember(guildMember, member);
      expect(contactRepository.save).toHaveBeenCalledWith({ name: 'displayName' });

      const expectedMember: Partial<Member> = {
        id: 'id',
        memberSince: new Date('12.05.2001 19:00:00'),
        reserve: false,
        avatar: 'avatar.png',
        division: Division.ARMOR,
        rank: Rank.OFFICER,
        roles: [
          AccessRoles.MEMBER,
          AccessRoles.EVENTORGA,
          AccessRoles.OFFICER,
          AccessRoles.SQUADLEAD,
        ],
        contact: {
          name: 'displayName',
        } as Contact,
        contactId: 'id',
      };

      expect(memberRepository.save).toHaveBeenCalledWith(expectedMember);
    });

    it('should update recruitTill and MemberTill', async () => {
      member.memberSince = null;
      await discordUtil.updateMember(guildMember, member);

      const savedMember = memberRepository.save.mock.calls[0][0];
      expect(savedMember.memberSince).not.toBeNull();
      expect(savedMember.recruitTill).not.toBeNull();
    });
  });

  describe('createMember', () => {
    let guildMember: GuildMember;

    beforeEach(() => {
      const user: Partial<User> = {
        avatarURL: () => 'avatar.png',
        valueOf: jest.fn(),
        toString: jest.fn(),
      };
      const roles = new Collection<string, Role>([
        [discordConfig.memberRole, null],
        [discordConfig.divisions.armor, null],
      ]);
      guildMember = {
        user,
        id: 'id',
        roles: {
          cache: roles,
        },
        displayName: 'displayName',
      } as GuildMember;

      memberRepository.save.mockClear();
      contactRepository.save.mockClear();
    });

    it('should set all properties on member', async () => {
      const member = await discordUtil.createMember(guildMember);

      const expectedContact: Partial<Contact> = { id: 'id', name: 'displayName' };
      const expectedMember: Partial<Member> = {
        id: 'id',
        avatar: 'avatar.png',
        contactId: 'id',
        division: Division.ARMOR,
        reserve: false,
        roles: [AccessRoles.MEMBER],
        memberSince: member.memberSince,
        contact: expectedContact as Contact,
        rank: Rank.SOLDIER,
      };
      expect(member.memberSince).not.toBeNull();
      expect(member).toEqual(expectedMember);
      expect(memberRepository.save).toHaveBeenCalledWith(expectedMember as Member);
    });

    it('should set all properties on recruit', async () => {
      //@ts-ignore
      guildMember.roles.cache = new Collection<string, Role>([
        [discordConfig.recruitRole, null],
        [discordConfig.memberRole, null],
      ]);
      const member = await discordUtil.createMember(guildMember);

      const expectedContact: Partial<Contact> = { id: 'id', name: 'displayName' };
      const expectedMember: Partial<Member> = {
        id: 'id',
        contact: expectedContact as Contact,
        rank: Rank.RECRUIT,
        division: Division.INFANTERIE,
        recruitSince: member.recruitSince,
        avatar: 'avatar.png',
        contactId: 'id',
        reserve: false,
        roles: [AccessRoles.MEMBER],
      };

      expect(member.recruitSince).not.toBeNull();
      expect(member).toEqual(expectedMember as Member);
    });

    it('should save contact', async () => {
      await discordUtil.createMember(guildMember);
      expect(contactRepository.save).toHaveBeenCalledWith({ id: 'id', name: 'displayName' });
    });
  });
});
