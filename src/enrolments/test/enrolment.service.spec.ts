import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Enrolment, HLLEvent, Squad } from '../../postgres/entities';
import { EnrolmentsRepository } from '../enrolments.repository';
import { EnrolmentsService } from '../enrolments.service';

describe('Enrolment Service', () => {
  let service: EnrolmentsService;
  let hllEventRepository: jest.Mocked<HLLEvent>;
  let enrolmentRepository: jest.Mocked<Enrolment>;
  let squadRepository: jest.Mocked<Squad>;

  beforeEach(async () => {
    const hllEventRepositoryMock: Partial<EnrolmentsRepository> = {};
    const enrolmentRepositoryMock: Partial<EnrolmentsRepository> = {};
    const squadRepositoryMock: Partial<EnrolmentsRepository> = {};

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
});
