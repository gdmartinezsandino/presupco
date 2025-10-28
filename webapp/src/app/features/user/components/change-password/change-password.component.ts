import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

import * as fromDto from '@user/dto';
import * as fromServices from '@user/services';
import * as fromServicesAuth from '@auth/services';
import * as fromServicesShared from '@shared/services';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

@Component({
  selector: 'p-co-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    fromServices.UserService,
  ],
})
export class ChangePasswordComponent implements OnInit {
  private _router = inject(Router);
  private _formBuilder = inject(FormBuilder);
  private _utils = inject(fromServicesShared.UtilsService);
  private _service = inject(fromServices.UserService);
  private _serviceAuth = inject(fromServicesAuth.AuthService);
  
  public currentPasswordVisible = signal<boolean>(false);
  public newPasswordVisible = signal<boolean>(false);
  public confirmPasswordVisible = signal<boolean>(false);
  public accessToken = signal<string>('');
  public changePasswordForm: FormGroup | null = null;

  constructor() { }

  async ngOnInit(): Promise<void> {
    const defaultPolicy: PasswordPolicy = {
      minLength: 8,
      requireUppercase: true,
      requireNumber: true,
      requireSpecialChar: true
    };

    const rawPolicy = await this._serviceAuth.getPasswordPolicy();
    const policy: PasswordPolicy = {
      minLength: typeof rawPolicy?.['minLength'] === 'number' ? rawPolicy['minLength'] : defaultPolicy.minLength,
      requireUppercase: typeof rawPolicy?.['requireUppercase'] === 'boolean' ? rawPolicy['requireUppercase'] : defaultPolicy.requireUppercase,
      requireNumber: typeof rawPolicy?.['requireNumber'] === 'boolean' ? rawPolicy['requireNumber'] : defaultPolicy.requireNumber,
      requireSpecialChar: typeof rawPolicy?.['requireSpecialChar'] === 'boolean' ? rawPolicy['requireSpecialChar'] : defaultPolicy.requireSpecialChar
    };
    
    const passwordValidator = this._utils.buildPasswordValidator(policy);

    this.changePasswordForm = this._formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, passwordValidator]
      ],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this._utils.validateMatchField(['newPassword', 'confirmPassword'])
    });
  }

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }

  getField(field: string): AbstractControl | null { 
    return this.changePasswordForm?.get(field) || null;
  }

  onSubmit(): void { 
    if (!this.changePasswordForm || !this.changePasswordForm.valid) return;
    this._utils.showLoader();
    const _formattedData = {
      password: this.changePasswordForm.value.newPassword,
      token: this.accessToken(),
    } as fromDto.ChangePasswordDto;
  }
}
