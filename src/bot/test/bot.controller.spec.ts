import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from '../attendance.service';
import { BotController } from '../bot.controller';

describe('BotController', () => {
  let botController: BotController;
  let attendanceService: jest.Mocked<AttendanceService>;

  beforeEach(async () => {
    const attendanceServiceMock: Partial<AttendanceService> = {
      attendanceCommand: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BotController, { provide: AttendanceService, useValue: attendanceServiceMock }],
    }).compile();

    botController = module.get<BotController>(BotController);
    attendanceService = module.get(AttendanceService);
  });

  it('should be defined', () => {
    expect(botController).toBeDefined();
  });

  describe('setAttendance', () => {
    it('should call attendanceCommand with correct values', () => {
      const eventId = 5;
      const socket = '127.0.0.1:5555';
      botController.setAttendance(eventId, socket);
      expect(attendanceService.attendanceCommand).toHaveBeenCalledWith(eventId, socket);
    });

    it('should return value returned from attendanceCommand  ', () => {
      expect.assertions(1);
      const eventId = 5;
      const socket = '127.0.0.1:5555';
      const resolvedValue = 'resolvedValue';
      attendanceService.attendanceCommand.mockResolvedValue(resolvedValue);
      botController.setAttendance(eventId, socket).then((value) => {
        expect(value).toEqual(resolvedValue);
      });
    });
  });
});
