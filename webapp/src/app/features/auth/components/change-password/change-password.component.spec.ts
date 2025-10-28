import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  template: ''
})
class DummyComponent {}

import { ChangePasswordComponent } from './change-password.component';
import { AuthService } from '@auth/services';
import { UserService } from '@user/services';
import { UtilsService } from '@shared/services';
import { PasswordPolicy } from '@auth/interfaces';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let _userService: jasmine.SpyObj<UserService>;
  let utilsService: jasmine.SpyObj<UtilsService>;
  let router: Router;

  const defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
  });

  const mockPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getPasswordPolicy', 'resetPassword']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['changePassword']);
    const utilsServiceSpy = jasmine.createSpyObj('UtilsService', [
      'showLoader',
      'hideLoader',
      'showToast',
      'buildPasswordValidator',
      'validateMatchField'
    ]);

    // Setup default mock implementations
    authServiceSpy.getPasswordPolicy.and.returnValue(Promise.resolve(mockPasswordPolicy));
    utilsServiceSpy.buildPasswordValidator.and.returnValue(() => null);
    utilsServiceSpy.validateMatchField.and.returnValue(() => null);

    const routes: Routes = [
      { path: 'login', component: DummyComponent },
      { path: 'change-password', component: ChangePasswordComponent }
    ];

    await TestBed.configureTestingModule({
      imports: [
        ChangePasswordComponent,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: UtilsService, useValue: utilsServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    _userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    utilsService = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    router = TestBed.inject(Router);
    
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    beforeEach((done) => {
      fixture.detectChanges();
      component.ngOnInit().then(() => {
        fixture.detectChanges();
        done();
      });
    });

    it('should initialize form with password validators', () => {
      expect(component.changePasswordForm).toBeTruthy();
      expect(component.changePasswordForm?.get('password')).toBeTruthy();
      expect(component.changePasswordForm?.get('confirmPassword')).toBeTruthy();
      
      expect(authService.getPasswordPolicy).toHaveBeenCalled();
      expect(utilsService.buildPasswordValidator).toHaveBeenCalledWith(mockPasswordPolicy);
      expect(utilsService.validateMatchField).toHaveBeenCalledWith(['password', 'confirmPassword']);
    });

    it('should have required validators', () => {
      const passwordControl = component.changePasswordForm?.get('password');
      const confirmPasswordControl = component.changePasswordForm?.get('confirmPassword');

      expect(passwordControl?.hasValidator(Validators.required)).toBeTrue();
      expect(confirmPasswordControl?.hasValidator(Validators.required)).toBeTrue();
    });
  });

  describe('Password Policy', () => {
    it('should use default password policy if none returned from service', fakeAsync(() => {
      authService.getPasswordPolicy.and.returnValue(Promise.resolve(null as unknown as PasswordPolicy));
      
      fixture.detectChanges();
      component.ngOnInit();
      tick();
      fixture.detectChanges();
        
      expect(utilsService.buildPasswordValidator).toHaveBeenCalledWith({
        minLength: 8,
        requireUppercase: true,
        requireNumber: true,
        requireSpecialChar: true
      });
    }));

    it('should handle service error and use default policy', async () => {
      const error = { error: { message: 'Failed to fetch policy' } };
      authService.getPasswordPolicy.and.returnValue(Promise.reject(error));
      spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      await component.ngOnInit();
      fixture.detectChanges();

      expect(utilsService.showToast).toHaveBeenCalledWith({
        message: error.error.message,
        type: 'alert'
      });
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Token Handling', () => {
    it('should initialize with token from URL', (done) => {
      const mockToken = 'test-token';
      spyOn(component['_route'].snapshot.queryParamMap, 'get').and.returnValue(mockToken);
      
      fixture.detectChanges();
      component.ngOnInit().then(() => {
        fixture.detectChanges();
        expect(component['token']).toBe(mockToken);
        done();
      });
    });

    it('should handle missing token in URL', (done) => {
      spyOn(component['_route'].snapshot.queryParamMap, 'get').and.returnValue(null);
      
      fixture.detectChanges();
      component.ngOnInit().then(() => {
        fixture.detectChanges();
        expect(component['token']).toBeNull();
        done();
      });
    });
  });

  describe('Password Visibility', () => {
    it('should toggle password visibility correctly', (done) => {
      fixture.detectChanges();
      component.ngOnInit().then(() => {
        fixture.detectChanges();
        
        expect(component.passwordVisible()).toBeFalse();
        component.passwordVisible.set(true);
        expect(component.passwordVisible()).toBeTrue();
        
        expect(component.confirmPasswordVisible()).toBeFalse();
        component.confirmPasswordVisible.set(true);
        expect(component.confirmPasswordVisible()).toBeTrue();
        done();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to specified path', (done) => {
      const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
      component.goTo('/login').then(() => {
        expect(routerSpy).toHaveBeenCalledWith(['/login']);
        done();
      });
    });

    it('should return navigation promise', (done) => {
      const _routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
      component.goTo('/login').then((result) => {
        expect(result).toBeTrue();
        done();
      });
    });
  });

  describe('Form Management', () => {
    beforeEach((done) => {
      fixture.detectChanges();
      component.ngOnInit().then(() => {
        fixture.detectChanges();
        done();
      });
    });

    it('should get form field correctly', () => {
      const passwordField = component.getField('password');
      expect(passwordField).toBeTruthy();
      expect(passwordField).toBe(component.changePasswordForm!.get('password'));
    });

    it('should return null for non-existent field', () => {
      const nonExistentField = component.getField('nonexistent');
      expect(nonExistentField).toBeNull();
    });
  });

  describe('Form Submission', () => {
    beforeEach((done) => {
      fixture.detectChanges();
      component.ngOnInit().then(() => {
        fixture.detectChanges();
        done();
      });
    });

    it('should not submit if form is invalid', (done) => {
      // Form starts empty, which is invalid
      component.onChangePassword().then(() => {
        expect(authService.resetPassword).not.toHaveBeenCalled();
        expect(utilsService.showLoader).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not submit if form is not dirty', (done) => {
      // Set valid values but don't mark as dirty
      component.changePasswordForm?.patchValue({
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!'
      });
      
      component.onChangePassword().then(() => {
        expect(authService.resetPassword).not.toHaveBeenCalled();
        expect(utilsService.showLoader).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle successful password reset with token', (done) => {
      const mockToken = 'test-token';
      const newPassword = 'ValidPass1!';
      const mockResponse = { message: 'Password reset successful' };

      // Set token and mock response
      component['token'] = mockToken;
      authService.resetPassword.and.returnValue(Promise.resolve(mockResponse));
      const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

      // Set form values
      component.changePasswordForm?.patchValue({
        password: newPassword,
        confirmPassword: newPassword
      });
      component.changePasswordForm?.markAsDirty();
      fixture.detectChanges();

      // Submit form
      component.onChangePassword().then(() => {
        expect(utilsService.showLoader).toHaveBeenCalled();
        expect(authService.resetPassword).toHaveBeenCalledWith(mockToken, newPassword);
        expect(utilsService.showToast).toHaveBeenCalledWith({
          message: mockResponse.message,
          type: 'success'
        });
        expect(routerSpy).toHaveBeenCalledWith(['/login']);
        expect(utilsService.hideLoader).toHaveBeenCalled();
        done();
      });
    });

    it('should handle password reset error', (done) => {
      const mockToken = 'test-token';
      const error = { error: { message: 'Reset failed' } };
      component['token'] = mockToken;
      authService.resetPassword.and.rejectWith(error);

      // Set form values
      component.changePasswordForm?.patchValue({
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!'
      });
      component.changePasswordForm?.markAsDirty();
      fixture.detectChanges();

      // Submit form
      component.onChangePassword().then(() => {
        expect(utilsService.showLoader).toHaveBeenCalled();
        expect(utilsService.showToast).toHaveBeenCalledWith({
          message: error.error.message,
          type: 'alert'
        });
        expect(utilsService.hideLoader).toHaveBeenCalled();
        done();
      });
    });

    it('should handle non-specific errors', (done) => {
      const mockToken = 'test-token';
      component['token'] = mockToken;
      authService.resetPassword.and.rejectWith('Unknown error');

      // Set form values
      component.changePasswordForm?.patchValue({
        password: 'ValidPass1!',
        confirmPassword: 'ValidPass1!'
      });
      component.changePasswordForm?.markAsDirty();
      fixture.detectChanges();

      // Submit form
      component.onChangePassword().then(() => {
        expect(utilsService.showToast).toHaveBeenCalledWith({
          message: 'An error occurred',
          type: 'alert'
        });
        done();
      });
    });
  });
});