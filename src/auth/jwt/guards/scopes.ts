import { SetMetadata } from '@nestjs/common';
import { AccessRoles } from '../../../entities';

export const Scopes = (...scopes: AccessRoles[]) =>
  SetMetadata('scopes', scopes);
