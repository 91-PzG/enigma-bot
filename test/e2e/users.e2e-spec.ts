import request from './request';

describe('UserController (e2e)', () => {
  describe('get user list', () => {
    it('should return user list', async () => {
      const { body } = await request.get('/users/list').expect(200);
      expect(body.sort((a, b) => a.id - b.id)).toEqual([
        { id: '1', username: 'One' },
        { id: '2', username: 'Two' },
        { id: '3', username: 'Three' },
      ]);
    });
  });
});
