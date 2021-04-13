import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, Enrolment } from '../postgres/entities';
import { EnrolByDiscordDto } from './dto/enrolByDiscord.dto';

@Injectable()
export class EnrolmentsDiscordService {
  constructor(@InjectRepository(Enrolment) private repository: Repository<Enrolment>) {}

  getEnrolments(eventId: number): Promise<Enrolment[]> {
    return this.repository
      .createQueryBuilder('e')
      .leftJoinAndSelect(Contact, 'contact', 'e.memberId = contact.id')
      .select(['username', 'squadlead', 'commander', '"enrolmentType"', 'division', 'name'])
      .where('e.eventId = :eventId', { eventId })
      .orderBy('e.timestamp', 'ASC')
      .getRawMany();
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
