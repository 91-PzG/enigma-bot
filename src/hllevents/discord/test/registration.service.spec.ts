import { Test, TestingModule } from '@nestjs/testing';
import { ButtonInteraction, InteractionReplyOptions, User } from 'discord.js';
import { EnrolByDiscordDto } from '../../../enrolments/dto/enrolByDiscord.dto';
import { EnrolmentsDiscordService } from '../../../enrolments/enrolments-discord.service';
import { Division, EnrolmentType, HLLEvent, Member } from '../../../typeorm/entities';
import { UsersService } from '../../../users/users.service';
import { HLLEventRepository } from '../../hllevent.repository';
import { HLLEventsDiscordService } from '../hllevent-discord.service';
import { RegistrationService } from '../registration.service';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let eventRepository: jest.Mocked<HLLEventRepository>;
  let hllEventsDiscordService: jest.Mocked<HLLEventsDiscordService>;
  let enrolmentsDiscordService: jest.Mocked<EnrolmentsDiscordService>;
  let usersService: jest.Mocked<UsersService>;
  let interaction: jest.Mocked<Partial<ButtonInteraction>>;
  let reply: InteractionReplyOptions;
  let event: Partial<HLLEvent>;
  let member: Partial<Member>;

  beforeEach(async () => {
    interaction = {
      reply: jest.fn(),
      customId: '12-register',
      user: {
        id: '1234',
      } as User,
      valueOf: jest.fn(),
    };
    reply = {
      ephemeral: true,
    };
    event = {
      locked: false,
      closed: false,
      id: 5,
    };
    member = {
      division: Division.INFANTERIE,
    };

    const eventRepositoryMock: Partial<HLLEventRepository> = {
      getEventById: jest.fn().mockResolvedValue(event),
    };
    const hllEventsDiscordServiceMock: Partial<HLLEventsDiscordService> = {
      updateEnrolmentMessage: jest.fn().mockResolvedValue(undefined),
    };
    const enrolmentsDiscordServiceMock: Partial<EnrolmentsDiscordService> = {
      enrol: jest.fn().mockResolvedValue(undefined),
    };
    const usersServiceMock: Partial<UsersService> = {
      getActiveMember: jest.fn().mockResolvedValue(member as Member),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: HLLEventRepository,
          useValue: eventRepositoryMock,
        },
        {
          provide: HLLEventsDiscordService,
          useValue: hllEventsDiscordServiceMock,
        },
        {
          provide: EnrolmentsDiscordService,
          useValue: enrolmentsDiscordServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    eventRepository = module.get(HLLEventRepository);
    hllEventsDiscordService = module.get(HLLEventsDiscordService);
    enrolmentsDiscordService = module.get(EnrolmentsDiscordService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    describe('event error handling', () => {
      describe('event not found error handling', () => {
        beforeEach(() => {
          reply.content = 'Event konnte nicht gefunden werden';
        });

        it('should throw error if eventId is NaN', async () => {
          interaction.customId = 'a-squadlead-register';
          await service.register(interaction as unknown as ButtonInteraction);
          expect(interaction.reply).toHaveBeenCalledWith(reply);
        });

        it('should throw error if event is not found', async () => {
          eventRepository.getEventById.mockResolvedValueOnce(undefined);
          await service.register(interaction as unknown as ButtonInteraction);
          expect(interaction.reply).toHaveBeenCalledWith(reply);
        });
      });

      describe('event invalid error handling', () => {
        beforeEach(() => {
          reply.content = `Du kannst dich bei Event #${event.id} nicht mehr anmelden`;
        });

        it('should throw error if event is closed', async () => {
          event.closed = true;
          await service.register(interaction as unknown as ButtonInteraction);
          expect(interaction.reply).toHaveBeenCalledWith(reply);
          expect(hllEventsDiscordService.updateEnrolmentMessage).toHaveBeenCalledWith(
            event,
            interaction,
          );
        });

        it('should throw error if event is locked and user tries to register', async () => {
          event.locked = true;
          await service.register(interaction as unknown as ButtonInteraction);
          expect(interaction.reply).toHaveBeenCalledWith(reply);
          expect(hllEventsDiscordService.updateEnrolmentMessage).toHaveBeenCalledWith(
            event,
            interaction,
          );
        });
      });
    });

    describe('member error handling', () => {
      it('should not enrol if member is not found', async () => {
        usersService.getActiveMember.mockResolvedValue(undefined);
        await service.register(interaction as unknown as ButtonInteraction);
        expect(enrolmentsDiscordService.enrol).toHaveBeenCalledTimes(0);
      });
    });

    describe('enrolment error handling', () => {
      it('should send error if enrol fails', async () => {
        enrolmentsDiscordService.enrol.mockRejectedValue(undefined);
        reply.content = 'Fehler bei der Anmeldung. Bitte versuche es später erneut';
        await service.register(interaction as unknown as ButtonInteraction);
        expect(interaction.reply).toHaveBeenCalledWith(reply);
      });
    });

    describe('message update error handling', () => {
      it('should send error if message update fails', async () => {
        reply.content = 'Fehler beim update der Nachricht. Deine Anmeldung wurde erfasst';
        hllEventsDiscordService.updateEnrolmentMessage.mockRejectedValue(undefined);
        await service.register(interaction as unknown as ButtonInteraction);
        expect(interaction.reply).toHaveBeenCalledWith(reply);
      });
    });

    describe('success message', () => {
      it('should send success message', async () => {
        reply.content = 'Du hast dich erfolgreich angemeldet!';
        await service.register(interaction as unknown as ButtonInteraction);
        expect(interaction.reply).toHaveBeenCalledWith(reply);
      });
    });

    describe('dto tests', () => {
      let dto: EnrolByDiscordDto;
      beforeEach(() => {
        dto = {
          type: EnrolmentType.ANMELDUNG,
          eventId: event.id,
          member: member as Member,
          division: member.division,
          squadlead: false,
          commander: false,
        };
      });

      it('should set cancel enrolment type correctly correctly', async () => {
        interaction.customId = '12-cancel-register';
        await service.register(interaction as unknown as ButtonInteraction);
        dto.type = EnrolmentType.ABMELDUNG;
        expect(enrolmentsDiscordService.enrol).toHaveBeenCalledWith(dto);
      });

      it('should set no role correctly', async () => {
        await service.register(interaction as unknown as ButtonInteraction);
        expect(enrolmentsDiscordService.enrol).toHaveBeenCalledWith(dto);
      });

      it('should set squadlead role correctly', async () => {
        interaction.customId = '12-squadlead-register';
        await service.register(interaction as unknown as ButtonInteraction);
        dto.squadlead = true;
        expect(enrolmentsDiscordService.enrol).toHaveBeenCalledWith(dto);
      });

      it('should set commander role correctly', async () => {
        interaction.customId = '12-commander-register';
        await service.register(interaction as unknown as ButtonInteraction);
        dto.commander = true;
        expect(enrolmentsDiscordService.enrol).toHaveBeenCalledWith(dto);
      });
    });
  });
});
