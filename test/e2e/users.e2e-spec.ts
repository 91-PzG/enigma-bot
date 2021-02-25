import { UserListDto } from '../../src/users/dto/user-list.dto';
import request from './request';

const sort = (a: UserListDto, b: UserListDto) => (a.id < b.id ? -1 : 1);

describe('UserController (e2e)', () => {
  let hr, eventOrga, signIn, clanrat;

  beforeAll(() => {
    //@ts-ignore
    eventOrga = global.__eventOrga;
    //@ts-ignore
    hr = global.__hr;
    //@ts-ignore
    signIn = global.__signIn;
    //@ts-ignore
    clanrat = global.__clanrat;
  });

  describe('get user list', () => {
    it('should return user list', async () => {
      const { body } = await request.get('/users/list').expect(200);
      expect(body.sort(sort)).toEqual([
        { id: 'changePw', username: 'ChangePw' },
        { id: 'noPw', username: 'NoPw' },
        { id: 'signIn', username: 'SignIn' },
      ]);
    });
  });

  describe('get member by id', () => {
    it('should return plain user', async () => {
      const { body } = await request.get('/users/signIn').expect(200);
      expect(body).toEqual({
        id: 'signIn',
        recruitSince: '2020-07-31T18:00:00.000Z',
        recruitTill: null,
        memberSince: null,
        memberTill: null,
        reserve: false,
        avatar: null,
        honoraryMember: false,
        division: 'infanterie',
        rank: 'soldier',
        roles: ['member'],
        contact: { name: 'SignIn' },
      });
    });
    it('should return user with missed events if user is member or user is eventorga', async () => {
      const result = {
        id: 'signIn',
        recruitSince: '2020-07-31T18:00:00.000Z',
        recruitTill: null,
        memberSince: null,
        memberTill: null,
        reserve: false,
        avatar: null,
        honoraryMember: false,
        division: 'infanterie',
        rank: 'soldier',
        roles: ['member'],
        contact: { name: 'SignIn' },
        missedEvents: 5,
        missedConsecutiveEvents: 3,
      };
      let body = await (
        await request
          .get('/users/signIn')
          .set('Authorization', 'bearer ' + signIn)
          .expect(200)
      ).body;
      expect(body).toEqual(result);
      body = await (
        await request
          .get('/users/signIn')
          .set('Authorization', 'bearer ' + eventOrga)
          .expect(200)
      ).body;
      expect(body).toEqual(result);
    });
    it('should return full user if user is hr or clanrat', async () => {
      const result = {
        id: 'signIn',
        recruitSince: '2020-07-31T18:00:00.000Z',
        recruitTill: null,
        memberSince: null,
        memberTill: null,
        reserve: false,
        avatar: null,
        honoraryMember: false,
        division: 'infanterie',
        rank: 'soldier',
        roles: ['member'],
        contact: {
          name: 'SignIn',
          comment: 'SignIn ist ein sehr aktiver Spieler!',
        },
        missedEvents: 5,
        missedConsecutiveEvents: 3,
      };
      let body = await (
        await request
          .get('/users/signIn')
          .set('Authorization', 'bearer ' + clanrat)
          .expect(200)
      ).body;
      expect(body).toEqual(result);
      body = await (
        await request
          .get('/users/signIn')
          .set('Authorization', 'bearer ' + hr)
          .expect(200)
      ).body;
      expect(body).toEqual(result);
    });
  });
});
