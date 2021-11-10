import { EntityRepository, Repository } from 'typeorm';
import { HllDiscordEvent } from '../../typeorm/entities';

@EntityRepository(HllDiscordEvent)
export class HLLDiscordEventRepository extends Repository<HllDiscordEvent> {
  createEntity(channel: string, info: string, enrolment: string): Promise<HllDiscordEvent> {
    const event = this.create();
    event.channelId = channel;
    event.informationMsg = info;
    event.enrolmentMsg = enrolment;
    return event.save();
  }
}
