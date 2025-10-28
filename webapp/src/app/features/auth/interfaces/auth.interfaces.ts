import * as fromInterfacesUser from '@user/interfaces';

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

export interface LoginResponse {
  token: string;
  user: fromInterfacesUser.User;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginResponse {
  user: fromInterfacesUser.User;
  token: string;
}

export interface RegisterResponse {
  message: string;
  emailSent?: boolean;
}

export interface ActivationStatus {
  valid: boolean;
  activated: boolean;
  status: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

export interface ActivationResponse {
  activated: boolean;
  message?: string;
}
