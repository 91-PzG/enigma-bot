import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EnrolmentsController } from '../enrolments.controller';
import { EnrolmentsService } from '../enrolments.service';

describe('Enrolment Controller', () => {
  let controller: EnrolmentsController;

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('get Enrolment for Event', () => {
    it('should throw unimplemented', () => {
      expect(controller.getEnrolmentForEvent).toThrow(NotImplementedException);
    });
  });

  describe('get Enrolment for User', () => {
    it('should throw unimplemented', () => {
      expect(controller.getEnrolmentForUser).toThrow(NotImplementedException);
    });
  });
});
