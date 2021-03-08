import { EntityRepository, Repository } from 'typeorm';
import { Enrolment } from '../postgres/entities';

@EntityRepository(Enrolment)
export class EnrolmentsRepository extends Repository<Enrolment> {
  getEmbedEnrolments(eventId: number): Promise<Enrolment[]> {
    return this.createQueryBuilder()
      .select(['username', 'squadlead', 'commander', 'enrolmentType', 'division'])
      .where('eventId = :eventId', { eventId })
      .orderBy('timestamp', 'ASC')
      .getMany();
  }
}
