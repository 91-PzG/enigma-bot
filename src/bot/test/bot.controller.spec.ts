import { Test, TestingModule } from '@nestjs/testing';
import { BotController } from '../bot.controller';
import { AttendanceCommand } from '../commands/attendance.command';

describe('BotController', () => {
  let botController: BotController;
  let attendanceCommand: jest.Mocked<AttendanceCommand>;

  beforeEach(async () => {
    const attendanceCommandeMock: Partial<AttendanceCommand> = {
      attendanceCommand: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AttendanceCommand, useValue: attendanceCommandeMock }, BotController],
    }).compile();

    botController = module.get<BotController>(BotController);
    attendanceCommand = module.get(AttendanceCommand);
  });

  it('should be defined', () => {
    expect(botController).toBeDefined();
  });

  describe('setAttendance', () => {
    it('should call attendanceCommand with correct values', () => {
      const eventId = 5;
      const socket = '127.0.0.1:5555';
      botController.setAttendance(eventId, socket);
      expect(attendanceCommand.attendanceCommand).toHaveBeenCalledWith(eventId, socket);
    });

    it('should return value returned from attendanceCommand  ', () => {
      expect.assertions(1);
      const eventId = 5;
      const socket = '127.0.0.1:5555';
      const resolvedValue = 'resolvedValue';
      attendanceCommand.attendanceCommand.mockResolvedValue(resolvedValue);
      botController.setAttendance(eventId, socket).then((value) => {
        expect(value).toEqual(resolvedValue);
      });
    });
  });
});
