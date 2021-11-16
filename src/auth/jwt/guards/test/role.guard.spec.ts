import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleGuard } from '../role.guard';

describe('Role Guard', () => {
  let guard: RoleGuard;
  let reflector: jest.Mocked<Reflector>;
  let config: jest.Mocked<ConfigService>;
  let ctx: (user: any) => any;

  beforeEach(async () => {
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockReturnValue('false'),
    };
    const reflectorMock: Partial<Reflector> = {
      get: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        { provide: Reflector, useValue: reflectorMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get(Reflector);
    config = module.get(ConfigService);

    ctx = (user) => ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
      getHandler: jest.fn().mockReturnValue(''),
    });
  });

  describe('normal mode', () => {
    it('should return true if no scopes are set', () => {
      reflector.get = jest.fn().mockReturnValue('');
      expect(guard.canActivate(ctx(undefined))).toBe(true);
    });

    it("should return false if user doesn't exist", () => {
      reflector.get = jest.fn().mockReturnValue(['member']);
      expect(guard.canActivate(ctx(undefined))).toBeFalsy();
    });

    it("should return false if user doesn't have role", () => {
      reflector.get = jest.fn().mockReturnValue(['member']);
      const user = { roles: ['abc', 'xyz'] };
      expect(guard.canActivate(ctx(user))).toBeFalsy();
    });

    it('should return true if user has necessary role', () => {
      reflector.get = jest.fn().mockReturnValue(['member']);
      const user = { roles: ['abc', 'xyz', 'member'] };
      expect(guard.canActivate(ctx(user))).toBe(true);
    });
  });

  describe('debug mode', () => {
    beforeEach(() => {
      config.get.mockReturnValue('true');
    });

    it('should return true if no scopes are set', () => {
      reflector.get = jest.fn().mockReturnValue('');
      expect(guard.canActivate(ctx(undefined))).toBe(true);
    });

    it("should return true if user doesn't exist", () => {
      reflector.get = jest.fn().mockReturnValue(['member']);
      expect(guard.canActivate(ctx(undefined))).toBe(true);
    });

    it("should return true if user doesn't have role", () => {
      reflector.get = jest.fn().mockReturnValue(['member']);
      const user = { roles: ['abc', 'xyz'] };
      expect(guard.canActivate(ctx(user))).toBe(true);
    });

    it('should return true if user has necessary role', () => {
      reflector.get = jest.fn().mockReturnValue(['member']);
      const user = { roles: ['abc', 'xyz', 'member'] };
      expect(guard.canActivate(ctx(user))).toBe(true);
    });
  });
});
