import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '@auth/services';
import { UtilsService } from '@shared/services';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let utilsService: jasmine.SpyObj<UtilsService>;
  let router: Router;

  const defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
  });

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['forgotPassword']);
    const utilsServiceSpy = jasmine.createSpyObj('UtilsService', ['showLoader', 'hideLoader', 'showToast', 'validateMatchField']);

    // Mock validateMatchField
    utilsServiceSpy.validateMatchField.and.returnValue((_control: AbstractControl) => {
      return null; // Always return valid for tests
    });

    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UtilsService, useValue: utilsServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    utilsService = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with email and confirm-email controls', () => {
    expect(component.forgotPasswordForm.get('email')).toBeTruthy();
    expect(component.forgotPasswordForm.get('confirmEmail')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.forgotPasswordForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['pattern']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should navigate to specified path', async () => {
    const routerSpy = spyOn(router, 'navigate');
    await component.goTo('/login');
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  describe('onForgotPassword', () => {
    it('should not submit if form is invalid', async () => {
      component.forgotPasswordForm.controls['email'].setValue('invalid-email');
      component.forgotPasswordForm.controls['confirmEmail'].setValue('different@email.com');
      component.forgotPasswordForm.markAsDirty();
      
      await component.onForgotPassword();
      
      expect(utilsService.showLoader).not.toHaveBeenCalled();
      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should submit valid email and show success message', (done) => {
      const email = 'test@example.com';
      component.forgotPasswordForm.patchValue({
        email: email,
        confirmEmail: email
      });
      component.forgotPasswordForm.markAsDirty();
      
      const mockResponse = {
        message: 'Password reset email sent'
      };
      
      authService.forgotPassword.and.returnValue(Promise.resolve(mockResponse));
      const routerSpy = spyOn(router, 'navigate');

      component.onForgotPassword().then(() => {

        expect(utilsService.showLoader).toHaveBeenCalled();
        expect(authService.forgotPassword).toHaveBeenCalledWith(email);
        expect(utilsService.showToast).toHaveBeenCalledWith({
          message: mockResponse.message,
          type: 'success'
        });
        expect(routerSpy).toHaveBeenCalledWith(['/login']);
        expect(utilsService.hideLoader).toHaveBeenCalled();
        done();
      });
    });

    it('should handle error', (done) => {
      const email = 'test@example.com';
      component.forgotPasswordForm.patchValue({
        email: email,
        confirmEmail: email
      });
      component.forgotPasswordForm.markAsDirty();
      
      const error = { error: { message: 'User not found' } };
      authService.forgotPassword.and.rejectWith(error);

      component.onForgotPassword().then(() => {
        expect(utilsService.showToast).toHaveBeenCalledWith({
          message: error.error.message,
          type: 'alert'
        });
        expect(utilsService.hideLoader).toHaveBeenCalled();
        done();
      });
    });
  });
});
