import { EntityRepository, Repository } from 'typeorm';
import { Contact, Enrolment } from '../typeorm/entities';

@EntityRepository(Enrolment)
export class EnrolmentsRepository extends Repository<Enrolment> {
  getEnrolmentsForEvent(eventId: number): Promise<Enrolment[]> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect(Contact, 'contact', 'e.memberId = contact.id')
      .where('e.eventId = :eventId', { eventId })
      .andWhere('not e.enrolmentType == AB')
      .orderBy('e.timestamp', 'ASC')
      .getMany();
  }
}
