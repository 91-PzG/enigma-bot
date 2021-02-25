import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const scopes = this.reflector.get<string[]>('scopes', ctx.getHandler());
    if (!scopes) return true;

    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    const hasScope = () => user.roles.some((role) => scopes.includes(role));
    return user && user.roles && hasScope();
  }
}
