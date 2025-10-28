import { AuthGuard } from './auth.guard';

export const guards = [
  AuthGuard, 
] as const;

export * from './auth.guard';
