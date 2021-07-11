import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { DiscordService } from "../../../../discord/discord.service";
import { EnrolmentsRepository } from "../../../../enrolments/enrolments.repository";
import { Enrolment, HllDiscordEvent, HLLEvent, Member } from "../../../../postgres/entities";
import { ReminderService } from "../reminder.service"

describe ("reminder.service",()=>{
    let service:ReminderService
    let enrolmentRepository:jest.Mocked<Repository<Enrolment>>
    let discordService:jest.Mocked<DiscordService>
    let queryBuilder: Partial<SelectQueryBuilder<Enrolment>>={
        select: jest.fn().mockReturnThis(),
        where:  jest.fn().mockReturnThis(),
        getMany: jest.fn()
    }
    beforeEach(async () => {

        const discordServiceMock: Partial<DiscordService> = {
            getMember: jest.fn()
          };

        const enrolmentRepositoryMock: Partial<Repository<Enrolment>>={
            query: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
        };
        const memberRepositoryMock: Partial<Repository<Member>>={
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReminderService,
              {
                provide: DiscordService,
                useValue: discordServiceMock,
              },
              {
                provide: getRepositoryToken(Enrolment),
                useValue: enrolmentRepositoryMock,
              },
              {
                provide: getRepositoryToken(Member),
                useValue: memberRepositoryMock,
              },
            ],
          }).compile();
      
          service = module.get<ReminderService>(ReminderService);
          enrolmentRepository = module.get(getRepositoryToken(Enrolment));
          discordService = module.get(DiscordService);
    })

    it("should be defined",()=>{
        expect(service).toBeDefined();
    });

    describe('getMissingEnrolmentOne',async () => {
        const event: Partial<HLLEvent> = {name:"TestEvent",discordEvent:{channelId:"23809457397"}as HllDiscordEvent}
        const members: Partial<Member>[] = [{id:"4234234234"},{id:"4359830958"}]

        enrolmentRepository.query.mockResolvedValue(members)
        await service.getMissingEnrolmentOne(event as HLLEvent)

        it("should call getMember or allMembers",async()=>{
            members.forEach((member)=>{expect(discordService).toHaveBeenCalledWith(member)})
        })
    });
})