import { forwardRef, Module } from '@nestjs/common';
import { EnrolmentsModule } from '../../../enrolments/enrolments.module';
import { EnrolmentMessageFactory } from './enrolmentMessage.factory';
import { InformationMessageFactory } from './informationMessage.factory';

@Module({
  imports: [forwardRef(() => EnrolmentsModule)],
  providers: [InformationMessageFactory, EnrolmentMessageFactory],
  exports: [InformationMessageFactory, EnrolmentMessageFactory],
})
export class MessageModule {}
