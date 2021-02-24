import { AuthCredentialsDto } from '../../src/auth/dtos/auth-credentials.dto';
import { HLLEventCreateWrapperDto } from '../../src/hllevents/dtos/hlleventCreate.dto';
import { HLLEventUpdateWrapperDto } from '../../src/hllevents/dtos/hlleventUpdate.dto';
import request from './request';

describe('EventController (e2e)', () => {
  let token: string;

  beforeAll(async () => {
    const data: AuthCredentialsDto = {
      username: 'One',
      password: 'Test123',
    };
    const { body } = await request.post('/auth/signin').send(data);
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

  describe('create Event', () => {
    let eventId: number;
    it('should return an id', async () => {
      const data: HLLEventCreateWrapperDto = {
        control: {
          organisator: '1',
          publish: false,
        },
        data: {
          name: 'Event #1',
          description: 'Description for Event #1',
          date: new Date('2020-07-31T18:00:00.000Z'),
          registerByDate: new Date('2020-07-31T18:00:00.000Z'),
          mandatory: true,
          channelName: 'channel1',
          rounds: 1,
          hllMap: 'SMD',
          commander: 'Hans',
          moderator: 'mod',
          duration: '1h',
          meetingPoint: 'here',
          server: 'server',
          password: 'pw',
          maxPlayerCount: 50,
          briefing: new Date('2020-07-31T18:00:00.000Z'),
          autoPublishDate: new Date('2020-07-31T18:00:00.000Z'),
        },
      };
      const { body } = await request
        .post('/events')
        .set('Authorization', 'bearer ' + token)
        .send(data)
        .expect(201);
      eventId = body.id;
    });
    it('event should be retrievable', async () => {
      const createdEvent = {
        organisator: 'One',
        name: 'Event #1',
        description: 'Description for Event #1',
        date: '2020-07-31T18:00:00.000Z',
        registerByDate: '2020-07-31T18:00:00.000Z',
        mandatory: true,
        channelName: 'channel1',
        rounds: 1,
        hllMap: 'SMD',
        commander: 'Hans',
        moderator: 'mod',
        duration: '1h',
        meetingPoint: 'here',
        server: 'server',
        password: 'pw',
        maxPlayerCount: 50,
        briefing: '2020-07-31T18:00:00.000Z',
        autoPublishDate: '2020-07-31T18:00:00.000Z',
        id: 3,
        playerCount: 0,
        locked: false,
        closed: false,
      };
      const { body } = await request.get(`/events/${eventId}`).expect(200);
      expect(body).toEqual(createdEvent);
    });
  });

  describe('patch Event', () => {
    it('should return ok', async () => {
      const data: HLLEventUpdateWrapperDto = {
        control: {
          organisator: '2',
        },
        data: {
          name: 'Event #5',
          description: 'Description for Event #5',
          date: new Date('2020-07-31T16:00:00.000Z'),
          registerByDate: new Date('2020-07-31T16:00:00.000Z'),
          mandatory: false,
          channelName: 'channel1name',
          rounds: 2,
          hllMap: 'Foy',
          commander: 'Susi',
          moderator: 'modi',
          duration: '1d',
          meetingPoint: 'where',
          server: 'server#2',
          password: 'pww',
          maxPlayerCount: 40,
          briefing: new Date('2020-07-29T18:00:00.000Z'),
          autoPublishDate: new Date('2020-07-20T18:00:00.000Z'),
        },
      };
      return await request
        .patch('/events/1')
        .set('Authorization', 'bearer ' + token)
        .send(data)
        .expect(200);
    });
    it('should be modified', async () => {
      const data = {
        id: 1,
        name: 'Event #5',
        description: 'Description for Event #5',
        date: '2020-07-31T16:00:00.000Z',
        registerByDate: '2020-07-31T16:00:00.000Z',
        playerCount: 0,
        mandatory: false,
        locked: false,
        closed: false,
        channelName: 'channel1name',
        rounds: 2,
        hllMap: 'Foy',
        commander: 'Susi',
        moderator: 'modi',
        duration: '1d',
        meetingPoint: 'where',
        server: 'server#2',
        password: 'pww',
        maxPlayerCount: 40,
        briefing: '2020-07-29T18:00:00.000Z',
        autoPublishDate: '2020-07-20T18:00:00.000Z',
        organisator: 'Two',
      };
      const { body } = await request.get('/events/1').expect(200);
      expect(body).toEqual(data);
    });
  });
});
