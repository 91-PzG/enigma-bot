import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Division, Enrolment, EnrolmentType } from '../../postgres/entities';
import { EnrolByDiscordDto } from '../dto/enrolByDiscord.dto';
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

  describe('get Enrolments', async () => {
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
    expect(service.getEnrolments(1)).toEqual(enrolments);
  });

  describe('enrol', () => {
    const dto: EnrolByDiscordDto = {
      type: EnrolmentType.ABMELDUNG,
      squadlead: false,
      commander: false,
      division: Division.ARMOR,
      eventId: 5,
      memberId: 'test',
    };
    it('should throw unimplemented', async () => {
      await expect(service.enrol(dto)).rejects.toThrow(NotImplementedException);
    });
  });
});
