import { ExecutionContext } from '@nestjs/common';
import { EventGuard } from '../jwt/guards/event.guard';

describe('Event Guard', () => {
  let guard: EventGuard;
  let ctx: (user: any) => Partial<ExecutionContext>;

  beforeEach(() => {
    guard = new EventGuard();
    ctx = (user) => ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    });
  });

  it("should return false if user doesn't exist", () => {
    expect(guard.canActivate(ctx(undefined) as ExecutionContext)).toBe(false);
  });

  it("should return false if user doesn't have eventorga role", () => {
    const user = { roles: ['abc', 'xyz'] };
    expect(guard.canActivate(ctx(user) as ExecutionContext)).toBe(false);
  });

  it('should return true if user has the eventorga role', () => {
    const user = { roles: ['abc', 'xyz', 'eventOrga'] };
    expect(guard.canActivate(ctx(user) as ExecutionContext)).toBe(true);
  });
});
