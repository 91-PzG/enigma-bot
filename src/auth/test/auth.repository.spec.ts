import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessRoles, Contact, Member } from '../../postgres/entities';
import { AuthRepository } from '../auth.repository';

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let findOneSpy: jest.SpyInstance<Promise<Member>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRepository],
    }).compile();

    authRepository = module.get<AuthRepository>(AuthRepository);
    findOneSpy = jest.spyOn(authRepository, 'findOne');
  });

  it('should be defined', () => {
    expect(authRepository).toBeDefined();
  });

  describe('signIn', () => {
    let member: Partial<Member>;

    beforeEach(() => {
      member = {
        id: 'id',
        roles: [AccessRoles.MEMBER, AccessRoles.EVENTORGA],
        contact: {
          name: 'Hans',
        } as Contact,
        avatar: 'avatar.png',
      };
    });

    it('should throw Error if no user with provided name is is found', async function () {
      expect.assertions(1);
      findOneSpy.mockResolvedValue(undefined);

      await authRepository.signIn('token').catch((error) => {
        expect(error).toEqual(new NotFoundException('User not found'));
      });
    });

    it('should resolve to jwtWrapper', async () => {
      findOneSpy.mockResolvedValue(member as Member);

      let wrapper = await authRepository.signIn('token');
      expect(wrapper).toEqual({
        accessToken: {
          userId: 'id',
          username: 'Hans',
          avatar: 'avatar.png',
          roles: [AccessRoles.MEMBER, AccessRoles.EVENTORGA],
        },
      });

      member.avatar = null;
      wrapper = await authRepository.signIn('token');
      expect(wrapper).toEqual({
        accessToken: {
          userId: 'id',
          username: 'Hans',
          avatar: undefined,
          roles: [AccessRoles.MEMBER, AccessRoles.EVENTORGA],
        },
      });
    });
  });
});
