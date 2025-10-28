import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import * as fromDto from '@auth/dto';
import * as _fromDtoUsers from '@user/dto'
import * as fromInterfaces from '@auth/interfaces';
import * as fromEnumsShared from '@shared/enums';
import * as fromServicesCore from '@core/services';
import * as fromInterfacesUser from '@user/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _controller = 'auth';
  public currentUser = signal<fromInterfacesUser.User | null>(null);

  constructor(
    private _api: fromServicesCore.ApiService, 
    private _router: Router, 
  ) { }

  async getPasswordPolicy(): Promise<fromInterfaces.PasswordPolicy> {
    const response = await firstValueFrom(
      this._api.post<fromInterfaces.PasswordPolicy>(`${this._controller}/password-policy`, {})
    );
    return response;
  }

  async getActivationStatus(token: string): Promise<{ status: string }> {
    const response = await firstValueFrom(
      this._api.post<{ status: string }>(`${this._controller}/activation-status`, { token })
    );
    return response;
  }

  async activate(tokenOrId: string, payload?: { password?: string }): Promise<{ activated: boolean }> {
    const body = { token: tokenOrId, ...(payload || {}) };
    const response = await firstValueFrom(
      this._api.patch<{ activated: boolean }>(`${this._controller}/activate`, body)
    );
    return response;
  }

  async login(payload: fromDto.LoginDto): Promise<fromInterfaces.LoginResponse> {
    const response = await firstValueFrom(
      this._api.post<fromInterfaces.LoginResponse>(
        `${this._controller}/login`, 
        { ...payload } as Record<string, unknown>
      )
    );

    localStorage.setItem(fromEnumsShared.Storage.AUTH_TOKEN, response.token);
    localStorage.setItem(fromEnumsShared.Storage.USER, JSON.stringify(response.user));
    this.currentUser.set(response.user);
    
    return response;
  }

  async register(payload: fromDto.RegisterDto): Promise<fromInterfaces.RegisterResponse> {
    const response = await firstValueFrom(
      this._api.post<fromInterfaces.RegisterResponse>(
        `${this._controller}/register`, 
        { ...payload } as Record<string, unknown>
      )
    );

    return response;
  }

  logout(): void {
    localStorage.removeItem(fromEnumsShared.Storage.AUTH_TOKEN);
    localStorage.removeItem(fromEnumsShared.Storage.USER);
    this.currentUser.set(null);
    this._router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(fromEnumsShared.Storage.AUTH_TOKEN);
  }

  getUser(): fromInterfacesUser.User | null {
    const stored = localStorage.getItem(fromEnumsShared.Storage.USER);
    return stored ? JSON.parse(stored) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await firstValueFrom(
      this._api.post<{ message: string }>(
        `${this._controller}/forgot-password`,
        { email }
      )
    );
    return response;
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await firstValueFrom(
      this._api.post<{ message: string }>(
        `${this._controller}/change-password`,
        { token, password }
      )
    );
    return response;
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await firstValueFrom(
      this._api.post<{ message: string }>(
        `${this._controller}/change-password`,
        { oldPassword, newPassword }
      )
    );
    return response;
  }
}
