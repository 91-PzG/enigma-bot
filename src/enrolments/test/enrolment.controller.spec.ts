import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RosterDto } from '../dto/roster.dto';
import { EnrolmentsController } from '../enrolments.controller';
import { EnrolmentsService } from '../enrolments.service';

describe('Enrolment Controller', () => {
  let controller: EnrolmentsController;
  let enrolmentsService: jest.Mocked<EnrolmentsService>;

  beforeEach(async () => {
    const serviceMock: Partial<EnrolmentsService> = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrolmentsController],
      providers: [
        {
          provide: EnrolmentsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<EnrolmentsController>(EnrolmentsController);
    enrolmentsService = module.get(EnrolmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get Enrolment for Event', () => {
    const rosterDto:RosterDto = {
      eventname:"TestEvent",
      commander: null,
      infanterie: {
        pool:[],
        reserve:[],
        squads:[]
      },
      armor: {
        pool:[],
        reserve:[],
        squads:[]
      },
      artillery: {
        pool:[],
        reserve:[],
        squads:[]
      },recon: {
        pool:[],
        reserve:[],
        squads:[]
      }
    }
    it('should return value from service',()=>{
      enrolmentsService.getEnrolmentForEvent=jest.fn().mockReturnValue(rosterDto);
      expect(controller.getEnrolmentForEvent(1)).toEqual(rosterDto)
    })
  });

  describe('get Enrolment for User', () => {
    it('should throw unimplemented', () => {
      expect(controller.getEnrolmentForUser).toThrow(NotImplementedException);
    });
  });
});
