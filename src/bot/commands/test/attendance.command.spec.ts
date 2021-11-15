import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommandInteraction } from 'discord.js';
import { Repository } from 'typeorm';
import { HLLEvent } from '../../../typeorm/entities';
import { AttendanceService } from '../../attendance.service';
import { AttendanceCommand } from '../attendance.command';
import { AttendanceDto } from '../dto/attendance.dto';

describe('AttandanceCommand', () => {
  let attendanceCommand: AttendanceCommand;
  let hllEventRepository: jest.Mocked<Repository<HLLEvent>>;
  let attendanceService: jest.Mocked<AttendanceService>;
  let dto: AttendanceDto;
  let interaction: Partial<CommandInteraction>;
  const ephemeral = true;

  beforeEach(async () => {
    interaction = {
      reply: jest.fn(),
      valueOf: jest.fn(),
    };
    dto = {
      eventId: '',
      socket: '',
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
          provide: AttendanceService,
          useValue: { attendanceCommand: jest.fn().mockResolvedValue(undefined) },
        },
        AttendanceCommand,
      ],
    }).compile();

    attendanceCommand = module.get<AttendanceCommand>(AttendanceCommand);
    hllEventRepository = module.get(getRepositoryToken(HLLEvent));
    attendanceService = module.get(AttendanceService);
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

    it('should send error message if service fails', async () => {
      dto = { eventId: '11', socket: '200.0.0.1:4322' };
      attendanceService.attendanceCommand.mockRejectedValueOnce({
        message: 'Der Server unter 200.0.0.1:4322 kann nicht erreicht werden',
      });
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
});
