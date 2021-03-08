import { Injectable, NotImplementedException } from '@nestjs/common';
import { Enrolment } from '../postgres/entities';
import { EnrolByDiscordDto } from './dto/enrolByDiscord.dto';
import { EnrolmentsRepository } from './enrolments.repository';

@Injectable()
export class EnrolmentsDiscordService {
  constructor(private repository: EnrolmentsRepository) {}

  getEnrolments(eventId: number): Promise<Enrolment[]> {
    return this.repository.getEmbedEnrolments(eventId);
  }

  async enrol(dto: EnrolByDiscordDto) {
    throw new NotImplementedException();
  }
}
