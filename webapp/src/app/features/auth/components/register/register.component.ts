
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import * as fromDto from '@auth/dto';
import * as fromServicesAuth from '@auth/services';
import * as fromServicesUser from '@user/services';
import * as fromServicesShared from '@shared/services';
import * as fromConstantsShared from '@shared/constants';

@Component({
  selector: 'p-co-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
],
  providers: [
    fromServicesUser.UserService, 
  ],
})
export class RegisterComponent {
  private _router = inject(Router);
  private _formBuilder = inject(FormBuilder);
  private _authService = inject(fromServicesAuth.AuthService);
  private _userService = inject(fromServicesUser.UserService);
  private _utils = inject(fromServicesShared.UtilsService);
  
  public registerForm = this._formBuilder.group({
    name: ['', Validators.required],
    email: ['', [
      Validators.required, 
      Validators.pattern(fromConstantsShared.EmailValidator)
    ]],
  });

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }

  async onRegister(): Promise<void> {
    if (this.registerForm.invalid) return;

    this._utils.showLoader();

    try {
      const credentials = this.registerForm.value as fromDto.RegisterDto;
      await this._authService.register(credentials);

      this._utils.showToast({ 
        message: 'Registration successful. Check your email to activate your account.', 
        type: 'success' 
      });

      this._router.navigate(['/login']);
    } 
    catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      this._utils.showToast({
        message,
        type: 'alert'
      });

      console.error('Register failed', error);
    } 
    finally {
      this._utils.hideLoader();
    }
  }
}
