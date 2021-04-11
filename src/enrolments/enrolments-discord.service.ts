import { Injectable } from '@nestjs/common';
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
    const enrolment =
      (await this.repository.findOne({
        eventId: dto.eventId,
        memberId: dto.member.id,
      })) || new Enrolment();

    if (enrolment.enrolmentType !== dto.type) enrolment.timestamp = new Date();

    enrolment.squadlead = dto.squadlead;
    enrolment.commander = dto.commander;
    enrolment.username = dto.member.contact.name;
    enrolment.enrolmentType = dto.type;
    enrolment.division = dto.division;
    enrolment.eventId = dto.eventId;
    enrolment.memberId = dto.member.id;

    enrolment.save();
  }
}
