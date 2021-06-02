import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact, Enrolment, EnrolmentType, HLLEvent, HLLRole, Squad } from '../postgres/entities';
import { MixedRosterDto, RosterDto } from './dto/roster.dto';
import { CreateSquadDto, RenameSquadDto } from './dto/socket.dto';

@Injectable()
export class EnrolmentsService {
  constructor(
    @InjectRepository(HLLEvent) private eventRepository: Repository<HLLEvent>,
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    @InjectRepository(Squad) private squadRepository: Repository<Squad>,
  ) {}

  async getEnrolmentForUserAndEvent(eventId: number, memberId: string): Promise<Enrolment> {
    const enrolment = await this.enrolmentRepository.findOne({ memberId, eventId });
    //@ts-ignore
    if (enrolment?.squadId) enrolment.squad = await this.squadRepository.findOne(enrolment.squadId);
    return enrolment;
  }

  async getEnrolmentsForEvent(id: number): Promise<RosterDto | MixedRosterDto> {
    const event = await this.eventRepository.findOne(id);

    if (!event) throw new NotFoundException(`Event with id ${id} not found`);

    const enrolments = await this.getEnrolments(id);
    const squads = await this.getSquads(id);

    return this.getSeperatePoolEnrolments(enrolments, squads, event.name);
  }

  createSquad(data: CreateSquadDto, eventId: number): Promise<Squad> {
    return this.squadRepository
      .create({
        name: data.name,
        division: data.division,
        position: data.position,
        eventId,
      })
      .save();
  }

  async deleteSquad(squadId: number): Promise<void> {
    await this.enrolmentRepository
      .createQueryBuilder()
      .update()
      .set({ squadId: null, position: null })
      .where('squadId = :squadId', { squadId })
      .execute();
    await this.squadRepository.delete(squadId);
  }

  renameSquad(data: RenameSquadDto): Promise<any> {
    return this.squadRepository
      .createQueryBuilder()
      .update()
      .set({ name: data.name })
      .where('id=:id', { id: data.id })
      .execute();
  }

  async moveSoldier(oldSoldier: Enrolment, newSoldier: Enrolment): Promise<any> {
    if (!oldSoldier.squadId && newSoldier.division != oldSoldier.division) {
      return this.moveToDivision(newSoldier);
    }

    if (newSoldier.squadId) {
      if (oldSoldier.squadId) {
        if (oldSoldier.squadId == newSoldier.squadId) {
          await this.shiftSquad(oldSoldier.position, newSoldier.position, newSoldier.squadId);
        } else {
          await this.shiftSquad(oldSoldier.position, 100, oldSoldier.squadId);
          await this.shiftSquad(100, newSoldier.position, newSoldier.squadId);
        }
        return this.moveToSquad(newSoldier);
      }
      await this.shiftSquad(100, newSoldier.position, newSoldier.squadId);
      return this.moveToSquad(newSoldier);
    }
    await this.shiftSquad(oldSoldier.position, 100, oldSoldier.squadId);
    return this.moveToDivision(newSoldier);
  }

  shiftSquad(oldPos: number, newPos: number, squadId: number): Promise<any> {
    const left = Math.min(oldPos, newPos);
    const right = Math.max(oldPos, newPos);
    const dir = oldPos > newPos ? 1 : -1;

    return this.enrolmentRepository
      .createQueryBuilder()
      .update()
      .set({ position: () => 'position +' + dir })
      .where('squadId=:squadId and position>=:left and position<=:right', { squadId, left, right })
      .execute();
  }

  private async moveToSquad(newSoldier: Enrolment): Promise<any> {
    return this.enrolmentRepository
      .createQueryBuilder()
      .update()
      .set({ squadId: newSoldier.squadId, position: newSoldier.position })
      .where('id=:id', { id: newSoldier.id })
      .execute();
  }

  private moveToDivision(newSoldier: Enrolment): Promise<any> {
    return this.enrolmentRepository
      .createQueryBuilder()
      .update()
      .set({ division: newSoldier.division, squadId: null, position: null })
      .where('id=:id', { id: newSoldier.id })
      .execute();
  }

  private async getSeperatePoolEnrolments(
    enrolments: Enrolment[],
    squads: Squad[],
    eventname: string,
  ): Promise<RosterDto> {
    const roster = new RosterDto(eventname);

    squads.forEach((squad: Squad) => {
      squad.members = [];
      roster[squad.division].squads[squad.position] = squad;
    });

    enrolments.forEach((enrolment) => {
      if (enrolment['name']) {
        enrolment.username = enrolment['name'];
        delete enrolment['name'];
      }

      if (enrolment.role == HLLRole.COMMANDER) return (roster.commander = enrolment);

      if (enrolment.squadId) {
        const squadPos = enrolment['squad_pos'];
        return (roster[enrolment.division].squads[squadPos].members[enrolment.position] =
          enrolment);
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
      .andWhere(`not "enrolmentType" = 'AB'`)
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
