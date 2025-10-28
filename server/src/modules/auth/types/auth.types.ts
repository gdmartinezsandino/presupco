// External dependencies
import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export type AuthRequest = Request & { user?: AuthUser };
