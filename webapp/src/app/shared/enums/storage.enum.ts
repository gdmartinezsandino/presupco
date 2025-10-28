export const Storage = {
  AUTH_TOKEN: 'accessToken',
  USER: 'user',
} as const;

export type StorageKeys = keyof typeof Storage;
