import { AuthService } from './auth.service';

export const services = [
  AuthService,
] as const;

export * from './auth.service';
