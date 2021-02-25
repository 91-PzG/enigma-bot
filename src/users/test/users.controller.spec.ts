import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '../../auth/jwt/jwt-payload.interface';
import { UserListDto } from '../dto/user-list.dto';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const users: UserListDto[] = [
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
            getUserList: jest.fn().mockReturnValue(users),
            getMemberById: jest.fn().mockReturnValue(user),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userList', () => {
    it('should return users', () => {
      expect(controller.findAll()).toEqual(users);
    });
  });

  describe('userById', () => {
    it('should return single user', () => {
      expect(controller.findOne('', {} as JwtPayload)).toEqual(user);
    });
  });
});
