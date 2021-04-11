import { Test, TestingModule } from '@nestjs/testing';
import { Division, Enrolment, EnrolmentType } from '../../postgres/entities';
import { EnrolmentsDiscordService } from '../enrolments-discord.service';
import { EnrolmentsRepository } from '../enrolments.repository';

describe('Enrolment Service', () => {
  let service: EnrolmentsDiscordService;
  let repository: jest.Mocked<EnrolmentsRepository>;

  beforeEach(async () => {
    const repositoryMock: Partial<EnrolmentsRepository> = {
      getEmbedEnrolments: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentsDiscordService,
        {
          provide: EnrolmentsRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<EnrolmentsDiscordService>(EnrolmentsDiscordService);
    repository = module.get(EnrolmentsRepository);
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
      repository.getEmbedEnrolments = jest.fn().mockResolvedValue(enrolments);
      expect(await service.getEnrolments(1)).toEqual(enrolments);
    });
  });
});
