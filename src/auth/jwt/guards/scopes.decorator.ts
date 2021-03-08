import { SetMetadata } from '@nestjs/common';
import { AccessRoles } from '../../../postgres/entities';

export const Scopes = (...scopes: AccessRoles[]) =>
  SetMetadata('scopes', scopes);
