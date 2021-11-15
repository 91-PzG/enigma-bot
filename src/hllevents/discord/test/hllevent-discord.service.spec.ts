import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ButtonInteraction,
  Message,
  MessageActionRow,
  MessageButton,
  TextChannel,
} from 'discord.js';
import { DiscordService } from '../../../discord/discord.service';
import { HllDiscordEvent, HLLEvent } from '../../../typeorm/entities';
import { HLLEventRepository } from '../../hllevent.repository';
import { HLLDiscordEventRepository } from '../hlldiscordevent.repository';
import { HLLEventsDiscordService } from '../hllevent-discord.service';
import { EnrolmentMessage } from '../messages/enrolment.message';
import { EnrolmentMessageFactory } from '../messages/enrolmentMessage.factory';
import { InformationMessage } from '../messages/information.message';
import { InformationMessageFactory } from '../messages/informationMessage.factory';

describe('HLLEventDiscordService', () => {
  let service: HLLEventsDiscordService;
  let discordService: jest.Mocked<DiscordService>;
  let discordRepository: jest.Mocked<HLLDiscordEventRepository>;
  let eventRepository: jest.Mocked<HLLEventRepository>;
  let informationMessage: InformationMessage;
  let enrolmentMessage: EnrolmentMessage;
  let discordEvent: HllDiscordEvent;
  let event: HLLEvent;
  let oldMessage: Message;
  let components: MessageActionRow;
  let channel: TextChannel;
  const lockedEmoji = '🔒';
  const closedEmoji = '🛑';
  const discordEventId = 2;

  beforeEach(async () => {
    informationMessage = {
      id: '1234',
    } as unknown as InformationMessage;
    enrolmentMessage = {
      id: '4321',
    } as unknown as EnrolmentMessage;
    discordEvent = {
      channelId: 'channel-id',
      enrolmentMsg: 'enrolment-msg',
      informationMsg: 'information-msg',
    } as unknown as HllDiscordEvent;
    event = {
      id: 1,
      locked: false,
      closed: false,
      channelName: 'channelName',
    } as unknown as HLLEvent;
    oldMessage = {
      edit: jest.fn(),
    } as unknown as Message;
    channel = {
      send: jest.fn().mockResolvedValue({ id: '54321' }),
    } as unknown as TextChannel;
    components = new MessageActionRow().addComponents(
      new MessageButton({
        customId: `${event.id}-register`,
        style: 'SUCCESS',
        label: 'Anmelden',
        emoji: null,
        disabled: false,
      }),
      new MessageButton({
        customId: `${event.id}-squadlead-register`,
        style: 'PRIMARY',
        label: 'Squadlead',
        emoji: null,
        disabled: false,
      }),
      new MessageButton({
        customId: `${event.id}-commander-register`,
        style: 'SECONDARY',
        label: 'Kommandant',
        emoji: null,
        disabled: false,
      }),
      new MessageButton({
        customId: `${event.id}-cancel-register`,
        style: 'DANGER',
        label: 'Abmelden',
        emoji: null,
        disabled: false,
      }),
    );

    const discordServiceMock: Partial<DiscordService> = {
      createEventChannelIfNotExists: jest.fn().mockResolvedValue(channel),
      getMessageById: jest.fn().mockResolvedValue(oldMessage),
    };
    const discordRepositoryMock: Partial<HLLDiscordEventRepository> = {
      createEntity: jest.fn().mockResolvedValue({ id: discordEventId }),
      findOne: jest.fn().mockResolvedValue(discordEvent),
    };
    const eventRepositoryMock: Partial<HLLEventRepository> = {
      getPublishableEvents: jest.fn(),
      getLockableEvents: jest.fn(),
      getClosableEvents: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
    };
    const informationFactoryMock: Partial<InformationMessageFactory> = {
      createMessage: jest.fn().mockReturnValue(informationMessage),
    };
    const enrolmentFactoryMock: Partial<EnrolmentMessageFactory> = {
      createMessage: jest.fn().mockResolvedValue(enrolmentMessage),
    };
    const configServiceMock: Partial<ConfigService> = {
      get: jest.fn().mockImplementation((config: string) => {
        return config.endsWith('closedEmoji') ? closedEmoji : lockedEmoji;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HLLEventsDiscordService,
        {
          provide: DiscordService,
          useValue: discordServiceMock,
        },
        {
          provide: HLLDiscordEventRepository,
          useValue: discordRepositoryMock,
        },
        {
          provide: HLLEventRepository,
          useValue: eventRepositoryMock,
        },
        {
          provide: InformationMessageFactory,
          useValue: informationFactoryMock,
        },
        {
          provide: EnrolmentMessageFactory,
          useValue: enrolmentFactoryMock,
        },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<HLLEventsDiscordService>(HLLEventsDiscordService);
    eventRepository = module.get(HLLEventRepository);
    discordRepository = module.get(HLLDiscordEventRepository);
    discordService = module.get(DiscordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishMessages', () => {
    describe('sendMessages', () => {
      describe('informationMesage', () => {
        it('should send information message to channel', async () => {
          await service.publishMessages(event);
          expect(channel.send).toBeCalledWith({ embeds: [informationMessage] });
        });
      });

      describe('enrolmentMesage', () => {
        it('should send enrolment message to channel', async () => {
          await service.publishMessages(event);
          expect(channel.send).toBeCalledWith({
            embeds: [enrolmentMessage],
            components: [components],
          });
        });

        describe('buttons', () => {
          it('should disable all buttons if event is closed', async () => {
            event.closed = true;
            components.components.forEach((component: MessageButton) => {
              component.disabled = true;
              component.emoji = {
                id: null,
                name: closedEmoji,
                animated: false,
              };
            });
            await service.publishMessages(event);
            expect(channel.send).toBeCalledWith({
              embeds: [enrolmentMessage],
              components: [components],
            });
          });

          it('should disable some buttons if event is locked', async () => {
            event.locked = true;
            components.components
              .filter((component) => !component.customId.includes('cancel'))
              .forEach((component: MessageButton) => {
                component.disabled = true;
                component.emoji = {
                  id: null,
                  name: lockedEmoji,
                  animated: false,
                };
              });
            await service.publishMessages(event);
            expect(channel.send).toBeCalledWith({
              embeds: [enrolmentMessage],
              components: [components],
            });
          });
        });
      });
    });

    describe('update Event', () => {
      it('should update event', async () => {
        await service.publishMessages(event);
        expect(eventRepository.update).toHaveBeenCalledWith(event.id, {
          discordEventId,
          autoPublishDate: null,
        });
      });
    });
  });

  describe('update messages', () => {
    describe('updateEnrolmentMessage', () => {
      it('should not throw error if no discord event is found', () => {
        discordRepository.findOne.mockResolvedValue(undefined);
        const expectation = () => service.updateEnrolmentMessage(event);
        expect(expectation).not.toThrow();
      });

      it('should close event', async () => {
        discordService.getMessageById.mockResolvedValue(undefined);
        await service.updateEnrolmentMessage(event);
        expect(eventRepository.update).toHaveBeenCalledWith(event.id, { closed: true });
      });

      it('should update message', async () => {
        await service.updateEnrolmentMessage(event);
        expect(oldMessage.edit).toHaveBeenCalledWith({
          embeds: [enrolmentMessage],
          components: [components],
        });
      });

      it('should update interaction message', async () => {
        const interaction = {
          message: {
            edit: jest.fn(),
          },
        };
        await service.updateEnrolmentMessage(event, interaction as unknown as ButtonInteraction);
        expect(interaction.message.edit).toHaveBeenCalledWith({
          embeds: [enrolmentMessage],
          components: [components],
        });
      });
    });

    describe('updateInformationMessage', () => {
      it('should not throw error if no discord event is found', () => {
        discordRepository.findOne.mockResolvedValue(undefined);
        const expectation = () => service.updateInformationMessage(event);
        expect(expectation).not.toThrow();
      });

      it('should close event', async () => {
        discordService.getMessageById.mockResolvedValue(undefined);
        await service.updateInformationMessage(event);
        expect(eventRepository.update).toHaveBeenCalledWith(event.id, { closed: true });
      });

      it('should update message', async () => {
        await service.updateInformationMessage(event);
        expect(oldMessage.edit).toHaveBeenCalledWith({
          embeds: [informationMessage],
        });
      });
    });
  });

  describe('checkEvents', () => {
    const publishEvents = [
      {
        id: 1,
        locked: false,
        closed: false,
        channelName: 'channelName',
      },
      {
        id: 2,
        locked: false,
        closed: false,
        channelName: 'channelName',
      },
    ];
    const lockEvents = [
      {
        id: 3,
        locked: false,
        closed: false,
        channelName: 'channelName',
      },
      {
        id: 4,
        locked: false,
        closed: false,
        channelName: 'channelName',
      },
    ];
    const closeEvents = [
      {
        id: 5,
        locked: false,
        closed: false,
        channelName: 'channelName',
      },
      {
        id: 6,
        locked: false,
        closed: false,
        channelName: 'channelName',
      },
    ];

    beforeEach(() => {
      eventRepository.getPublishableEvents.mockResolvedValue(publishEvents as HLLEvent[]);
      eventRepository.getLockableEvents.mockResolvedValue(lockEvents as HLLEvent[]);
      eventRepository.getClosableEvents.mockResolvedValue(closeEvents as HLLEvent[]);
      service.publishMessages = jest.fn();
      service.updateEnrolmentMessage = jest.fn();
    });

    it('should lock or close or publish each event', async () => {
      jest.setTimeout(10000);
      expect.assertions(closeEvents.length * 2 + lockEvents.length * 2 + publishEvents.length);
      service.checkEvents();
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          for (const e of closeEvents) {
            expect(service.updateEnrolmentMessage).toHaveBeenCalledWith(e);
            expect(eventRepository.update).toHaveBeenCalledWith(e.id, { closed: true });
          }
          for (const e of lockEvents) {
            expect(service.updateEnrolmentMessage).toHaveBeenCalledWith(e);
            expect(eventRepository.update).toHaveBeenCalledWith(e.id, { locked: true });
          }
          for (const e of publishEvents) {
            expect(service.publishMessages).toHaveBeenCalledWith(e);
          }
          resolve();
        }, 2000);
      });
    });
  });
});
