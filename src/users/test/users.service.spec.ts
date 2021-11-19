import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import { AccessRoles, Contact, Division, Member, Rank } from '../../typeorm/entities';
import { NameListDto } from '../dto/name-list.dto';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let users: NameListDto[] = [
    { id: '1', username: 'hans' },
    { id: '2', username: 'susi' },
  ];
  const member = new Member();
  const contact = new Contact();
  let select: string[] = [];
  const queryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockImplementation((selections: string[]) => {
      select = select.concat(selections);
      return queryBuilder;
    }),
    addSelect: jest.fn().mockImplementation((selections: string[]) => {
      select = select.concat(selections);
      return queryBuilder;
    }),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(users),
    getOne: jest.fn().mockImplementation(() => {
      const user = { contact: {} };
      select.forEach((selection) => {
        const s = selection.split('.');
        if (s[0] == 'member') user[s[1]] = member[s[1]];
        else user.contact[s[1]] = contact[s[1]];
      });
      return user;
    }),
  };

  beforeAll(() => {
    member.avatar = 'avatar';
    member.id = 'one';
    member.recruitSince = new Date('2020-07-31T18:00:00.000Z');
    member.recruitTill = new Date('2020-07-31T18:00:00.000Z');
    member.memberSince = new Date('2020-07-31T18:00:00.000Z');
    member.memberTill = new Date('2020-07-31T18:00:00.000Z');
    member.reserve = true;
    member.honoraryMember = false;
    member.division = Division.ARTILLERY;
    member.rank = Rank.OFFICER;
    member.roles = [AccessRoles.MEMBER];
    member.missedConsecutiveEvents = 3;
    member.missedEvents = 5;
    member.contactId = 'one';

    contact.id = 'one';
    contact.comment = 'comment';
    contact.name = 'hans';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Member),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('userList', () => {
    it('should return users', async () => {
      expect(await service.getNameList()).toEqual(users);
    });
  });

  describe('getMemberById', () => {
    beforeEach(() => {
      select = [];
    });

    it('should return error if user isnt found', async () => {
      queryBuilder.getOne.mockReturnValueOnce(undefined);
      expect(service.getMemberById('one')).rejects.toThrow();
    });
    it('should return basic member if user has no special roles or user is undefined', async () => {
      const data = {
        userId: 'two',
        roles: [AccessRoles.MEMBER],
      };
      const result = {
        contact: { name: 'hans', id: 'one' },
        contactId: 'one',
        id: 'one',
        recruitSince: new Date('2020-07-31T18:00:00.000Z'),
        recruitTill: new Date('2020-07-31T18:00:00.000Z'),
        memberSince: new Date('2020-07-31T18:00:00.000Z'),
        memberTill: new Date('2020-07-31T18:00:00.000Z'),
        reserve: true,
        avatar: 'avatar',
        honoraryMember: false,
        division: 'artillery',
        rank: 'officer',
        roles: ['member'],
      };
      expect(await service.getMemberById('one', data as JwtPayload)).toEqual(result);
      expect(await service.getMemberById('one')).toEqual(result);
    });
    it('should return missedEvents if user is member or member is eventorga', async () => {
      let data = {
        userId: 'one',
        roles: [AccessRoles.MEMBER],
      };
      const result = {
        contact: { name: 'hans', id: 'one' },
        contactId: 'one',
        id: 'one',
        recruitTill: new Date('2020-07-31T18:00:00.000Z'),
        recruitSince: new Date('2020-07-31T18:00:00.000Z'),
        memberSince: new Date('2020-07-31T18:00:00.000Z'),
        memberTill: new Date('2020-07-31T18:00:00.000Z'),
        reserve: true,
        avatar: 'avatar',
        honoraryMember: false,
        division: 'artillery',
        rank: 'officer',
        roles: ['member'],
        missedConsecutiveEvents: 3,
        missedEvents: 5,
      };
      expect(await service.getMemberById('one', data as JwtPayload)).toEqual(result);
      data = {
        userId: 'three',
        roles: [AccessRoles.EVENTORGA],
      };
      expect(await service.getMemberById('one', data as JwtPayload)).toEqual(result);
    });
    it('should return comment if user is clanrat or hr', async () => {
      let data = {
        userId: 'two',
        roles: [AccessRoles.CLANRAT],
      };
      const result = {
        contact: { name: 'hans', comment: 'comment', id: 'one' },
        id: 'one',
        recruitSince: new Date('2020-07-31T18:00:00.000Z'),
        recruitTill: new Date('2020-07-31T18:00:00.000Z'),
        memberSince: new Date('2020-07-31T18:00:00.000Z'),
        memberTill: new Date('2020-07-31T18:00:00.000Z'),
        reserve: true,
        avatar: 'avatar',
        honoraryMember: false,
        division: 'artillery',
        rank: 'officer',
        roles: ['member'],
        missedConsecutiveEvents: 3,
        missedEvents: 5,
        contactId: 'one',
      };
      expect(await service.getMemberById('one', data as JwtPayload)).toEqual(result);
      data.roles = [AccessRoles.HUMANRESOURCES];
      expect(await service.getMemberById('one', data as JwtPayload)).toEqual(result);
    });
  });

  describe('getActiveMember', () => {
    it('should return value from db', async () => {
      queryBuilder.getOne.mockResolvedValue(member).mockResolvedValueOnce(undefined);
      expect(await service.getActiveMember('one')).toBeUndefined();
      expect(await service.getActiveMember('one')).toEqual(member);
    });
  });

  describe('getDivisionforMember', () => {
    it('should return value from db', async () => {
      queryBuilder.getOne.mockResolvedValue(member).mockResolvedValueOnce(undefined);
      expect(await service.getDivisionForMember('one')).toBeUndefined();
      expect(await service.getDivisionForMember('one')).toBe(Division.ARTILLERY);
    });
  });

  describe('patchUser', () => {
    it('should throw NotImplemtedException', () => {
      expect(() => service.patchUser('5', { comment: '' })).toThrow(new NotImplementedException());
    });
  });
});
