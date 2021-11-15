import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  Contact,
  Division,
  Enrolment,
  EnrolmentType,
  HLLEvent,
  Member,
} from '../../typeorm/entities';
import { EnrolByDiscordDto } from '../dto/enrolByDiscord.dto';
import { EnrolmentsDiscordService } from '../enrolments-discord.service';
import { EnrolmentsService } from '../enrolments.service';

describe('Enrolment Service', () => {
  let service: EnrolmentsDiscordService;
  let enrolmentRepository: jest.Mocked<Repository<Enrolment>>;
  let hllEventRepository: jest.Mocked<Repository<HLLEvent>>;
  let enrolmentsService: jest.Mocked<EnrolmentsService>;
  let enrolmentQueryBuilder: Partial<SelectQueryBuilder<Enrolment>> = {
    select: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const enrolmentRepositoryMock: Partial<Repository<Enrolment>> = {
      createQueryBuilder: jest.fn().mockReturnValue(enrolmentQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const hllEventRepositoryMock: Partial<Repository<HLLEvent>> = {
      update: jest.fn(),
    };
    const enrolmentsServiceMock: Partial<EnrolmentsService> = {
      shiftSquad: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrolmentsDiscordService,
        {
          provide: getRepositoryToken(Enrolment),
          useValue: enrolmentRepositoryMock,
        },
        {
          provide: getRepositoryToken(HLLEvent),
          useValue: hllEventRepositoryMock,
        },
        { provide: EnrolmentsService, useValue: enrolmentsServiceMock },
      ],
    }).compile();

    service = module.get<EnrolmentsDiscordService>(EnrolmentsDiscordService);
    enrolmentRepository = module.get(getRepositoryToken(Enrolment));
    hllEventRepository = module.get(getRepositoryToken(HLLEvent));
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
      enrolmentQueryBuilder.getRawMany = jest.fn().mockResolvedValue(enrolments);
      expect(await service.getEnrolments(1)).toEqual(enrolments);
    });
  });

  describe('enrol', () => {
    let enrolment: Enrolment;
    let enrolmentCopy: Enrolment;
    let dto: EnrolByDiscordDto;

    const createEnrolment = (): Enrolment => {
      const e = new Enrolment();
      e.id = 4;
      e.squadlead = false;
      e.commander = false;
      e.timestamp = new Date('2020-12-12T14:45:20');
      e.position = 0;
      e.squadId = 7;
      e.username = 'username';
      e.eventId = 1;
      e.memberId = '5343';
      e.division = Division.INFANTERIE;
      e.enrolmentType = EnrolmentType.ANMELDUNG;
      e.role = null;
      e.isPresent = false;
      return e;
    };

    beforeEach(() => {
      dto = {
        type: EnrolmentType.ANMELDUNG,
        eventId: 1,
        member: { id: '5343', contact: { name: 'hans' } as Contact } as Member,
        division: Division.INFANTERIE,
        squadlead: true,
        commander: false,
      };
      enrolment = createEnrolment();
      enrolmentCopy = createEnrolment();
    });

    describe('update existing enrolment', () => {
      it('should update enrolment if it already exists', async () => {
        enrolmentRepository.findOne = jest.fn().mockResolvedValue(enrolment);
        await service.enrol(dto);
        enrolmentCopy.squadlead = dto.squadlead;
        enrolmentCopy.username = dto.member.contact.name;
        expect(enrolmentRepository.save).toHaveBeenCalledWith(enrolmentCopy);
      });

      it('should remove user from squad if he unregisters', async () => {
        dto.type = EnrolmentType.ABMELDUNG;
        enrolmentRepository.findOne = jest.fn().mockResolvedValue(enrolment);
        await service.enrol(dto);
        expect(hllEventRepository.update).toHaveBeenCalled();
        enrolmentCopy.squadlead = dto.squadlead;
        enrolmentCopy.username = dto.member.contact.name;
        enrolmentCopy.squadId = null;
        enrolmentCopy.position = null;
        enrolmentCopy.enrolmentType = EnrolmentType.ABMELDUNG;
        enrolmentCopy.timestamp = enrolmentRepository.save.mock.calls[0][0].timestamp as Date;
        expect(enrolmentRepository.save).toHaveBeenCalledWith(enrolmentCopy);
      });

      it("should not update timestamp if user doesn't changes registration type", async () => {
        enrolmentRepository.findOne = jest.fn().mockResolvedValue(enrolment);
        await service.enrol(dto);
        enrolmentCopy.squadlead = dto.squadlead;
        enrolmentCopy.username = dto.member.contact.name;
        expect(enrolmentRepository.save).toHaveBeenCalledWith(enrolmentCopy);
      });

      it('should update timestamp if user changes registration type', async () => {
        dto.type = EnrolmentType.ABMELDUNG;
        enrolmentRepository.findOne = jest.fn().mockResolvedValue(enrolment);
        await service.enrol(dto);
        enrolmentCopy.enrolmentType = EnrolmentType.ABMELDUNG;
        enrolmentCopy.squadlead = dto.squadlead;
        enrolmentCopy.username = dto.member.contact.name;
        enrolmentCopy.squadId = null;
        enrolmentCopy.position = null;
        enrolmentCopy.enrolmentType = EnrolmentType.ABMELDUNG;
        enrolmentCopy.timestamp = enrolmentRepository.save.mock.calls[0][0].timestamp as Date;
        expect(enrolmentRepository.save).toHaveBeenCalledWith(enrolmentCopy);
      });
    });
  });
});
