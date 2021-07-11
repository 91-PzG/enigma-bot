import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { Member } from '../../postgres/entities';
import { AuthRepository } from '../auth.repository';

jest.mock('bcryptjs');

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let updateQueryBuilder: Partial<UpdateQueryBuilder<Member>> = {
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  };
  let queryBuilder: Partial<SelectQueryBuilder<Member>> = {
    update: jest.fn().mockReturnValue(updateQueryBuilder),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  };

  const salt = 'salt';
  const password = 'hash';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRepository],
    }).compile();

    authRepository = module.get<AuthRepository>(AuthRepository);
    jest
      .spyOn(authRepository, 'createQueryBuilder')
      .mockReturnValue(queryBuilder as SelectQueryBuilder<Member>);

    jest.spyOn(bcrypt, 'genSaltSync').mockReturnValue(salt);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue(password);
  });

  it('should be defined', () => {
    expect(authRepository).toBeDefined();
  });

  describe('setPassword', () => {
    it('should throw Error if no user with id is found', async function () {
      expect.assertions(1);
      updateQueryBuilder.execute = jest.fn().mockReturnValue({ affected: 0 });

      const id = 'userID';
      await authRepository.setPassword('pw', id).catch((e) => {
        expect(e).toEqual(Error(`No user with id '${id}' found.`));
      });
    });

    it('should try to update db with correct values', async () => {
      updateQueryBuilder.execute = jest.fn().mockReturnValue({ affected: 1 });

      await authRepository.setPassword('pw', 'id');

      expect(updateQueryBuilder.set).toBeCalledWith({
        salt,
        password,
        mustChangePassword: true,
      });
    });

    it('should resolve', async () => {
      expect.assertions(1);
      updateQueryBuilder.execute = jest.fn().mockReturnValue({ affected: 1 });

      return expect(authRepository.setPassword('pw', 'id')).resolves.not.toThrow();
    });
  });

  describe('change Password', () => {
    it('should throw Error if no user with provided name is is found', async function () {
      expect.assertions(1);
      queryBuilder.getOne = jest.fn().mockResolvedValue(undefined);

      await authRepository
        .changePassword({ oldPassword: '', newPassword: '', username: '' })
        .catch((e) => {
          expect(e).toEqual(Error(`Username not found`));
        });
    });

    let member: Partial<Member>;
    beforeEach(() => {
      member = {
        validatePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        //@ts-ignore
        contact: { name: 'name' },
        id: 'id',
        avatar: 'avatar',
        roles: [],
      };
    });

    it('should throw Error if oldPassword is invalid', async function () {
      expect.assertions(1);
      member.validatePassword = jest.fn().mockResolvedValue(false);
      queryBuilder.getOne = jest.fn().mockResolvedValue(member);

      await authRepository
        .changePassword({ oldPassword: '', newPassword: '', username: '' })
        .catch((e) => {
          expect(e).toEqual(Error(`Passwort ungültig`));
        });
    });

    it('should update user variables and save them', async function () {
      queryBuilder.getOne = jest.fn().mockResolvedValue(member);

      await authRepository.changePassword({
        oldPassword: '',
        newPassword: '',
        username: '',
      });

      expect(member.salt).toBe(salt);
      expect(member.mustChangePassword).toBe(false);
      expect(member.password).toBe(password);
      expect(member.save).toHaveBeenCalled();
    });

    it('should resolve to wrapper', async () => {
      const wrapper = await authRepository.changePassword({
        oldPassword: '',
        newPassword: '',
        username: '',
      });

      expect(wrapper).toEqual({
        accessToken: {
          userId: 'id',
          username: 'name',
          avatar: 'avatar',
          roles: [],
        },
      });
    });
  });

  describe('signIn', () => {
    let member: Partial<Member>;
    beforeEach(() => {
      member = {
        validatePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        //@ts-ignore
        contact: { name: 'name' },
        id: 'id',
        roles: [],
      };
    });

    it('should throw Error if no user with provided name is is found', async function () {
      expect.assertions(1);
      queryBuilder.getOne = jest.fn().mockResolvedValue(undefined);

      await authRepository.signIn({ password: '', username: '' }).catch((e) => {
        expect(e).toEqual(Error('Invalid credentials'));
      });
    });

    // Has to be changed to just include a flag in the response body
    /*it('should throw Error if mustChangePassword flag is set', async function () {
      expect.assertions(1);
      member.mustChangePassword = true;
      queryBuilder.getOne = jest.fn().mockResolvedValue(member);

      await authRepository.signIn({ password: '', username: '' }).catch((e) => {
        expect(e).toEqual(Error('Must change password'));
      });
    });*/

    it("should throw Error if user hasn't registered", async function () {
      expect.assertions(1);
      queryBuilder.getOne = jest.fn().mockResolvedValue(member);

      await authRepository.signIn({ password: '', username: '' }).catch((e) => {
        expect(e).toEqual(Error('User not registered yet'));
      });
    });

    it('should throw Error if password is incorrect', async function () {
      expect.assertions(1);
      member.password = 'abc';
      member.validatePassword = jest.fn().mockResolvedValue(false);
      queryBuilder.getOne = jest.fn().mockResolvedValue(member);

      await authRepository.signIn({ password: '', username: '' }).catch((e) => {
        expect(e).toEqual(Error('Invalid credentials'));
      });
    });

    it('should resolve to jwtWrapper', async () => {
      member.password = password;
      queryBuilder.getOne = jest.fn().mockResolvedValue(member);

      const wrapper = await authRepository.signIn({
        password: '',
        username: '',
      });

      expect(wrapper).toEqual({
        accessToken: {
          userId: 'id',
          username: 'name',
          avatar: undefined,
          roles: [],
        },
      });
    });
  });
});
