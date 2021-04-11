import { Module } from '@nestjs/common';
import { EnrolmentsModule } from '../../../enrolments/enrolments.module';
import { UsersModule } from '../../../users/users.module';
import { RegistrationDialog } from './registration.dialog';
import { RegistrationManager } from './registration.manager';

@Module({
  imports: [EnrolmentsModule, UsersModule],
  providers: [RegistrationManager, RegistrationDialog],
  exports: [RegistrationManager],
})
export class RegistrationModule {}
