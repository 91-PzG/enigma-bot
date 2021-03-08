import { Test, TestingModule } from '@nestjs/testing';
import { Contact, HLLEvent, IHLLEvent, Member } from '../../postgres/entities';
import { UsersService } from '../../users/users.service';
import { HLLEventCreateWrapperDto } from '../dtos/hlleventCreate.dto';
import { HLLEventUpdateWrapperDto } from '../dtos/hlleventUpdate.dto';
import { HLLEventRepository } from '../hllevent.repository';
import { HLLEventService } from '../hllevent.service';

describe('HLLEventService', () => {
  let service: HLLEventService;
  let repository: jest.Mocked<HLLEventRepository>;
  let usersService: jest.Mocked<UsersService>;
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
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HLLEventService,
        {
          provide: HLLEventRepository,
          useValue: hllEventRepositoryMock,
        },
        {
          provide: UsersService,
          useValue: {
            getMemberById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(HLLEventService);
    repository = module.get(HLLEventRepository);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('get Event list', () => {
    it('should get all events', async function () {
      repository.getAll.mockResolvedValue(events as IHLLEvent[]);
      const eventList = await service.getAll();

      expect(eventList).toBe(events);
    });
  });

  describe('get Event by id', () => {
    it('should throw notFoundException if event not found', async function () {
      expect.assertions(1);
      repository.getEventById.mockResolvedValue(undefined);

      await service.getEventById(3).catch((e) => {
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
      repository.getEventById.mockResolvedValue(event as HLLEvent);
      const foundEvent = await service.getEventById(5);

      expect(foundEvent).toBe(event);
      expect(repository.getEventById).toBeCalled();
    });
  });

  describe('patch Event', () => {
    it('should reject if event is invalid', async function () {
      expect.assertions(1);
      service.getEventById = jest.fn().mockRejectedValue('Event Not found');

      return expect(service.patchEvent(1, {} as HLLEventUpdateWrapperDto)).rejects.toBe(
        'Event Not found',
      );
    });

    it('should reject if organisator is invalid', async function () {
      expect.assertions(1);
      service.getEventById = jest.fn().mockResolvedValue({});
      usersService.getMemberById.mockRejectedValue('user not found');

      return expect(
        service.patchEvent(1, {
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
      service.getEventById = jest.fn().mockResolvedValue(event);

      await service.patchEvent(1, {
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
      repository.create = jest.fn().mockReturnValue(event);
    });

    it('should reject if organisator is invalid', async function () {
      expect.assertions(1);
      usersService.getMemberById.mockRejectedValue('user not found');

      return expect(
        service.createEvent({
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
      const member = { contact: { id: '5' } } as Member;

      usersService.getMemberById.mockResolvedValue(member);

      await service.createEvent({
        data,
        control: { organisator: 'any' },
      } as HLLEventCreateWrapperDto);

      expect(event).toEqual({
        ...data,
        organisator: member.contact,
        save: event.save,
      });
    });
  });
});
