import { Test, TestingModule } from '@nestjs/testing';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, UpdateQueryBuilder } from 'typeorm';
import { Enrolment, HLLEvent, Squad } from '../../typeorm/entities';
import { CreateSquadDto, RenameSquadDto } from '../dto/socket.dto';
import { EnrolmentsRepository } from '../enrolments.repository';
import { EnrolmentsService } from '../enrolments.service';

describe('Enrolment Service', () => {
  let service: EnrolmentsService;
  let hllEventRepository: jest.Mocked<Repository<HLLEvent>>;
  let enrolmentRepository: jest.Mocked<Repository<Enrolment>>;
  let squadRepository: jest.Mocked<Repository<Squad>>;
  let mockSquad: Partial<Squad> = {
    save: jest.fn(),
  };

  let squadUpdateQueryBuilder: Partial<UpdateQueryBuilder<Squad>> = {
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };
  let enrolmentUpdateQueryBuilder: Partial<UpdateQueryBuilder<Enrolment>> = {
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };
  let squadSelectQueryBuilder: Partial<SelectQueryBuilder<Squad>> = {
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnValue(squadUpdateQueryBuilder),
  };
  let enrolmentQueryBuilder: Partial<SelectQueryBuilder<Enrolment>> = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    update: jest.fn().mockReturnValue(enrolmentUpdateQueryBuilder),
  };

  beforeEach(async () => {
    const hllEventRepositoryMock: Partial<EnrolmentsRepository> = { findOne: jest.fn() };
    const enrolmentRepositoryMock: Partial<EnrolmentsRepository> = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(enrolmentQueryBuilder),
    };
    const squadRepositoryMock: Partial<EnrolmentsRepository> = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(squadSelectQueryBuilder),
      create: jest.fn().mockReturnValue(mockSquad),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentsService,
        {
          provide: getRepositoryToken(HLLEvent),
          useValue: hllEventRepositoryMock,
        },
        {
          provide: getRepositoryToken(Enrolment),
          useValue: enrolmentRepositoryMock,
        },
        {
          provide: getRepositoryToken(Squad),
          useValue: squadRepositoryMock,
        },
        {
          provide: getEntityManagerToken(),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
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

  describe('getEnrolmentforEvent', () => {
    beforeEach(() => {
      hllEventRepository.findOne = jest.fn().mockResolvedValue({ name: 'Eventname' });
      squadSelectQueryBuilder.getMany = jest.fn().mockResolvedValue([]);
      enrolmentQueryBuilder.getRawMany = jest.fn().mockResolvedValue([]);
    });

    it('should throw error if event not found', async () => {
      hllEventRepository.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.getEnrolmentsForEvent(5)).rejects.toThrow('Event with id 5 not found');
    });

    it("shouldn't  throw error", async () => {
      await expect(service.getEnrolmentsForEvent(5)).resolves.not.toThrow();
    });
  });

  describe('create squad', () => {
    const dto: CreateSquadDto = {
      name: 'Squad #1',
      position: 1,
    };

    beforeEach(() => {
      squadRepository.create = jest.fn().mockReturnValue(mockSquad);
    });

    it('should call create with correct params', () => {
      service.createSquad(dto, 5);
      expect(squadRepository.create).toHaveBeenCalledWith({
        name: 'Squad #1',
        position: 1,
        eventId: 5,
      });
    });

    it('should call save', () => {
      service.createSquad(dto, 5);
      expect(mockSquad.save).toHaveBeenCalled();
    });
  });

  describe('rename squad', () => {
    const dto: RenameSquadDto = {
      id: 5,
      name: 'new name',
      position: 1,
    };

    it('should call set with correct params', () => {
      service.renameSquad(dto);
      expect(squadUpdateQueryBuilder.set).toHaveBeenCalledWith({
        name: 'new name',
      });
    });

    it('should call where with correct params', () => {
      service.renameSquad(dto);
      expect(squadUpdateQueryBuilder.where).toHaveBeenCalledWith('id=:id', {
        id: 5,
      });
    });

    it('should call execute', () => {
      service.createSquad(dto, 5);
      expect(squadUpdateQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('delete squad', () => {
    const squadId = 5;

    it('should call set with correct params', () => {
      service.deleteSquad(squadId);
      expect(enrolmentUpdateQueryBuilder.set).toHaveBeenCalledWith({
        squadId: null,
        position: null,
      });
    });

    it('should call where with correct params', () => {
      service.deleteSquad(squadId);
      expect(enrolmentUpdateQueryBuilder.where).toHaveBeenCalledWith('squadId = :squadId', {
        squadId,
      });
    });

    it('should call execute', () => {
      service.deleteSquad(squadId);
      expect(enrolmentUpdateQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should call delete with correct params', async () => {
      await service.deleteSquad(squadId);
      expect(squadRepository.delete).toHaveBeenCalledWith(squadId);
    });
  });
});
