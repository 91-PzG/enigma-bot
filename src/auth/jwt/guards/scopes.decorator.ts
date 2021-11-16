import { SetMetadata } from '@nestjs/common';
import { AccessRoles } from '../../../typeorm/entities';

export const Scopes = (...scopes: AccessRoles[]) => SetMetadata('scopes', scopes);
