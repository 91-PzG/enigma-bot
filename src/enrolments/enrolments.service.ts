import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, Enrolment, EnrolmentType, HLLEvent, HLLRole, Squad } from '../postgres/entities';
import { MixedRosterDto, RosterDto } from './dto/roster.dto';

@Injectable()
export class EnrolmentsService {
  constructor(
    @InjectRepository(HLLEvent) private eventRepository: Repository<HLLEvent>,
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    @InjectRepository(Enrolment) private squadRepository: Repository<Squad>,
  ) {}

  async getEnrolmentForEvent(id: number): Promise<RosterDto | MixedRosterDto> {
    const event = await this.eventRepository.findOne(id);

    if (!event) throw new NotFoundException(`Event with id ${id}`);

    const enrolments = await this.getEnrolments(id);
    const squads = await this.getSquads(id);

    return this.getSeperatePoolEnrolments(enrolments, squads, event.name);
  }

  private async getSeperatePoolEnrolments(
    enrolments: Enrolment[],
    squads: Squad[],
    eventname: string,
  ): Promise<RosterDto> {
    const roster = new RosterDto(eventname);

    squads.forEach((squad) => {
      roster[squad.division].squads[squad.position] = squad;
    });

    enrolments.forEach((enrolment) => {
      if (enrolment['name']) {
        enrolment.username = enrolment['name'];
        delete enrolment['name'];
      }

      if (enrolment.role == HLLRole.COMMANDER) return (roster.commander = enrolment);

      if (enrolment.squadId) {
        const squadPos = enrolments['squad_pos'];
        return (roster[enrolment.division].squads[squadPos].members[
          enrolment.position
        ] = enrolment);
      }

      if (enrolment.enrolmentType == EnrolmentType.ANMELDUNG)
        return roster[enrolment.division].pool.push(enrolment);
      roster[enrolment.division].reserve.push(enrolment);
    });

    return roster;
  }

  private getEnrolments(eventId: number): Promise<Enrolment[]> {
    return this.enrolmentRepository
      .createQueryBuilder('e')
      .leftJoin(Contact, 'contact', '"memberId" = contact.id')
      .leftJoin(Squad, 'squad', '"squadId" = squad.id')
      .select('e.*')
      .addSelect('squad.position', 'squad_pos')
      .addSelect('contact.name', 'name')
      .where('e.eventId = :eventId', { eventId })
      .andWhere('not "enrolmentType" = \'AB\'')
      .orderBy('timestamp', 'ASC')
      .getRawMany();
  }

  private getSquads(eventId: number): Promise<Squad[]> {
    return this.squadRepository
      .createQueryBuilder('s')
      .where('s.eventId=:eventId', { eventId })
      .getMany();
  }
}
