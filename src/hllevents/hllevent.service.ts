import { Injectable } from '@nestjs/common';
import { HllEvent } from '../entities';

@Injectable()
export class HllEventService {
  async getAll(): Promise<HllEvent[]> {
    return [];
  }
}
