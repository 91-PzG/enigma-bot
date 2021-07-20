import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Message, ReactionCollector, User } from 'discord.js';
import { EnrolmentsDiscordService } from '../../../../enrolments/enrolments-discord.service';
import { Division, EnrolmentType, HLLEvent, Member } from '../../../../postgres/entities';
import { RegistrationDialog } from '../registration.dialog';

describe('RegistrationDialog', () => {
  let dialog: RegistrationDialog;
  let enrolmentService: jest.Mocked<EnrolmentsDiscordService>;

  beforeEach(async () => {
    const enrolmentsServiceMock: Partial<EnrolmentsDiscordService> = {
      enrol: jest.fn(),
    };
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockReturnValue({
        color: '#0099ff',
        baseUrl: 'https://enigma.91pzg.de/',
        thumbnail:
          'https://cdn.discordapp.com/attachments/681550848526123037/737341017761775738/attachmentLogo.png',
        squadleadEmoji: '💂',
        commanderEmoji: '🤠',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EnrolmentsDiscordService,
          useValue: enrolmentsServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        RegistrationDialog,
      ],
    }).compile();

    dialog = module.get<RegistrationDialog>(RegistrationDialog);
    enrolmentService = module.get(EnrolmentsDiscordService);
  });

  it('should be defined', () => {
    expect(dialog).toBeDefined();
  });

  describe('fail enrolment', () => {
    const eventMock: Partial<HLLEvent> = { id: 1 };
    const memberMock: Partial<Member> = { division: Division.ARMOR };
    let userMock: Partial<User> = {
      send: jest.fn(),
      valueOf: jest.fn(),
    };
    const defaultArguments: [User, HLLEvent, Member] = [
      userMock as User,
      eventMock as HLLEvent,
      memberMock as Member,
    ];

    beforeEach(() => {
      jest.resetAllMocks();
      enrolmentService.enrol.mockRejectedValue(null);
    });

    it('should reject if enrol fails', () => {
      expect.assertions(2);
      return dialog.startDialog(EnrolmentType.ABMELDUNG, ...defaultArguments).catch((reject) => {
        expect(reject).toBeUndefined();
        expect(userMock.send).toHaveBeenLastCalledWith(
          'Es ist ein Fehler aufgetreten!\nBitte informiere einen Admin',
        );
      });
    });

    it('should reject on timeout', async () => {
      expect.assertions(2);
      jest.useFakeTimers();
      const collectorMock: Partial<ReactionCollector> = {
        stop: jest.fn(),
        on: jest.fn().mockImplementation(() => {
          jest.runAllTimers();
        }),
      };
      const messageMock: Partial<Message> = {
        react: jest.fn(),
        createReactionCollector: jest.fn().mockReturnValue(collectorMock),
        valueOf: jest.fn(),
      };
      userMock.send = jest.fn().mockReturnValueOnce(messageMock);
      return dialog
        .startDialog(
          EnrolmentType.ANMELDUNG,
          userMock as User,
          eventMock as HLLEvent,
          memberMock as Member,
        )
        .catch((fail) => {
          expect(fail).toBeUndefined();
          expect(userMock.send).toHaveBeenLastCalledWith('Zeitlimit überschritten');
        });
    });

    it('should send error message', async () => {
      expect.assertions(1);
      return dialog.startDialog(EnrolmentType.ABMELDUNG, ...defaultArguments).catch(() => {
        expect(userMock.send).toHaveBeenLastCalledWith(
          'Es ist ein Fehler aufgetreten!\nBitte informiere einen Admin',
        );
      });
    });
  });
});
