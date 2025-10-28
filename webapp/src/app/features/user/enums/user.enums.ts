export const Role = {
  USER: 'User',
  ADMIN: 'Admin',
  SUPERADMIN: 'SuperAdmin'
} as const;

export type RoleKeys = keyof typeof Role;
export type RoleValues = (typeof Role)[RoleKeys];
