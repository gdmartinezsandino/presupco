import { Component, inject, input, OnDestroy, OnInit, signal  } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import * as fromServicesAuth from '@auth/services';


@Component({
  selector: 'p-co-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
  imports: [CommonModule],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private _router = inject(Router);
  private destroy$ = new Subject<void>();
  private _authService = inject(fromServicesAuth.AuthService);
  private _location = inject(Location);
  public previousUrl = signal<string>('');
  public profileRoute = signal<boolean>(false);

  public userLogged = signal<boolean>(false);
  public showBackButton = input<boolean>(false);
  public title = input<string>('');
  public subtitle = input<string>('');

  constructor () { }

  ngOnInit(): void {
    this._router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.profileRoute.set(event.urlAfterRedirects.includes('/profile'));
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async goBack(): Promise<void> {
    this._location.back();
  }

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }

  logout(): void {
    this._authService.logout();
  }
}
