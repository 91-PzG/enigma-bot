import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { Contact, Division, Enrolment, EnrolmentType, Member } from '../../postgres/entities';
import { EnrolByDiscordDto } from '../dto/enrolByDiscord.dto';
import { EnrolmentsDiscordService } from '../enrolments-discord.service';
import { EnrolmentsRepository } from '../enrolments.repository';
import { EnrolmentsService } from '../enrolments.service';

jest.mock('../../postgres/entities/enrolment.entity.ts');

describe('Enrolment Service', () => {
  let service: EnrolmentsDiscordService;
  let repository: jest.Mocked<EnrolmentsRepository>;
  let enrolmentsService: jest.Mocked<EnrolmentsService>;
  let queryBuilder: Partial<SelectQueryBuilder<Enrolment>> = {
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const repositoryMock: Partial<EnrolmentsRepository> = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
    };
    const enrolmentsServiceMock: Partial<EnrolmentsService> = {
      shiftSquad: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentsDiscordService,
        {
          provide: getRepositoryToken(Enrolment),
          useValue: repositoryMock,
        },
        { provide: EnrolmentsService, useValue: enrolmentsServiceMock },
      ],
    }).compile();

    service = module.get<EnrolmentsDiscordService>(EnrolmentsDiscordService);
    repository = module.get(getRepositoryToken(Enrolment));
    enrolmentsService = module.get(EnrolmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get Enrolments', () => {
    it('should return enrolments', async () => {
      const enrolments: Partial<Enrolment>[] = [
        {
          username: 'Hans',
          squadlead: true,
          commander: false,
          enrolmentType: EnrolmentType.ANMELDUNG,
          division: Division.ARMOR,
        },
        {
          username: 'Peter',
          squadlead: false,
          commander: true,
          enrolmentType: EnrolmentType.RESERVE,
          division: Division.INFANTERIE,
        },
        {
          username: 'Susi',
          squadlead: false,
          commander: false,
          enrolmentType: EnrolmentType.ABMELDUNG,
          division: Division.ARTILLERY,
        },
      ];
      queryBuilder.getRawMany = jest.fn().mockResolvedValue(enrolments);
      expect(await service.getEnrolments(1)).toEqual(enrolments);
    });
  });

  describe('enrol', () => {
    let dto: EnrolByDiscordDto;
    beforeEach(() => {
      //@ts-ignore
      Enrolment.mockClear();
      dto = {
        type: EnrolmentType.ANMELDUNG,
        eventId: 1,
        member: { id: 'id', contact: { name: 'hans' } as Contact } as Member,
        division: Division.INFANTERIE,
        squadlead: true,
        commander: false,
      };
      jest.resetAllMocks();
    });

    it('should try to get enrolment from db', async () => {
      repository.findOne = jest.fn().mockResolvedValue(new Enrolment());
      await service.enrol(dto);
      expect(repository.findOne).toHaveBeenCalled();
    });

    it('should create new Enrolment if no entry is found', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      await service.enrol(dto);
      expect(repository.findOne).toHaveBeenCalled();
      expect(Enrolment).toHaveBeenCalledTimes(1);
    });

    it('should save Enrolment', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      await service.enrol(dto);
      //@ts-ignore
      expect(Enrolment.mock.instances[0].save).toHaveBeenCalledTimes(1);
    });

    it('should set correct properties', async () => {
      repository.findOne = jest.fn().mockResolvedValue(null);
      await service.enrol(dto);
      //@ts-ignore
      const enrolmentMock: Enrolment = Enrolment.mock.instances[0];
      const enrolment = {
        squadlead: true,
        commander: false,
        username: 'hans',
        enrolmentType: EnrolmentType.ANMELDUNG,
        division: Division.INFANTERIE,
        eventId: 1,
        memberId: 'id',
        timestamp: enrolmentMock.timestamp,
      };
      Object.entries(enrolment).forEach(([key, value]) => {
        expect(enrolmentMock[key]).toBe(value);
      });
    });

    it("shouldn't update timestamp if enrolmentType stays the same", async () => {
      const enrolment = new Enrolment();
      enrolment.timestamp = new Date('13.02.2020 14:45:20');
      enrolment.enrolmentType = EnrolmentType.ANMELDUNG;
      repository.findOne = jest.fn().mockResolvedValue(enrolment);
      await service.enrol(dto);
      expect(enrolment.timestamp).toEqual(enrolment.timestamp);
    });

    it('should update timestamp if enrolmentType changes', async () => {
      const enrolment = new Enrolment();
      const timestamp = new Date('13.02.2020 14:45:20');
      enrolment.timestamp = timestamp;
      enrolment.enrolmentType = EnrolmentType.ABMELDUNG;
      repository.findOne = jest.fn().mockResolvedValue(enrolment);
      await service.enrol(dto);
      expect(enrolment.timestamp).not.toEqual(timestamp);
    });

    it("shouldn't update postitions if user was already in a squad", async () => {
      const enrolment = new Enrolment();
      const squadId = 2;
      const pos = 1;
      enrolment.squadId = squadId;
      enrolment.position = pos;
      enrolment.enrolmentType = EnrolmentType.ABMELDUNG;

      repository.findOne = jest.fn().mockResolvedValue(enrolment);
      await service.enrol(dto);

      expect(enrolment.squadId).toBeNull();
      expect(enrolment.position).toBeNull();
      expect(enrolmentsService.shiftSquad).toHaveBeenCalledWith(pos, 100, squadId);
    });
  });
});
