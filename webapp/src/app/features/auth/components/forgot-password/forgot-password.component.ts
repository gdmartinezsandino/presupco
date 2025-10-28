import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import * as fromServices from '@auth/services';
import * as fromServicesShared from '@shared/services';
import * as fromConstantsShared from '@shared/constants';

@Component({
  selector: 'p-co-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class ForgotPasswordComponent {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(fromServices.AuthService);
  private _utils = inject(fromServicesShared.UtilsService);

  public forgotPasswordForm: FormGroup;
  public emailToResetPassword = signal('');

  constructor(
    private _router: Router
  ) {
    this.forgotPasswordForm = this._formBuilder.group({
      email: ['', [
        Validators.required, 
        Validators.pattern(fromConstantsShared.EmailValidator)]
      ],
      confirmEmail: ['', [Validators.required]],
    }, {
      validators: this._utils.validateMatchField(['email', 'confirmEmail'])
    });
  }

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }

  getField(form: FormGroup, field: string): AbstractControl | null {
    return form.get(field);
  }

  async onForgotPassword(): Promise<void> {
    if (!this.forgotPasswordForm.dirty || !this.forgotPasswordForm.valid) {
      return;
    }

    try {
      this._utils.showLoader();
      const email = this.forgotPasswordForm.get('email')?.value;
      const response = await this._authService.forgotPassword(email);
      this._utils.showToast({ message: response.message, type: 'success' });
      await this.goTo('/login');
    } catch (error: unknown) {
      const err = error as { error?: { message: string } };
      this._utils.showToast({ 
        message: err.error?.message || 'An error occurred', 
        type: 'alert' 
      });
    } finally {
      this._utils.hideLoader();
    }
  }
}
