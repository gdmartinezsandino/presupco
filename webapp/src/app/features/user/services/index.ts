import { UserService } from './user.service';

export const services = [
  UserService,
] as const;

export * from './user.service';
