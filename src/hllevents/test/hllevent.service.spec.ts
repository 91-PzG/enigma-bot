import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HllEventEntity, Member } from '../../entities';
import { HllEventService } from '../hllevent.service';

describe('HllEventService', () => {
  let service: HllEventService;
  let repository: Repository<HllEventEntity>;
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
      organisator: new Member(),
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
      organisator: new Member(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HllEventService,
        {
          provide: getRepositoryToken(HllEventEntity),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockReturnValueOnce(events),
            }),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(HllEventService);
    repository = module.get(getRepositoryToken(HllEventEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('get Event list', () => {
    it('should get all events', async function() {
      const eventList = await service.getAll();

      expect(eventList).toBe(events);
      expect(repository.createQueryBuilder).toBeCalled();
    });
  });

  describe('get Event by id', () => {
    it('should throw notFoundException if event not found', async function() {
      expect.assertions(1);
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await service.getEventById(3).catch(e => {
        expect(e).toEqual(Error("Event with id '3' not found."));
      });
    });

    it('should get event by id ', async function() {
      const event = {
        id: 1,
        name: 'name',
        description: 'description',
        date: new Date(),
        registerByDate: new Date(),
        playerCount: 10,
        organisator: new Member(),
        mandatory: true,
        locked: false,
        closed: true,
        rounds: 5,
        hllMap: 'map',
        commander: 'string',
        moderator: 'string',
        duration: 15,
        meetingPoint: 'string',
        server: 'string',
        password: 'string',
        maxPlayerCount: 10,
        briefing: new Date(),
      };
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(event as HllEventEntity);
      const foundEvent = await service.getEventById(5);

      expect(foundEvent).toBe(event);
      expect(repository.findOne).toBeCalled();
    });
  });
});
