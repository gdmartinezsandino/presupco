export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  name: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  password: string;
  token: string;
}

export interface ActivateDto {
  token: string;
  password?: string;
}
