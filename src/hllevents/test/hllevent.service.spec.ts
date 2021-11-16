import { Test, TestingModule } from '@nestjs/testing';
import { DiscordService } from '../../discord/discord.service';
import { EnrolmentsService } from '../../enrolments/enrolments.service';
import { Contact, HLLEvent, IHLLEvent, Member } from '../../typeorm/entities';
import { UsersService } from '../../users/users.service';
import { HLLEventsDiscordService } from '../discord/hllevent-discord.service';
import { HLLEventCreateWrapperDto } from '../dtos/hlleventCreate.dto';
import { HLLEventUpdateWrapperDto } from '../dtos/hlleventUpdate.dto';
import { HLLEventRepository } from '../hllevent.repository';
import { HLLEventService } from '../hllevent.service';

describe('HLLEventService', () => {
  let eventRepository: jest.Mocked<HLLEventRepository>;
  let usersService: jest.Mocked<UsersService>;
  let discordService: jest.Mocked<DiscordService>;
  let enrolmentService: jest.Mocked<EnrolmentsService>;
  let hllEventService: HLLEventService;
  const events = [
    {
      id: 1,
      name: 'Freundschaftsspiel gegen 38.',
      date: new Date(),
      description: 'Freundschaftsspiel gegen 38. Beschreibung',
      locked: false,
      closed: false,
      playerCount: 32,
      registerByDate: new Date(),
      mandatory: true,
      maxPlayerCount: 5,
      organisator: new Contact(),
    },
    {
      id: 1,
      name: 'Freundschaftsspiel gegen 38.',
      date: new Date(),
      description: 'Freundschaftsspiel gegen 38. Beschreibung',
      locked: false,
      closed: false,
      playerCount: 32,
      registerByDate: new Date(),
      mandatory: true,
      maxPlayerCount: 5,
      organisator: new Contact(),
    },
  ];

  beforeEach(async () => {
    const hllEventRepositoryMock: Partial<HLLEventRepository> = {
      getAll: jest.fn(),
      getEventById: jest.fn(),
      save: jest.fn().mockResolvedValue({ id: 5 }),
    };
    const userServiceMock: Partial<UsersService> = { getMemberById: jest.fn() };
    const hllEventDiscordServiceMock: Partial<HLLEventsDiscordService> = {
      publishMessages: jest.fn(),
      updateInformationMessage: jest.fn(),
    };
    const enrolmentServiceMock: Partial<EnrolmentsService> = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HLLEventService,
        {
          provide: HLLEventRepository,
          useValue: hllEventRepositoryMock,
        },
        {
          provide: HLLEventsDiscordService,
          useValue: hllEventDiscordServiceMock,
        },
        {
          provide: UsersService,
          useValue: userServiceMock,
        },
        {
          provide: HLLEventsDiscordService,
          useValue: hllEventDiscordServiceMock,
        },
        { provide: EnrolmentsService, useValue: enrolmentServiceMock },
      ],
    }).compile();

    hllEventService = module.get(HLLEventService);
    eventRepository = module.get(HLLEventRepository);
    usersService = module.get(UsersService);
    discordService = module.get(HLLEventsDiscordService);
    enrolmentService = module.get(EnrolmentsService);
  });

  it('should be defined', () => {
    expect(hllEventService).toBeDefined();
  });

  describe('get Event list', () => {
    it('should get all events', async function () {
      eventRepository.getAll.mockResolvedValue(events as IHLLEvent[]);
      const eventList = await hllEventService.getAll();

      expect(eventList).toBe(events);
    });
  });

  describe('get Event by id', () => {
    it('should throw notFoundException if event not found', async function () {
      expect.assertions(1);
      eventRepository.getEventById.mockResolvedValue(undefined);

      await hllEventService.getEventById(3).catch((e) => {
        expect(e).toEqual(Error("Event with id '3' not found."));
      });
    });

    it('should get event by id ', async function () {
      const event = {
        id: 1,
        name: 'name',
        description: 'description',
        date: new Date(),
        registerByDate: new Date(),
        playerCount: 10,
        organisator: new Contact(),
        mandatory: true,
        locked: false,
        closed: true,
        rounds: 5,
        hllMap: 'map',
        commander: 'string',
        moderator: 'string',
        duration: '15min',
        meetingPoint: 'string',
        server: 'string',
        password: 'string',
        maxPlayerCount: 10,
        briefing: new Date(),
        singlePool: true,
      };
      eventRepository.getEventById.mockResolvedValue(event as HLLEvent);
      const foundEvent = await hllEventService.getEventById(5);

      expect(foundEvent).toBe(event);
      expect(eventRepository.getEventById).toBeCalled();
    });
  });

  describe('patch Event', () => {
    it('should reject if event is invalid', async function () {
      expect.assertions(1);
      hllEventService.getEventById = jest.fn().mockRejectedValue('Event Not found');

      return expect(hllEventService.patchEvent(1, {} as HLLEventUpdateWrapperDto)).rejects.toBe(
        'Event Not found',
      );
    });

    it('should reject if organisator is invalid', async function () {
      expect.assertions(1);
      hllEventService.getEventById = jest.fn().mockResolvedValue({});
      usersService.getMemberById.mockRejectedValue('user not found');

      return expect(
        hllEventService.patchEvent(1, {
          control: { organisator: 'hans' },
        } as HLLEventUpdateWrapperDto),
      ).rejects.toEqual(new Error('Invalid Organisator'));
    });

    it('should call save with correct values', async function () {
      const event = {
        save: jest.fn(),
      };
      const data = {
        description: 'des',
        name: 'name',
        maxPlayerCount: 5,
      };
      hllEventService.getEventById = jest.fn().mockResolvedValue(event);

      await hllEventService.patchEvent(1, {
        data,
        control: {},
      } as HLLEventUpdateWrapperDto);

      expect(event).toEqual({
        ...event,
        ...data,
      });
    });
  });

  describe('create Event', () => {
    let event: { save: jest.Mock };

    beforeEach(() => {
      event = { save: jest.fn().mockResolvedValue({ id: 45 }) };
      eventRepository.create = jest.fn().mockReturnValue(event);
    });

    it('should reject if organisator is invalid', async function () {
      expect.assertions(1);
      usersService.getMemberById.mockRejectedValue('user not found');

      return expect(
        hllEventService.createEvent({
          control: { organisator: 'hans' },
        } as HLLEventCreateWrapperDto),
      ).rejects.toEqual(new Error('Invalid Organisator'));
    });

    it('should call save with correct values', async function () {
      const data = {
        description: 'des',
        name: 'name',
        maxPlayerCount: 5,
      };
      const member = { id: '25435345634' } as Member;

      usersService.getMemberById.mockResolvedValue(member);

      await hllEventService.createEvent({
        data,
        control: { organisator: 'any' },
      } as HLLEventCreateWrapperDto);

      expect(event).toEqual({
        ...data,
        organisatorId: member.id,
        save: event.save,
      });
    });
  });
});
