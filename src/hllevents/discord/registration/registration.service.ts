import { Logger } from '@nestjs/common';
import {
  GuildEmoji,
  Message,
  MessageReaction,
  ReactionCollector,
  ReactionEmoji,
  User,
} from 'discord.js';
import { EnrolmentType, HLLEvent } from '../../../postgres/entities';
import { RegistrationManager } from './registration.manager';

export class RegistrationService {
  private collector: ReactionCollector;
  private logger = new Logger('Collector Service');
  private closed = false;

  private filter = (reaction: MessageReaction, user: User) => {
    if (user.bot) return false;
    reaction.users.remove(user);
    const name = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name;
    if (
      Object.values(this.manager.config.reactions).includes(name) &&
      name != this.manager.config.reactions.locked
    ) {
      return true;
    }
    return false;
  };

  constructor(
    public event: HLLEvent,
    public message: Message,
    private manager: RegistrationManager,
  ) {
    this.collector = this.message.createReactionCollector({ filter: this.filter });
    this.collector.on('collect', this.onCollect);
    this.collector.on('end', this.onEnd);
    this.logger.debug(`Started collector for event ${event.id} - ${event.name}`);
  }

  async stopCollector() {
    this.collector.stop();
  }

  private onEnd = async () => {
    await this.event.reload();
    if (!this.closed) {
      await this.event.reload();
      this.event.closed = true;
      this.event.save();
    }
    this.manager.closeEvent(this.event.id);
  };

  private onCollect = async (reaction: MessageReaction, user: User) => {
    const member = await this.manager.usersService.getActiveMember(user.id);
    if (!member) return;

    this.manager.dialog
      .startDialog(this.getEnrolmentType(reaction.emoji), user, this.event, member)
      .then(() => {
        this.manager.hllEventDiscordService.updateEnrolmentMessage(this.event);
      });
  };

  private getEnrolmentType(emoji: GuildEmoji | ReactionEmoji): EnrolmentType {
    const name = emoji.id ? emoji.id : emoji.name;
    switch (name) {
      case this.manager.config.reactions.AN:
        return EnrolmentType.ANMELDUNG;
      case this.manager.config.reactions.AB:
        return EnrolmentType.ABMELDUNG;
      default:
        return EnrolmentType.RESERVE;
    }
  }
}
