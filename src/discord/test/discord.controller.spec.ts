import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceCommand } from '../../bot/commands/attendance.command';
import { DiscordController } from '../discord.controller';

describe('DiscordController', () => {
  let discordController: DiscordController;
  let attendanceCommand: jest.Mocked<AttendanceCommand>;

  beforeEach(async () => {
    const attendanceCommandeMock: Partial<AttendanceCommand> = {
      attendanceCommand: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: AttendanceCommand, useValue: attendanceCommandeMock },
        DiscordController,
      ],
    }).compile();

    discordController = module.get<DiscordController>(DiscordController);
    attendanceCommand = module.get(AttendanceCommand);
  });

  it('should be defined', () => {
    expect(discordController).toBeDefined();
  });

  describe('setAttendance', () => {
    it('should call attendanceCommand with correct values', () => {
      const eventId = 5;
      const socket = '127.0.0.1:5555';
      discordController.setAttendance(eventId, socket);
      expect(attendanceCommand.attendanceCommand).toHaveBeenCalledWith(eventId, socket);
    });

    it('should return value returned from attendanceCommand  ', () => {
      expect.assertions(1);
      const eventId = 5;
      const socket = '127.0.0.1:5555';
      const resolvedValue = 'resolvedValue';
      attendanceCommand.attendanceCommand.mockResolvedValue(resolvedValue);
      discordController.setAttendance(eventId, socket).then((value) => {
        expect(value).toEqual(resolvedValue);
      });
    });
  });
});
