import { Test } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { loadFixtures } from '../fixtures/loader';
import { TestLogger } from './testlogger';

module.exports = () => {
  return new Promise(async (resolve) => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.useLogger(new TestLogger());
    await app.init();
    app.listen(3333);

    if (process.env.NODE_ENV === 'test') {
      const connection = app.get(Connection);
      await connection.synchronize(true);
      await loadFixtures('data', connection);
    }
    //@ts-ignore
    global.__app__ = app;

    resolve('');
  });
};
