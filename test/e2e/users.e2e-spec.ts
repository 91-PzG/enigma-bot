import { UserListDto } from '../../src/users/dto/user-list.dto';
import request from './request';

const sort = (a: UserListDto, b: UserListDto) => (a.id < b.id ? -1 : 1);

describe('UserController (e2e)', () => {
  describe('get user list', () => {
    it('should return user list', async () => {
      const { body } = await request.get('/users/list').expect(200);
      expect(body.sort(sort)).toEqual([
        { id: '1', username: 'One' },
        { id: '2', username: 'Two' },
        { id: '3', username: 'Three' },
      ]);
    });
  });
});
