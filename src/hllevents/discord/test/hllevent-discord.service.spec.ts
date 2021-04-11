import { Test, TestingModule } from '@nestjs/testing';
import { Message, TextChannel } from 'discord.js';
import { DiscordService } from '../../../discord/discord.service';
import { HLLEvent } from '../../../postgres/entities';
import { HLLEventRepository } from '../../hllevent.repository';
import { HLLDiscordEventRepository } from '../hlldiscordevent.repository';
import { HLLEventsDiscordService } from '../hllevent-discord.service';
import { EnrolmentMessageFactory } from '../messages/enrolmentMessage.factory';
import { InformationMessageFactory } from '../messages/informationMessage.factory';
import { RegistrationManager } from '../registration/registration.manager';

describe('HLLEventDiscordService', () => {
  let service: HLLEventsDiscordService;
  let discordService: jest.Mocked<DiscordService>;
  let discordRepository: jest.Mocked<HLLDiscordEventRepository>;
  let eventRepository: jest.Mocked<HLLEventRepository>;
  let informationFactory: jest.Mocked<InformationMessageFactory>;
  let enrolmentFactory: jest.Mocked<EnrolmentMessageFactory>;

  beforeEach(async () => {
    const discordServiceMock: Partial<DiscordService> = {
      createEventChannelIfNotExists: jest.fn(),
      getMessageById: jest.fn(),
    };
    const discordRepositoryMock: Partial<HLLDiscordEventRepository> = {
      createEntity: jest.fn(),
      findOne: jest.fn(),
    };
    const eventRepositoryMock: Partial<HLLEventRepository> = {
      getPublishableEvents: jest.fn(),
    };
    const informationFactoryMock: Partial<InformationMessageFactory> = {
      createMessage: jest.fn(),
    };
    const enrolmentFactoryMock: Partial<EnrolmentMessageFactory> = {
      createMessage: jest.fn(),
    };
    const registrationManagerMock: Partial<RegistrationManager> = {
      addEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HLLEventsDiscordService,
        {
          provide: RegistrationManager,
          useValue: registrationManagerMock,
        },
        {
          provide: DiscordService,
          useValue: discordServiceMock,
        },
        {
          provide: HLLDiscordEventRepository,
          useValue: discordRepositoryMock,
        },
        {
          provide: HLLEventRepository,
          useValue: eventRepositoryMock,
        },
        {
          provide: InformationMessageFactory,
          useValue: informationFactoryMock,
        },
        {
          provide: EnrolmentMessageFactory,
          useValue: enrolmentFactoryMock,
        },
      ],
    }).compile();

    service = module.get<HLLEventsDiscordService>(HLLEventsDiscordService);
    eventRepository = module.get(HLLEventRepository);
    discordRepository = module.get(HLLDiscordEventRepository);
    discordService = module.get(DiscordService);
    informationFactory = module.get(InformationMessageFactory);
    enrolmentFactory = module.get(EnrolmentMessageFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishMessages', () => {
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
        save: jest.fn(),
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
      expect(channel.send).toHaveBeenCalledWith(informationMessage);
      expect(channel.send).toHaveBeenCalledWith(enrolmentMessage);
      expect(discordRepository.createEntity).toHaveBeenCalledWith(channel.id, 'idtwo', 'idone');
    });

    /*it('should remove publishdate from event', () => {
      service.publishMessages(event as HLLEvent);
      expect(event.save).toHaveBeenCalled();
    });*/
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
      expect(oldMessage.edit).toHaveBeenCalledWith(newMessage);
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
      expect(oldMessage.edit).toHaveBeenCalledWith(newMessage);
    });
  });

  describe('checkEvents', () => {
    it('should call publish events for all events retured from repo', async () => {
      const events = [
        { organisator: { name: 'abc' } },
        { organisator: { name: 'def' } },
        { organisator: { name: 'ghi' } },
      ];
      service.publishMessages = jest.fn();
      //@ts-ignore
      eventRepository.getPublishableEvents.mockResolvedValue(events);
      await service.checkEvents();
      events.forEach((event) => {
        expect(service.publishMessages).toHaveBeenCalledWith(event);
      });
    });
  });
});
