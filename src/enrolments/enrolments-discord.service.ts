import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, Enrolment, EnrolmentType, HLLEvent } from '../postgres/entities';
import { EnrolByDiscordDto } from './dto/enrolByDiscord.dto';
import { EnrolmentsService } from './enrolments.service';

@Injectable()
export class EnrolmentsDiscordService {
  constructor(
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    @InjectRepository(HLLEvent) private hllEventRepository: Repository<HLLEvent>,
    private enrolmentsService: EnrolmentsService,
  ) {}

  getEnrolments(eventId: number): Promise<Enrolment[]> {
    return this.enrolmentRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect(Contact, 'contact', 'e.memberId = contact.id')
      .select(['username', 'squadlead', 'commander', '"enrolmentType"', 'division', 'name'])
      .where('e.eventId = :eventId', { eventId })
      .orderBy('e.timestamp', 'ASC')
      .getRawMany();
  }

  async enrol(dto: EnrolByDiscordDto) {
    let enrolment = await this.enrolmentRepository.findOne({
      eventId: dto.eventId,
      memberId: dto.member.id,
    });

    if (enrolment) {
      if (enrolment.squadId && enrolment.enrolmentType != EnrolmentType.ANMELDUNG)
        this.enrolmentsService.shiftSquad(enrolment.position, 100, enrolment.squadId);
      if (enrolment.enrolmentType !== dto.type) {
        enrolment.timestamp = new Date();
        if (enrolment.enrolmentType == EnrolmentType.ANMELDUNG)
          this.changePlayerCount(-1, dto.eventId);
        if (dto.type == EnrolmentType.ANMELDUNG) this.changePlayerCount(1, dto.eventId);
      }
    } else {
      enrolment = new Enrolment();
      enrolment.timestamp = new Date();
      if (dto.type == EnrolmentType.ANMELDUNG) this.changePlayerCount(1, dto.eventId);
    }

    enrolment.squadlead = dto.squadlead;
    enrolment.commander = dto.commander;
    enrolment.username = dto.member.contact.name;
    enrolment.enrolmentType = dto.type;
    enrolment.division = dto.division;
    enrolment.eventId = dto.eventId;
    enrolment.memberId = dto.member.id;
    enrolment.squadId = null;
    enrolment.position = null;

    enrolment.save();
  }

  private changePlayerCount(count: number, eventId: number) {
    this.hllEventRepository
      .createQueryBuilder()
      .update()
      .set({ playerCount: () => 'playerCount +' + count })
      .where('"eventId"=:eventId', { eventId })
      .execute();
  }
}
