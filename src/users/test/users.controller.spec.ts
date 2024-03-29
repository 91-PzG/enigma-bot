import { NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import { AccessRoles } from '../../typeorm/entities';
import { NameListDto } from '../dto/name-list.dto';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  const users: NameListDto[] = [
    { id: '1', username: 'hans' },
    { id: '2', username: 'susi' },
  ];
  const user = {
    contact: { name: 'hans' },
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getNameList: jest.fn().mockReturnValue(users),
            getMemberById: jest.fn().mockReturnValue(user),
            patchUser: jest.fn().mockImplementation(() => {
              throw new NotImplementedException();
            }),
          },
        },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('false') } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('nameList', () => {
    it('should call getNameList on usersService', () => {
      controller.findNameList();
      expect(usersService.getNameList).toHaveBeenCalled();
    });

    it('should return users', () => {
      expect(controller.findNameList()).toEqual(users);
    });
  });

  describe('userById', () => {
    const params: [string, JwtPayload] = [
      '6',
      { roles: [AccessRoles.CLANRAT], username: 'Hans', userId: '5' },
    ];

    it('should call getMemberById on usersService', () => {
      controller.findOne(...params);
      expect(usersService.getMemberById).toHaveBeenCalledWith(...params);
    });

    it('should return single user', () => {
      expect(controller.findOne(...params)).toEqual(user);
    });
  });

  describe('patchUser', () => {
    it('should throw NotImplemtedException', () => {
      expect(() => controller.patchUser('5', { comment: '' })).toThrow(
        new NotImplementedException(),
      );
    });
  });
});
