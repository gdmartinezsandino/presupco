
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import * as fromServices from '@auth/services';
import * as fromServicesShared from '@shared/services';
import * as fromInterfaces from '@auth/interfaces';

@Component({
  selector: 'p-co-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
],
})
export class ChangePasswordComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(fromServices.AuthService);
  private _utils = inject(fromServicesShared.UtilsService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);

  public changePasswordForm!: FormGroup;
  private token: string | null = null;
  public passwordVisible = signal(false);
  public confirmPasswordVisible = signal(false);

  getField(fieldName: string): AbstractControl | null {
    return this.changePasswordForm.get(fieldName);
  }

  async ngOnInit(): Promise<void> {
    // Check for token in URL (reset password flow)
    this.token = this._route.snapshot.queryParamMap.get('token');

    // Get password policy and build validators
    try {
      const policy = await this._authService.getPasswordPolicy();
      const defaultPolicy: fromInterfaces.PasswordPolicy = {
        minLength: 8,
        requireUppercase: true,
        requireNumber: true,
        requireSpecialChar: true
      };
      const passwordValidator = this._utils.buildPasswordValidator(policy ?? defaultPolicy);

      // Build form based on scenario
      const formGroup: Record<string, [string, (Validators | ((control: AbstractControl) => null | { [key: string]: boolean }))[]]> = {
        password: ['', [Validators.required, passwordValidator]],
        confirmPassword: ['', [Validators.required]],
      };

      this.changePasswordForm = this._formBuilder.group(formGroup, {
        validators: this._utils.validateMatchField(['password', 'confirmPassword'])
      });
    } catch (error: unknown) {
      const err = error as { error?: { message: string } };
      this._utils.showToast({ message: err.error?.message || 'Failed to load password requirements', type: 'alert' });
      await this.goTo('/login');
    }
  }

  async onChangePassword(): Promise<void> {
    if (this.changePasswordForm?.dirty && this.changePasswordForm?.valid) {
      try {
        this._utils.showLoader();
        const password = this.changePasswordForm.get('password')?.value;

        if (this.token) {
          // Reset password flow (with token)
          const response = await this._authService.resetPassword(this.token, password);
          this._utils.showToast({ message: response.message, type: 'success' });
        }

        await this.goTo('/login');
      } catch (error: unknown) {
        const err = error as { error?: { message: string } };
        this._utils.showToast({ message: err.error?.message || 'An error occurred', type: 'alert' });
      } finally {
        this._utils.hideLoader();
      }
    }
  }

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }
}
