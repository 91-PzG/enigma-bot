import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import { Division, Enrolment, EnrolmentType } from '../../postgres/entities';
import { EnrolmentsDiscordService } from '../enrolments-discord.service';
import { EnrolmentsRepository } from '../enrolments.repository';

describe('Enrolment Service', () => {
  let service: EnrolmentsDiscordService;
  let repository: jest.Mocked<EnrolmentsRepository>;
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentsDiscordService,
        {
          provide: getRepositoryToken(Enrolment),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<EnrolmentsDiscordService>(EnrolmentsDiscordService);
    repository = module.get(getRepositoryToken(Enrolment));
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
});
