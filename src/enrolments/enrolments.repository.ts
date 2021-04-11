import { EntityRepository, Repository } from 'typeorm';
import { Contact, Enrolment } from '../postgres/entities';

@EntityRepository(Enrolment)
export class EnrolmentsRepository extends Repository<Enrolment> {
  getEmbedEnrolments(eventId: number): Promise<Enrolment[]> {
    return this.createQueryBuilder('e')
      .leftJoinAndSelect(Contact, 'contact', 'e.memberId = contact.id')
      .select(['username', 'squadlead', 'commander', '"enrolmentType"', 'division', 'name'])
      .where('e.eventId = :eventId', { eventId })
      .orderBy('e.timestamp', 'ASC')
      .getRawMany();
  }
}
