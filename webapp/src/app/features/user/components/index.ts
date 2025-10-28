import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const components = [
  ProfileComponent, 
  ChangePasswordComponent, 
] as const;

export * from './profile/profile.component';
export * from './change-password/change-password.component';
