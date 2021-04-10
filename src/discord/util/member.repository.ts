import { EntityRepository, Repository } from 'typeorm';
import { Member } from '../../postgres/entities';

@EntityRepository(Member)
export class MemberRepository extends Repository<Member> {}
