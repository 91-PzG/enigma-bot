import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class EventGuard implements CanActivate {
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    if (!user) return false;
    return user.roles.includes('eventorga');
  }
}
