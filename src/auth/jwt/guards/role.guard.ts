import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private configService: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    if (this.configService.get('jwt.debugMode') === 'true') return true;

    const scopes = this.reflector.get<string[]>('scopes', ctx.getHandler());
    if (!scopes) return true;

    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    if (!user || !user.roles) return false;

    return user.roles.some((role) => scopes.includes(role));
  }
}
