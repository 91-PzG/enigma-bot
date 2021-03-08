import { Test, TestingModule } from '@nestjs/testing';
import { EnrolmentsRepository } from '../enrolments.repository';
import { EnrolmentsService } from '../enrolments.service';

describe('Enrolment Service', () => {
  let service: EnrolmentsService;
  let repository: jest.Mocked<EnrolmentsRepository>;

  beforeEach(async () => {
    const repositoryMock: Partial<EnrolmentsRepository> = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentsService,
        {
          provide: EnrolmentsRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<EnrolmentsService>(EnrolmentsService);
    repository = module.get(EnrolmentsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
