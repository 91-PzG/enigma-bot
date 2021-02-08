import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { HllEventGetAllDto } from './dtos/hlleventGetAll.dto';
import { HllEventController } from './hllevent.controller';
import { HllEventService } from './hllevent.service';

describe('EventControler', () => {
  let hllEventController: HllEventController;
  let hllEventService: jest.Mocked<HllEventService>;

  beforeEach(async () => {
    const hllEventServiceMock: Partial<HllEventService> = {
      getAll: jest.fn(),
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

  it('getAll should convert domain objects returned from service to DTOs', async () => {
    const events: HllEventGetAllDto[] = [
      {
        id: 1,
        name: 'Freundschaftsspiel gegen 38.',
        date: new Date(),
        description: 'Freundschaftsspiel gegen 38. Beschreibung',
        locked: false,
        closed: false,
        playerCount: 32,
        maxPlayerCount: 50,
        registerByDate: new Date(),
      },
      {
        id: 2,
        name: 'Ligaspiel gegen StuG',
        date: new Date(),
        description: 'Ligaspiel gegen StuG Beschreibung',
        locked: true,
        closed: false,
        playerCount: 50,
        maxPlayerCount: 50,
        registerByDate: new Date(),
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
        forbidNonWhitelisted: true,
      });
      expect(errors).toHaveLength(0);
    }
  });
});
