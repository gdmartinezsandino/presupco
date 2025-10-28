import { Modal } from './modal.enum';
import { Storage } from './storage.enum';
import { App } from './shared.enum';

export const enums = [
  Modal,
  Storage,
  App,
] as const;

export * from './modal.enum';
export * from './storage.enum';
export * from './shared.enum';
