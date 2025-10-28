import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const components = [
  AuthComponent,
  LoginComponent,
  ChangePasswordComponent,
  ForgotPasswordComponent,
] as const;

export * from './auth.component';
export * from './login/login.component';
export * from './change-password/change-password.component';
export * from './forgot-password/forgot-password.component';
