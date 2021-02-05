import { EntityRepository, Repository } from 'mikro-orm';
import { Event } from './event.entity';

@Repository(Event)
export class EventRepository extends EntityRepository<Event> {}
