import { Test, TestingModule } from '@nestjs/testing';
import { UserListDto } from '../dto/user-list.dto';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let users: UserListDto[] = [
    { id: '1', username: 'hans' },
    { id: '2', username: 'susi' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: { getUserList: jest.fn().mockReturnValue(users) },
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
});
