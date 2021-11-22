import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Enrolment, EnrolmentType, HLLEvent, HLLRole, Squad } from '../typeorm/entities';
import { EnrolmentView } from '../typeorm/views/enrolment.view';
import { RosterDto, SquadDto } from './dto/roster.dto';
import { CreateSquadDto, RenameSquadDto } from './dto/socket.dto';

@Injectable()
export class EnrolmentsService {
  constructor(
    @InjectRepository(HLLEvent) private eventRepository: Repository<HLLEvent>,
    @InjectRepository(Enrolment) private enrolmentRepository: Repository<Enrolment>,
    @InjectRepository(Squad) private squadRepository: Repository<Squad>,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  test() {
    this.entityManager.find(EnrolmentView, {});
  }

  async getEnrolmentsForEvent(id: number): Promise<RosterDto> {
    const event = await this.eventRepository.findOne(id);

    if (!event) throw new NotFoundException(`Event with id ${id} not found`);

    const squads = await this.getSquads(id);

    return this.getRoster(squads, event.name, event.id);
  }

  createSquad(data: CreateSquadDto, eventId: number): Promise<Squad> {
    return this.squadRepository
      .create({
        name: data.name,
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

  private async getRoster(
    squads: SquadDto[],
    eventname: string,
    eventId: number,
  ): Promise<RosterDto> {
    const roster = new RosterDto(eventname);

    squads.forEach(async (squad: SquadDto) => {
      const squadId = squad.id;
      squad.members = await this.entityManager.find(EnrolmentView, {
        where: { eventId, squadId },
        order: { position: 'ASC' },
      });
      roster.squads.push(squad);
    });

    roster.pool = await this.entityManager.find(EnrolmentView, {
      where: { eventId, enrolmentType: EnrolmentType.ANMELDUNG, squadId: null },
    });
    roster.commander = await this.entityManager.findOne(EnrolmentView, {
      where: { eventId, enrolmentType: EnrolmentType.ANMELDUNG, role: HLLRole.COMMANDER },
    });

    return roster;
  }

  private async moveToSquad(newSoldier: Enrolment): Promise<any> {
    return this.enrolmentRepository
      .createQueryBuilder()
      .update()
      .set({ squadId: newSoldier.squadId, position: newSoldier.position })
      .where('id=:id', { id: newSoldier.id })
      .execute();
  }

  private getSquads(eventId: number): Promise<Squad[]> {
    return this.squadRepository
      .createQueryBuilder('s')
      .where('s.eventId=:eventId', { eventId })
      .orderBy('position', 'ASC')
      .getMany();
  }
}
