import { Controller, Get, NotImplementedException, Param, ParseIntPipe } from '@nestjs/common';
import { EnrolmentDto } from './dto/enrolment.dto';
import { MixedRosterDto, RosterDto } from './dto/roster.dto';
import { EnrolmentsService } from './enrolments.service';

@Controller('enrolment')
export class EnrolmentsController {
  constructor(private service: EnrolmentsService) {}

  @Get('/:eventId')
  getEnrolmentForEvent(
    @Param('eventId', ParseIntPipe) id: number,
  ): Promise<RosterDto | MixedRosterDto> {
    return this.service.getEnrolmentsForEvent(id);
  }

  @Get('/user/:userid')
  getEnrolmentForUser(): EnrolmentDto {
    throw new NotImplementedException();
  }
}
