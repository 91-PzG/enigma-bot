import { OptionalAuthGuard } from '../optional-auth.guard';

describe('Optional Auth Guard Guard', () => {
  let guard: OptionalAuthGuard;

  beforeEach(() => {
    guard = new OptionalAuthGuard();
  });

  it('should return user if user exists', () => {
    const user = { name: 'test' };
    expect(guard.handleRequest(null, user, null, null)).toEqual(user);
  });

  it("should return undefined if user does't exist", () => {
    expect(guard.handleRequest(null, null, null, null)).toBeUndefined();
  });
});
