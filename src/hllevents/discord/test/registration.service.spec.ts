import { Test, TestingModule } from '@nestjs/testing';
import { EnrolmentsDiscordService } from '../../../enrolments/enrolments-discord.service';
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

  beforeEach(async () => {
    const eventRepositoryMock: Partial<HLLEventRepository> = {
      getEventById: jest.fn(),
    };
    const hllEventsDiscordServiceMock: Partial<HLLEventsDiscordService> = {
      updateEnrolmentMessage: jest.fn(),
    };
    const enrolmentsDiscordServiceMock: Partial<EnrolmentsDiscordService> = {
      enrol: jest.fn(),
    };
    const usersServiceMock: Partial<UsersService> = {
      getActiveMember: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HLLEventsDiscordService,
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

  /*describe('publishMessages', () => {
    let channel: Partial<TextChannel>;
    let informationMessage: string;
    let enrolmentMessage: string;
    let event: Partial<HLLEvent>;

    beforeEach(() => {
      //@ts-ignore
      channel = {
        id: 'idchannel',
        send: jest.fn().mockResolvedValue({ id: 'idone' }).mockResolvedValueOnce({ id: 'idtwo' }),
      };
      event = {
        channelName: 'channelName',
        autoPublishDate: new Date(),
        save: jest.fn().mockResolvedValue(null),
      };
      informationMessage = 'info';
      enrolmentMessage = 'enrolment';
      discordService.createEventChannelIfNotExists = jest.fn().mockResolvedValue(channel);
      informationFactory.createMessage = jest.fn().mockReturnValue(informationMessage);
      enrolmentFactory.createMessage = jest.fn().mockResolvedValue(enrolmentMessage);
      discordRepository.createEntity = jest.fn();
    });

    it('functions should be called with correct values', async () => {
      await service.publishMessages(event as HLLEvent);
      expect(discordService.createEventChannelIfNotExists).toHaveBeenCalledWith(event.channelName);
      expect(channel.send).toHaveBeenCalledWith({ embeds: [informationMessage] });
      expect(channel.send).toHaveBeenCalledWith({ embeds: [enrolmentMessage] });
      expect(discordRepository.createEntity).toHaveBeenCalledWith(channel.id, 'idtwo', 'idone');
    });

  });

  describe('updateEnrolmentMessage', () => {
    let oldMessage: Partial<Message>;
    let newMessage: string;
    let event: Partial<HLLEvent>;

    beforeEach(() => {
      //@ts-ignore
      oldMessage = { edit: jest.fn() };
      newMessage = 'newMessage';
      event = {
        discordEventId: 5,
        save: jest.fn(),
      };
      discordRepository.findOne = jest
        .fn()
        .mockResolvedValue({ channelId: 'channelId', enrolmentMsg: 'enrolmentId' });
      discordService.getMessageById = jest.fn().mockResolvedValue(oldMessage);
      enrolmentFactory.createMessage = jest.fn().mockResolvedValue(newMessage);
    });

    it('should return null if discord event is not found', async () => {
      discordRepository.findOne.mockResolvedValueOnce(undefined);
      expect(await service.updateEnrolmentMessage(event as HLLEvent)).toBe(false);
    });
    it('should return null if discord message', async () => {
      discordService.getMessageById.mockRejectedValue(null);
      expect(await service.updateEnrolmentMessage(event as HLLEvent)).toBe(false);
    });
    it('oldMessage edit should be called with new message', async () => {
      expect(await service.updateEnrolmentMessage(event as HLLEvent)).toBe(true);
      expect(oldMessage.edit).toHaveBeenCalledWith({ embeds: [newMessage] });
    });
  });

  describe('updateInformationMessage', () => {
    let oldMessage: Partial<Message>;
    let newMessage: string;
    let event: Partial<HLLEvent>;

    beforeEach(() => {
      //@ts-ignore
      oldMessage = { edit: jest.fn() };
      newMessage = 'newMessage';
      event = {
        discordEventId: 5,
        save: jest.fn(),
      };
      discordRepository.findOne = jest
        .fn()
        .mockResolvedValue({ channelId: 'channelId', enrolmentMsg: 'enrolmentId' });
      discordService.getMessageById = jest.fn().mockResolvedValue(oldMessage);
      informationFactory.createMessage = jest.fn().mockReturnValue(newMessage);
    });

    it('should return null if discord event is not found', async () => {
      discordRepository.findOne.mockResolvedValueOnce(undefined);
      expect(await service.updateInformationMessage(event as HLLEvent)).toBe(false);
    });
    it('should return null if discord message', async () => {
      discordService.getMessageById.mockRejectedValue(null);
      expect(await service.updateInformationMessage(event as HLLEvent)).toBe(false);
    });
    it('oldMessage edit should be called with new message', async () => {
      expect(await service.updateInformationMessage(event as HLLEvent)).toBe(true);
      expect(oldMessage.edit).toHaveBeenCalledWith({ embeds: [newMessage] });
    });
  });

  describe('checkEvents', () => {
    it('should call publish events for all events retured from repo', async () => {
      const events = [
        { organisator: { name: 'abc' }, save: jest.fn() },
        { organisator: { name: 'def' }, save: jest.fn() },
        { organisator: { name: 'ghi' }, save: jest.fn() },
      ];
      service.publishMessages = jest.fn();
      //@ts-ignore
      eventRepository.getPublishableEvents.mockResolvedValue(events); //@ts-ignore
      eventRepository.getLockableEvents.mockResolvedValue(events); //@ts-ignore
      eventRepository.getClosableEvents.mockResolvedValue(events);
      await service.checkEvents();
      events.forEach((event) => {
        expect(service.publishMessages).toHaveBeenCalledWith(event);
      });
    });
  });*/
});
