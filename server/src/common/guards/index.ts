import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

export const guards: any[] = [AuthGuard, RolesGuard];

export * from './auth.guard';
export * from './roles.guard';
