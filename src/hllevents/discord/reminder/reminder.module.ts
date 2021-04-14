import { Module } from "@nestjs/common";
import { ReminderService } from "./reminder.service";

@Module({providers:[ReminderService]})
export class ReminderModule{


}
