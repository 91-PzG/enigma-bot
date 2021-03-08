import { Module } from '@nestjs/common';
import { EnrolmentsModule } from '../../../enrolments/enrolments.module';
import { UsersModule } from '../../../users/users.module';
import { RegistrationManager } from './registration.manager';

@Module({
  imports: [EnrolmentsModule, UsersModule],
  providers: [RegistrationManager],
  exports: [RegistrationManager],
})
export class RegistrationModule {}
