import { Test, TestingModule } from '@nestjs/testing';
import { SelectQueryBuilder } from 'typeorm';
import { HLLEvent } from '../../typeorm/entities';
import { HLLEventRepository } from '../hllevent.repository';

describe('HLLEventRepository', () => {
  let repository: HLLEventRepository;
  let queryBuilder: Partial<SelectQueryBuilder<HLLEvent>> = {
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HLLEventRepository],
    }).compile();

    repository = module.get<HLLEventRepository>(HLLEventRepository);
    jest
      .spyOn(repository, 'createQueryBuilder')
      .mockReturnValue(queryBuilder as SelectQueryBuilder<HLLEvent>);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getEventById', () => {
    it('should return stuff', async () => {
      const event = { id: 1 };
      queryBuilder.getOne = jest.fn().mockResolvedValue(event).mockResolvedValueOnce(undefined);
      expect(await repository.getEventById(5)).toBeUndefined();
      expect(await repository.getEventById(5)).toEqual(event);
    });
  });

  describe('getPublishableEvents', () => {
    it('should return stuff', async () => {
      const events = [{ id: 1 }, { id: 2 }, { id: 3 }];
      queryBuilder.getMany = jest.fn().mockResolvedValue(events);
      expect(await repository.getPublishableEvents()).toEqual(events);
    });
  });
});
