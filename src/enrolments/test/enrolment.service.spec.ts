import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrolment, EnrolmentType, HLLEvent, Squad } from '../../postgres/entities';
import { EnrolmentsRepository } from '../enrolments.repository';
import { EnrolmentsService } from '../enrolments.service';

describe('Enrolment Service', () => {
  let service: EnrolmentsService;
  let hllEventRepository: jest.Mocked<Repository<HLLEvent>>;
  let enrolmentRepository: jest.Mocked<Repository<Enrolment>>;
  let squadRepository: jest.Mocked<Repository<Squad>>;

  beforeEach(async () => {
    const hllEventRepositoryMock: Partial<EnrolmentsRepository> = { findOne: jest.fn() };
    const enrolmentRepositoryMock: Partial<EnrolmentsRepository> = {
      findOne: jest.fn(),
    };
    const squadRepositoryMock: Partial<EnrolmentsRepository> = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentsService,
        {
          provide: getRepositoryToken(HLLEvent),
          useValue: squadRepositoryMock,
        },
        {
          provide: getRepositoryToken(Enrolment),
          useValue: enrolmentRepositoryMock,
        },
        {
          provide: getRepositoryToken(Squad),
          useValue: squadRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<EnrolmentsService>(EnrolmentsService);
    hllEventRepository = module.get(getRepositoryToken(HLLEvent));
    enrolmentRepository = module.get(getRepositoryToken(Enrolment));
    squadRepository = module.get(getRepositoryToken(Squad));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEnrolmentforUserAndEvent', () => {
    let mockEnrolment: Partial<Enrolment>;
    let mockSquad: Partial<Squad>;

    beforeEach(() => {
      mockEnrolment = {
        id: 5,
        memberId: 'id',
        eventId: 10,
        enrolmentType: EnrolmentType.ANMELDUNG,
      };
      mockSquad = {
        id: 1,
        name: 'Abficker',
      };
      enrolmentRepository.findOne = jest.fn().mockResolvedValue(mockEnrolment);
      squadRepository.findOne = jest.fn().mockResolvedValue(mockSquad);
    });

    it('should return enrolment', async () => {
      const enrolment = await service.getEnrolmentForUserAndEvent(1, 'one');
      expect(enrolment).toBe(mockEnrolment);
    });

    it('should add squad if squadId is set', async () => {
      mockEnrolment.squadId = 5;
      const enrolment = await service.getEnrolmentForUserAndEvent(1, 'one');
      //@ts-ignore
      mockEnrolment.squad = mockSquad;
      expect(enrolment).toBe(mockEnrolment);
    });
  });

  describe('getEnrolmentforEvent', () => {
    let mockSquads: Partial<Squad>[];
    let mockEnrolment: Partial<Enrolment>[];

    beforeEach(() => {
      hllEventRepository.findOne = jest.fn().mockResolvedValue({ name: 'Eventname' });
    });
  });
});
