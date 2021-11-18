import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrolmentsModule } from '../../enrolments/enrolments.module';
import { Squad } from '../../typeorm/entities';
import { EnrolmentMessageFactory } from './enrolmentMessage.factory';
import { InformationMessageFactory } from './informationMessage.factory';
import { MappollMessageFactory } from './mappollMessage.factory';

@Module({
  imports: [forwardRef(() => EnrolmentsModule), TypeOrmModule.forFeature([Squad])],
  providers: [InformationMessageFactory, EnrolmentMessageFactory, MappollMessageFactory],
  exports: [InformationMessageFactory, EnrolmentMessageFactory, MappollMessageFactory],
})
export class MessageModule {}
