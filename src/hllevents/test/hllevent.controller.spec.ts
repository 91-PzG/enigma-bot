import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Contact, HLLEvent, IHLLEvent } from '../../typeorm/entities';
import { HLLEventCreateWrapperDto } from '../dtos/hlleventCreate.dto';
import { HLLEventGetAllDto } from '../dtos/hlleventGetAll.dto';
import { HLLEventUpdateWrapperDto } from '../dtos/hlleventUpdate.dto';
import { HLLEventController } from '../hllevent.controller';
import { HLLEventService } from '../hllevent.service';

describe('EventController', () => {
  let hllEventController: HLLEventController;
  let hllEventService: jest.Mocked<HLLEventService>;

  beforeEach(async () => {
    const hllEventServiceMock: Partial<HLLEventService> = {
      getAll: jest.fn(),
      getEventById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HLLEventController,
        { provide: HLLEventService, useValue: hllEventServiceMock },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('false') } },
      ],
    }).compile();

    hllEventController = module.get<HLLEventController>(HLLEventController);
    hllEventService = module.get(HLLEventService);
  });

  it('should be defined', () => {
    expect(hllEventController).toBeDefined();
  });

  describe('get Event list', () => {
    it('getAll should convert domain objects returned from service to DTOs', async () => {
      const events: IHLLEvent[] = [
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
          singlePool: false,
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
          organisator: new Contact(),
          singlePool: false,
        },
      ];

      hllEventService.getAll.mockResolvedValue(events);

      const dtos = (await hllEventController.getAll()).map((pojo) =>
        plainToClass(HLLEventGetAllDto, pojo),
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
        duration: '15min',
        meetingPoint: 'string',
        server: 'string',
        password: 'string',
        maxPlayerCount: 10,
        briefing: new Date(),
      };

      hllEventService.getEventById.mockResolvedValue(event);
      const dto = await hllEventController.getEventById(3, { userId: '', username: '', roles: [] });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      //expect(dto.organisator).toEqual(event.organisator.contact.name);
    });
  });

  describe('patch Event', () => {
    it('should resolve', () => {
      expect.assertions(1);
      hllEventService.patchEvent = jest
        .fn()
        .mockResolvedValue({ organisator: { contact: { name: 'hans' } } });

      return expect(
        hllEventController.patchEvent(1, {} as HLLEventUpdateWrapperDto),
      ).resolves.not.toThrow();
    });
    it('should reject if service throws error', () => {
      expect.assertions(1);
      hllEventService.patchEvent = jest.fn().mockRejectedValue('Invalid Organisator');

      return expect(
        hllEventController.patchEvent(1, {} as HLLEventUpdateWrapperDto),
      ).rejects.toBeTruthy();
    });
  });

  describe('create Event', () => {
    it('should resolve', () => {
      expect.assertions(1);
      hllEventService.createEvent = jest
        .fn()
        .mockResolvedValue({ organisator: { contact: { name: 'hans' } } });

      return expect(
        hllEventController.createEvent({} as HLLEventCreateWrapperDto),
      ).resolves.not.toThrow();
    });
    it('should reject if service throws error', () => {
      expect.assertions(1);
      hllEventService.createEvent = jest.fn().mockRejectedValue('Invalid Organisator');

      return expect(
        hllEventController.createEvent({} as HLLEventCreateWrapperDto),
      ).rejects.toBeTruthy();
    });
  });
});
