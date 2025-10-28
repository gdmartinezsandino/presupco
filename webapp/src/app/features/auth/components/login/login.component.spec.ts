import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LoginComponent } from './login.component';
import { AuthService } from '@auth/services';
import { UtilsService } from '@shared/services';
import { LoginResponse as _LoginResponse } from '@auth/interfaces';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let utilsService: jasmine.SpyObj<UtilsService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const utilsServiceSpy = jasmine.createSpyObj('UtilsService', ['showLoader', 'hideLoader', 'showToast']);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
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

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with email and password controls', () => {
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['pattern']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should require password', () => {
    const passwordControl = component.loginForm.get('password');
    expect(passwordControl?.errors?.['required']).toBeTruthy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.errors).toBeNull();
  });

  it('should toggle password visibility', () => {
    expect(component.passwordVisible()).toBeFalse();
    component.passwordVisible.set(true);
    expect(component.passwordVisible()).toBeTrue();
  });

  it('should navigate to specified path', async () => {
    const routerSpy = spyOn(router, 'navigate');
    await component.goTo('/register');
    expect(routerSpy).toHaveBeenCalledWith(['/register']);
  });

  describe('onLogin', () => {
    it('should not submit if form is invalid', async () => {
      component.loginForm.controls['email'].setValue('invalid-email');
      component.loginForm.controls['password'].setValue('');
      
      await component.onLogin();
      
      expect(utilsService.showLoader).not.toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should submit valid credentials and navigate to dashboard', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      component.loginForm.setValue(credentials);
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        birthday: new Date(),
        roles: ['user'],
        lastLogin: new Date(),
        avatar: '',
        state: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      authService.login.and.returnValue(Promise.resolve({
        token: 'mock-token',
        user: mockUser
      }));
      const routerSpy = spyOn(router, 'navigate');

      await component.onLogin();

      expect(utilsService.showLoader).toHaveBeenCalled();
      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
      expect(utilsService.hideLoader).toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'wrong-password'
      });
      
      authService.login.and.rejectWith(new Error('Login failed'));
      const consoleSpy = spyOn(console, 'error');

      await component.onLogin();

      expect(utilsService.showToast).toHaveBeenCalledWith({
        message: 'Invalid credentials, please try again.',
        type: 'alert'
      });
      expect(consoleSpy).toHaveBeenCalledWith('Login failed', jasmine.any(Error));
      expect(utilsService.hideLoader).toHaveBeenCalled();
    });
  });
});