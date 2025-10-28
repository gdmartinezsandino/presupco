import { Routes } from '@angular/router';

import { AuthGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('src/app/features/auth/auth.routing').then((M) => M.AUTH_ROUTES)
  },

  { 
    path: 'dashboard', 
    loadComponent: () => import('src/app/features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },

  { 
    canActivate: [AuthGuard],
    path: 'profile',
    loadChildren: () => import('src/app/features/user/user.routing').then((M) => M.USER_ROUTES)
  },

  { 
    path: '**', 
    loadComponent: () => import('src/app/core/components/error/error.component').then((m) => m.ErrorComponent)
  },
];
