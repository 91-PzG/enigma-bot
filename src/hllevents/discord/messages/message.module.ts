import { forwardRef, Module, Provider } from '@nestjs/common';
import { EnrolmentsModule } from '../../../enrolments/enrolments.module';
import { EnrolmentMessageFactory } from './enrolmentMessage.factory';
import { InformationMessageFactory } from './informationMessage.factory';
import { RosterMessageFactory } from './roster.message.factory';

const FACTORIES: Provider[] = [
  InformationMessageFactory,
  EnrolmentMessageFactory,
  RosterMessageFactory,
];

@Module({
  imports: [forwardRef(() => EnrolmentsModule)],
  providers: FACTORIES,
  exports: FACTORIES,
})
export class MessageModule {}
