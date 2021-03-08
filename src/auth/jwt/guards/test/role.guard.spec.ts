import { Reflector } from '@nestjs/core';
import { RoleGuard } from '../role.guard';

describe('Role Guard', () => {
  let guard: RoleGuard;
  let ctx: (user: any) => any;
  const reflect: Partial<Reflector> = {
    get: jest.fn(),
  };

  beforeEach(() => {
    guard = new RoleGuard(reflect as Reflector);
    ctx = (user) => ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
      getHandler: jest.fn().mockReturnValue(''),
    });
  });

  it('should return true if no scopes are set', () => {
    reflect.get = jest.fn().mockReturnValue('');
    expect(guard.canActivate(ctx(undefined))).toBe(true);
  });

  it("should return false if user doesn't exist", () => {
    reflect.get = jest.fn().mockReturnValue(['member']);
    expect(guard.canActivate(ctx(undefined))).toBeFalsy();
  });

  it("should return false if user doesn't have role", () => {
    reflect.get = jest.fn().mockReturnValue(['member']);
    const user = { roles: ['abc', 'xyz'] };
    expect(guard.canActivate(ctx(user))).toBeFalsy();
  });

  it('should return true if user has necessary role', () => {
    reflect.get = jest.fn().mockReturnValue(['member']);
    const user = { roles: ['abc', 'xyz', 'member'] };
    expect(guard.canActivate(ctx(user))).toBe(true);
  });
});
