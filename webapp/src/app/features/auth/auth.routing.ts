import { Route } from '@angular/router';

import * as fromComponents from './components';

export const AUTH_ROUTES: Route[] = [
  {
    path: '',
    component: fromComponents.AuthComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('src/app/features/auth/components/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('src/app/features/auth/components/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'activate',
        loadComponent: () => import('src/app/features/auth/components/activate/activate.component').then((m) => m.ActivateComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('src/app/features/auth/components/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
      {
        path: 'change-password',
        loadComponent: () => import('src/app/features/auth/components/change-password/change-password.component').then((m) => m.ChangePasswordComponent),
      },
    ]
  }
];
