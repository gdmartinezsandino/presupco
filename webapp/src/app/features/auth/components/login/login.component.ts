import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import * as fromDto from '@auth/dto';
import * as fromServicesAuth from '@auth/services';
import * as fromServicesShared from '@shared/services';
import * as fromConstantsShared from '@shared/constants';
import * as fromComponentsShared from '@shared/components';

@Component({
  selector: 'p-co-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    fromComponentsShared.UiFormFieldComponent,
    fromComponentsShared.UiInputComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  private _router = inject(Router);
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(fromServicesAuth.AuthService);
  private _utils = inject(fromServicesShared.UtilsService);
  
  public loginForm = this._formBuilder.group({
    email: ['', [
      Validators.required, 
      Validators.pattern(fromConstantsShared.EmailValidator)
    ]],
    password: ['', Validators.required],
  });
  public passwordVisible = signal(false);

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) return;

    this._utils.showLoader();

    try {
      const credentials = this.loginForm.value as fromDto.LoginDto;
      await this._authService.login(credentials);

      this._router.navigate(['/dashboard']);
    } 
    catch (error: Error | unknown) {
      this._utils.showToast({
        message: 'Invalid credentials, please try again.',
        type: 'alert'
      });

      console.error('Login failed', error);
    } 
    finally {
      this._utils.hideLoader();
    }
  }
}
