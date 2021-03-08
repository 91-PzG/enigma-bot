import { Controller, Get, NotImplementedException } from '@nestjs/common';
import { EnrolmentDto } from './dto/enrolment.dto';
import { MixedRosterDto, RosterDto } from './dto/roster.dto';
import { EnrolmentsService } from './enrolments.service';

@Controller('enrolment')
export class EnrolmentsController {
  constructor(private service: EnrolmentsService) {}

  @Get('/:eventid')
  getEnrolmentForEvent(): RosterDto | MixedRosterDto {
    throw new NotImplementedException();
  }

  @Get('/user/:userid')
  getEnrolmentForUser(): EnrolmentDto {
    throw new NotImplementedException();
  }
}
