import { SetMetadata } from '@nestjs/common';

/**
 * Usage: @Roles('admin', 'user')
 * Stores metadata under the 'roles' key which `RolesGuard` reads.
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
