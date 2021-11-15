import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { query, QueryResult } from 'gamedig';
import { SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { Enrolment } from '../../typeorm/entities';
import { AttendanceService } from '../attendance.service';

jest.mock('gamedig');

const mockedQuery = query as jest.Mock;

describe('AttandanceCommand', () => {
  let attendanceService: AttendanceService;

  const enrolmentUpdateQueryBuilder: Partial<UpdateQueryBuilder<Enrolment>> = {
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };
  const enrolmentQueryBuilder: Partial<SelectQueryBuilder<Enrolment>> = {
    update: jest.fn().mockReturnValue(enrolmentUpdateQueryBuilder),
  };
  const successfullQuery: QueryResult = {
    name: '91.PzG| #1 Warfare only | Mic + GER',
    map: 'foy',
    password: false,
    maxplayers: 100,
    players: [{ name: '91.PzG| Samu' }, { name: '91.PzG| Imo' }, { name: 'Hans' }, {}],
    bots: [],
    connect: '176.57.168.74:28215',
    ping: 15,
  };
  const eventId = 12;
  const socket = '127.0.0.1:5432';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: getRepositoryToken(Enrolment),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(enrolmentQueryBuilder),
          },
        },
      ],
    }).compile();

    attendanceService = module.get<AttendanceService>(AttendanceService);

    mockedQuery.mockResolvedValue(successfullQuery);
  });

  it('should be defined', () => {
    expect(attendanceService).toBeDefined();
  });

  describe('query', () => {
    it('should send query gamedig correctly', async () => {
      await attendanceService.attendanceCommand(eventId, socket);
      const [host, port] = socket.split(':');
      expect(mockedQuery).toHaveBeenCalledWith({ type: 'hll', host, port: parseInt(port, 10) });
    });

    it('should send error message if query fails', async () => {
      expect.assertions(1);
      mockedQuery.mockRejectedValueOnce(null);
      try {
        await attendanceService.attendanceCommand(eventId, socket);
      } catch (error) {
        expect(error.message).toEqual(`Der Server unter ${socket} kann nicht erreicht werden`);
      }
    });
  });

  describe('setAttendance', () => {
    it('should add where clause for eventId', async () => {
      await attendanceService.attendanceCommand(eventId, socket);
      expect(enrolmentUpdateQueryBuilder.andWhere).toHaveBeenLastCalledWith('eventId = :eventId', {
        eventId,
      });
    });

    it('should call where with all player names', async () => {
      await attendanceService.attendanceCommand(eventId, socket);
      for (const player of successfullQuery.players) {
        if (!player.name) continue;
        expect(enrolmentUpdateQueryBuilder.where).toHaveBeenCalledWith('username LIKE :name', {
          name: player.name + '%',
        });
      }
    });
  });
});
