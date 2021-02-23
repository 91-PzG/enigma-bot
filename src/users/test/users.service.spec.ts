import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member, Rank } from '../../entities';
import { UserListDto } from '../dto/user-list.dto';
import { UsersService } from '../users.service';

describe('UsersService', () => {
  let service: UsersService;
  let users: UserListDto[] = [
    { id: '1', username: 'hans' },
    { id: '2', username: 'susi' },
  ];
  let user: Partial<Member> = { id: '1', rank: Rank.OFFICER, avatar: 'avatar' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Member),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue(users),
            }),
            findOne: jest.fn().mockReturnValue(user),
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
      expect(await service.getUserList()).toEqual(users);
    });
  });

  describe('getMemberById', () => {
    it('should return user', () => {
      expect(service.getMemberById('')).toEqual(user);
    });
  });
});
