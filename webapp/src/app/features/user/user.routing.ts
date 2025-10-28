import { Route } from '@angular/router';

import { AuthGuard } from '@core/guards';

export const USER_ROUTES: Route[] = [
  {
    canActivate: [AuthGuard], 
    path: '', 
    loadComponent: () => import('src/app/features/user/components/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    canActivate: [AuthGuard], 
    path: 'change-password', 
    loadComponent: () => import('src/app/features/user/components/change-password/change-password.component').then((m) => m.ChangePasswordComponent), 
  },
];
