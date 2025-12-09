
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import * as fromServicesAuth from '@auth/services';
import * as fromServicesShared from '@shared/services';

@Component({
  selector: 'p-co-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
]
})
export class ActivateComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _service = inject(fromServicesAuth.AuthService);
  private _utils = inject(fromServicesShared.UtilsService);

  public activateForm: FormGroup | null = null;
  public passwordVisible = false;
  public confirmVisible = false;
  public tokenOrId = '';

  constructor(
    private _formBuilder: FormBuilder
  ) { }

  async ngOnInit(): Promise<void> {
    const query = this._route.snapshot.queryParams;
    this.tokenOrId = query['id'] || query['email'] || query['token'] || '';

    // check activation token status before building form
    if (!this.tokenOrId) {
      this._utils.showToast({ message: 'Activation token missing', type: 'alert' });
      this._router.navigate(['/login']);
      return;
    }

    interface ActivationStatus {
      valid: boolean;
      activated: boolean;
      status: string;
    }

    const status = await this._service.getActivationStatus(this.tokenOrId) as ActivationStatus;
    if (!status?.valid) {
      this._utils.showToast({ message: 'Activation token invalid or expired', type: 'alert' });
      this._router.navigate(['/register']);
      return;
    }

    if (status.activated) {
      this._utils.showToast({ message: 'Account already activated. Please login.', type: 'success' });
      this._router.navigate(['/login']);
      return;
    }

    interface PasswordPolicy {
      minLength: number;
      requireUppercase: boolean;
      requireNumber: boolean;
      requireSpecialChar: boolean;
    }
    
    const defaultPolicy: PasswordPolicy = {
      minLength: 8,
      requireUppercase: true,
      requireNumber: true,
      requireSpecialChar: true
    };

    const rawPolicy = await this._service.getPasswordPolicy();
    const policy: PasswordPolicy = {
      minLength: typeof rawPolicy?.['minLength'] === 'number' ? rawPolicy['minLength'] : defaultPolicy.minLength,
      requireUppercase: typeof rawPolicy?.['requireUppercase'] === 'boolean' ? rawPolicy['requireUppercase'] : defaultPolicy.requireUppercase,
      requireNumber: typeof rawPolicy?.['requireNumber'] === 'boolean' ? rawPolicy['requireNumber'] : defaultPolicy.requireNumber,
      requireSpecialChar: typeof rawPolicy?.['requireSpecialChar'] === 'boolean' ? rawPolicy['requireSpecialChar'] : defaultPolicy.requireSpecialChar
    };
    
    const passwordValidator = this._utils.buildPasswordValidator(policy);    this.activateForm = this._formBuilder.group({
      password: ['', [Validators.required, passwordValidator]],
      confirmPassword: ['', Validators.required],
    }, {
      validators: this._utils.validateMatchField(['password', 'confirmPassword'])
    });
  }

  getField(name: string): AbstractControl | null {
    return this.activateForm?.get(name) ?? null;
  }

  async onActivate(): Promise<void> {
    if (!this.activateForm || this.activateForm.invalid) return;
    
    const { password } = this.activateForm.value;
    try {
      await this._service.activate(this.tokenOrId, { password });
      this._router.navigate(['/login']);
      this._utils.showToast({ message: 'Account activated. You can now login.', type: 'success' });
    } 
    catch (error: unknown) {
      const e = error as Error;
      this._utils.showToast({ message: e?.message || 'Activation failed', type: 'alert' });
    }
  }
}
