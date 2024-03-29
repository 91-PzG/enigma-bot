import { Test, TestingModule } from '@nestjs/testing';
import { SelectQueryBuilder } from 'typeorm';
import { Enrolment, EnrolmentType } from '../../typeorm/entities';
import { EnrolmentsRepository } from '../enrolments.repository';

describe('Enrolment Repository', () => {
  let repository: EnrolmentsRepository;
  let queryBuilder: Partial<SelectQueryBuilder<Enrolment>> = {
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnrolmentsRepository],
    }).compile();

    repository = module.get<EnrolmentsRepository>(EnrolmentsRepository);
    jest
      .spyOn(repository, 'createQueryBuilder')
      .mockReturnValue(queryBuilder as SelectQueryBuilder<Enrolment>);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getEnrolments', () => {
    const enrolments: Partial<Enrolment>[] = [
      {
        username: 'Hans',
        squadlead: true,
        commander: false,
        enrolmentType: EnrolmentType.ANMELDUNG,
      },
      {
        username: 'Peter',
        squadlead: false,
        commander: true,
        enrolmentType: EnrolmentType.RESERVE,
      },
      {
        username: 'Susi',
        squadlead: false,
        commander: false,
        enrolmentType: EnrolmentType.ABMELDUNG,
      },
    ];
    queryBuilder.getMany = jest.fn().mockResolvedValue(enrolments);

    it('should return enrolments', async () => {
      expect(await repository.getEnrolmentsForEvent(1)).toEqual(enrolments);
    });
  });
});
