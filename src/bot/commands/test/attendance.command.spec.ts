import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommandInteraction } from 'discord.js';
import { query, QueryResult } from 'gamedig';
import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { Enrolment, HLLEvent } from '../../../typeorm/entities';
import { AttendanceCommand, AttendanceDto } from '../attendance.command';

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
  let dto: AttendanceDto = {
    eventId: '',
    socket: '',
  };
  const interaction: Partial<CommandInteraction> = {
    reply: jest.fn(),
    valueOf: jest.fn(),
  };
  const ephemeral = true;

  beforeEach(async () => {
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
      dto = { eventId: '39', socket: '300.0.0.1:4322' };
      await attendanceCommand.handler(dto, interaction as CommandInteraction);
      expect(interaction.reply).toHaveBeenLastCalledWith({
        content: 'Ungültiger Socket',
        ephemeral,
      });
    });

    it('should send error message if eventId is NaN', async () => {
      dto = { eventId: '1f', socket: '200.0.0.1:4322' };
      await attendanceCommand.handler(dto, interaction as CommandInteraction);
      expect(interaction.reply).toHaveBeenLastCalledWith({
        content: 'Ungültige Eventid',
        ephemeral,
      });
    });

    it('should send error message if eventId is not in db', async () => {
      dto = { eventId: '10', socket: '200.0.0.1:4322' };
      hllEventRepository.count.mockResolvedValueOnce(0);
      await attendanceCommand.handler(dto, interaction as CommandInteraction);
      expect(interaction.reply).toHaveBeenLastCalledWith({
        content: 'Ungültige Eventid',
        ephemeral,
      });
    });

    it('should send error message if query fails', async () => {
      dto = { eventId: '11', socket: '200.0.0.1:4322' };
      mockedQuery.mockRejectedValueOnce(null);
      await attendanceCommand.handler(dto, interaction as CommandInteraction);
      expect(interaction.reply).toHaveBeenLastCalledWith({
        content: 'Der Server unter 200.0.0.1:4322 kann nicht erreicht werden',
        ephemeral,
      });
    });

    it('should send success message if query succedes', async () => {
      dto = { eventId: '12', socket: '200.0.0.1:4322' };
      await attendanceCommand.handler(dto, interaction as CommandInteraction);
      expect(interaction.reply).toHaveBeenLastCalledWith({
        content: 'Anwesenheit erfolgreich eingetragen',
        ephemeral,
      });
    });
  });

  describe('setAttendance', () => {
    it('should add where clause for eventId', async () => {
      const eventId = '5';
      dto = { eventId, socket: '200.0.0.1:4322' };
      await attendanceCommand.handler(dto, interaction as CommandInteraction);
      expect(enrolmentUpdateQueryBuilder.andWhere).toHaveBeenLastCalledWith('eventId = :eventId', {
        eventId,
      });
    });

    it('should call where with all player names', async () => {
      dto = { eventId: '10', socket: '200.0.0.1:4322' };
      await attendanceCommand.handler(dto, interaction as CommandInteraction);
      for (const player of successfullQuery.players) {
        if (!player.name) continue;
        expect(enrolmentUpdateQueryBuilder.where).toHaveBeenCalledWith('username LIKE :name', {
          name: player.name + '%',
        });
      }
    });
  });
});
