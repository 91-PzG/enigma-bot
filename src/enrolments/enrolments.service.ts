import { Injectable } from '@nestjs/common';
import { EnrolmentsRepository } from './enrolments.repository';

@Injectable()
export class EnrolmentsService {
  constructor(private repository: EnrolmentsRepository) {}
}
