import { Component, inject, signal } from '@angular/core';

import { Router } from '@angular/router';

import * as fromInterfaces from '@user/interfaces';
import * as fromAuthServices from '@auth/services';

@Component({
  selector: 'p-co-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [],
})
export class ProfileComponent {
  private _router = inject(Router);
  private _authService = inject(fromAuthServices.AuthService);

  public user = signal<fromInterfaces.User | null>(null);

  constructor() { }

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }

  logout(): void {
    this._router.navigate(['/login']);
    this._authService.logout();
  }
}
