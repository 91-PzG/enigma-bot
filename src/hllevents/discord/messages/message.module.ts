import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrolmentsModule } from '../../../enrolments/enrolments.module';
import { Squad } from '../../../typeorm/entities';
import { EnrolmentMessageFactory } from './enrolmentMessage.factory';
import { InformationMessageFactory } from './informationMessage.factory';

@Module({
  imports: [forwardRef(() => EnrolmentsModule), TypeOrmModule.forFeature([Squad])],
  providers: [InformationMessageFactory, EnrolmentMessageFactory],
  exports: [InformationMessageFactory, EnrolmentMessageFactory],
})
export class MessageModule {}
