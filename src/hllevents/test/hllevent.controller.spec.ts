import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { HLLEvent, Member } from '../../entities';
import { HllEventGetAllDto } from '../dtos/hllEventGetAll.dto';
import { HllEventController } from '../hllevent.controller';
import { HllEventService } from '../hllevent.service';

describe('EventControler', () => {
  let hllEventController: HllEventController;
  let hllEventService: jest.Mocked<HllEventService>;

  beforeEach(async () => {
    const hllEventServiceMock: Partial<HllEventService> = {
      getAll: jest.fn(),
      getEventById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: HllEventService, useValue: hllEventServiceMock },
        HllEventController,
      ],
    }).compile();

    hllEventController = module.get<HllEventController>(HllEventController);
    hllEventService = module.get(HllEventService);
  });

  it('should be defined', () => {
    expect(hllEventController).toBeDefined();
  });

  describe('get Event list', () => {
    it('getAll should convert domain objects returned from service to DTOs', async () => {
      const events: HLLEvent[] = [
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
          id: 2,
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

      hllEventService.getAll.mockResolvedValue(events);

      const dtos = (await hllEventController.getAll()).map(pojo =>
        plainToClass(HllEventGetAllDto, pojo),
      );
      expect(dtos.length).toBeGreaterThan(0);
      for (const dto of dtos) {
        const errors = await validate(dto, {
          whitelist: true,
        });
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('get Event by id', () => {
    it('getEventById should convert domain objects returned from service to DTOs', async () => {
      const event: HLLEvent = {
        id: 1,
        name: 'name',
        description: 'description',
        date: new Date(),
        registerByDate: new Date(),
        playerCount: 10,
        //@ts-ignore
        organisator: {
          //@ts-ignore
          contact: {
            name: 'Name',
          },
        },
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

      hllEventService.getEventById.mockResolvedValue(event);
      const dto = await hllEventController.getEventById(3);

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      //expect(dto.organisator).toEqual(event.organisator.contact.name);
    });
  });
});
