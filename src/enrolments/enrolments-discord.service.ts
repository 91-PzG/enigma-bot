import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, Enrolment, EnrolmentType, HLLEvent } from '../typeorm/entities';
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
      enrolment = this.updateEnrolment(enrolment, dto);
    } else {
      enrolment = this.createEnrolment(dto);
    }

    enrolment.assignDto(dto);

    return this.enrolmentRepository.save(enrolment);
  }

  private createEnrolment(dto: EnrolByDiscordDto): Enrolment {
    const enrolment = new Enrolment();
    enrolment.timestamp = new Date();
    if (dto.type === EnrolmentType.ANMELDUNG) this.changePlayerCount(1, dto.eventId);

    return enrolment;
  }

  private updateEnrolment(enrolment: Enrolment, dto: EnrolByDiscordDto): Enrolment {
    // removes user from squad if he unregisters from the event
    if (enrolment.squadId && dto.type != EnrolmentType.ANMELDUNG) {
      this.enrolmentsService.shiftSquad(enrolment.position, 100, enrolment.squadId);
      enrolment.squadId = null;
      enrolment.position = null;
    }

    // updates timestamp if user changes registration type and updates the playerCount
    if (enrolment.enrolmentType != dto.type) {
      enrolment.timestamp = new Date();
      let playerChange = -1;
      if (dto.type === EnrolmentType.ANMELDUNG) playerChange = 1;
      this.changePlayerCount(playerChange, enrolment.eventId);
    }

    return enrolment;
  }

  private changePlayerCount(change: number, eventId: number) {
    this.hllEventRepository.update(eventId, { playerCount: () => `"playerCount" + ${change}` });
  }
}
