import { INestApplication, LoggerService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HLLEventCreateWrapperDto } from '../src/hllevents/dtos/hllEventCreate.dto';

class TestLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(new TestLogger());
    await app.init();
  });

  afterAll(async () => {
    await Promise.all([app.close()]);
  });

  describe('HLLEvents', () => {
    describe('create event', () => {
      it("should throw a 403 if user isn't signed in", async () => {
        return await request(app.getHttpServer())
          .post('/events')
          .send({})
          .expect(403);
      });
    });

    it('test', async () => {
      const data: HLLEventCreateWrapperDto = {
        control: {
          organisator: '5',
          publish: false,
        },
        data: {
          name: 'name',
          description: 'description',
          date: new Date(),
          registerByDate: new Date(),
          playerCount: 50,
          mandatory: true,
          channelName: 'channel',
        },
      };
      return await request(app.getHttpServer())
        .post('/events')
        .send(data)
        .expect(200);
    });
  });
});
