import { AuthCredentialsDto } from '../../src/auth/dtos/auth-credentials.dto';
import request from './request';

describe('EventController (e2e)', () => {
  let token: string;

  beforeAll(async () => {
    const data: AuthCredentialsDto = {
      username: 'One',
      password: 'Test123',
    };
    const { body } = await request.post('/auth/password').send(data);
    token = body.accessToken;
  });

  describe('get event', () => {
    it("should throw a 404 if event doesn't exist", async () => {
      return await request.get('/events/0').expect(404);
    });
    it('should return event', async () => {
      const { body } = await request.get('/events/1').expect(200);
      expect(body).toEqual({
        id: 1,
        name: 'Event #1',
        description: 'Description for Event #1',
        date: '2020-07-31T18:00:00.000Z',
        registerByDate: '2020-07-31T18:00:00.000Z',
        playerCount: 0,
        mandatory: true,
        locked: false,
        closed: false,
        channelName: 'channel1',
        rounds: null,
        hllMap: null,
        commander: null,
        moderator: null,
        duration: null,
        meetingPoint: null,
        server: null,
        password: null,
        maxPlayerCount: null,
        briefing: null,
        autoPublishDate: null,
        organisator: 'One',
      });
    });
  });

  describe('getAll', () => {
    it('should return event', async () => {
      const { body } = await request.get('/events').expect(200);
      expect(body).toEqual([
        {
          id: 1,
          name: 'Event #1',
          description: 'Description for Event #1',
          date: '2020-07-31T18:00:00.000Z',
          registerByDate: '2020-07-31T18:00:00.000Z',
          playerCount: 0,
          locked: false,
          closed: false,
          maxPlayerCount: null,
        },
        {
          id: 2,
          name: 'Event #2',
          description: 'Description for Event #2',
          date: '2020-06-20T18:00:00.000Z',
          registerByDate: '2020-06-20T18:00:00.000Z',
          playerCount: 1,
          locked: true,
          closed: true,
          maxPlayerCount: null,
        },
      ]);
    });
  });
});
