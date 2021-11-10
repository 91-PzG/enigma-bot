import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message, TextChannel } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { Enrolment, HLLEvent } from '../../../postgres/entities';
import { DiscordService } from '../../discord.service';
import { AttendanceCommand } from '../attendance.command';

jest.mock('gamedig');

const mockedQuery = query as jest.Mock;

describe('AttandanceCommand', () => {
  let attendanceCommand: AttendanceCommand;
  let hllEventRepository: jest.Mocked<Repository<HLLEvent>>;
  let enrolmentRepository: jest.Mocked<Repository<Enrolment>>;

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
  const channel: Partial<TextChannel> = {
    send: jest.fn().mockResolvedValue({ delete: jest.fn() }),
    valueOf: jest.fn(),
    toString: jest.fn(),
  };
  const message: Partial<Message> = {
    channel: channel as TextChannel,
    valueOf: jest.fn(),
  };

  beforeEach(async () => {
    const discordServiceMock: Partial<DiscordService> = {
      getClanMembers: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(HLLEvent),
          useValue: {
            count: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: getRepositoryToken(Enrolment),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(enrolmentQueryBuilder),
          },
        },
        AttendanceCommand,
      ],
    }).compile();

    attendanceCommand = module.get<AttendanceCommand>(AttendanceCommand);
    hllEventRepository = module.get(getRepositoryToken(HLLEvent));
    enrolmentRepository = module.get(getRepositoryToken(Enrolment));

    mockedQuery.mockResolvedValue(successfullQuery);
  });

  it('should be defined', () => {
    expect(attendanceCommand).toBeDefined();
  });

  describe('attendanceCommandDiscordWrapper', () => {
    it('should send error message if socket is invalid', async () => {
      message.content = '!anwesend 39 300.0.0.1:4322';
      await attendanceCommand.attendanceCommandDiscordWrapper(message as Message);
      expect(channel.send).toHaveBeenLastCalledWith('Ungültiger Socket');
    });

    it('should send error message if eventId is NaN', async () => {
      message.content = '!anwesend 1f 200.0.0.1:4322';
      await attendanceCommand.attendanceCommandDiscordWrapper(message as Message);
      expect(channel.send).toHaveBeenLastCalledWith('Ungültige Eventid');
    });

    it('should send error message if eventId is not in db', async () => {
      message.content = '!anwesend 10 200.0.0.1:4322';
      hllEventRepository.count.mockResolvedValueOnce(0);
      await attendanceCommand.attendanceCommandDiscordWrapper(message as Message);
      expect(channel.send).toHaveBeenLastCalledWith('Ungültige Eventid');
    });

    it('should send error message if query fails', async () => {
      message.content = '!anwesend 11 200.0.0.1:4322';
      mockedQuery.mockRejectedValueOnce(null);
      await attendanceCommand.attendanceCommandDiscordWrapper(message as Message);
      expect(channel.send).toHaveBeenLastCalledWith(
        `Der Server unter 200.0.0.1:4322 kann nicht erreicht werden`,
      );
    });

    it('should send success message if query succedes', async () => {
      message.content = '!anwesend 12 200.0.0.1:4322';
      await attendanceCommand.attendanceCommandDiscordWrapper(message as Message);
      expect(channel.send).toHaveBeenLastCalledWith('Anwesenheit erfolgreich eingetragen');
    });
  });

  describe('setAttendance', () => {
    it('should add where clause for eventId', async () => {
      const eventId = 5;
      message.content = `!anwesend ${eventId} 200.0.0.1:4322`;
      await attendanceCommand.attendanceCommandDiscordWrapper(message as Message);
      expect(enrolmentUpdateQueryBuilder.andWhere).toHaveBeenLastCalledWith('eventId = :eventId', {
        eventId,
      });
    });

    it('should call where with all player names', async () => {
      message.content = '!anwesend 10 200.0.0.1:4322';
      await attendanceCommand.attendanceCommandDiscordWrapper(message as Message);
      for (const player of successfullQuery.players) {
        if (!player.name) continue;
        expect(enrolmentUpdateQueryBuilder.where).toHaveBeenCalledWith('username LIKE :name', {
          name: player.name + '%',
        });
      }
    });
  });
});
