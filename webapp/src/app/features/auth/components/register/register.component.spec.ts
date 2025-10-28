import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RegisterComponent } from './register.component';
import { AuthService } from '@auth/services';
import { UserService } from '@user/services';
import { UtilsService } from '@shared/services';
import { RegisterDto } from '@auth/dto';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let _userService: jasmine.SpyObj<UserService>;
  let utilsService: jasmine.SpyObj<UtilsService>;
  let router: Router;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUsers']);
    const utilsServiceSpy = jasmine.createSpyObj('UtilsService', [
      'showLoader',
      'hideLoader',
      'showToast'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        RouterTestingModule,
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

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required controls', () => {
    expect(component.registerForm.get('name')).toBeTruthy();
    expect(component.registerForm.get('email')).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.errors?.['pattern']).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.errors).toBeNull();
  });

  it('should require name', () => {
    const nameControl = component.registerForm.get('name');
    expect(nameControl?.errors?.['required']).toBeTruthy();

    nameControl?.setValue('John Doe');
    expect(nameControl?.errors).toBeNull();
  });

  it('should navigate to specified path', async () => {
    const routerSpy = spyOn(router, 'navigate');
    await component.goTo('/login');
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  describe('onRegister', () => {
    it('should not submit if form is invalid', async () => {
      component.registerForm.controls['email'].setValue('invalid-email');
      component.registerForm.controls['name'].setValue('');
      
      await component.onRegister();
      
      expect(utilsService.showLoader).not.toHaveBeenCalled();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should register successfully and redirect to login', async () => {
      const credentials: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      component.registerForm.setValue(credentials);
      authService.register.and.returnValue(Promise.resolve({
        message: 'Registration successful',
        emailSent: true
      }));
      const routerSpy = spyOn(router, 'navigate');

      await component.onRegister();

      expect(utilsService.showLoader).toHaveBeenCalled();
      expect(authService.register).toHaveBeenCalledWith(credentials);
      expect(utilsService.showToast).toHaveBeenCalledWith({
        message: 'Registration successful. Check your email to activate your account.',
        type: 'success'
      });
      expect(routerSpy).toHaveBeenCalledWith(['/login']);
      expect(utilsService.hideLoader).toHaveBeenCalled();
    });

    it('should handle registration error with custom message', async () => {
      component.registerForm.setValue({
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      const error = new Error('Email already exists');
      authService.register.and.rejectWith(error);
      const consoleSpy = spyOn(console, 'error');

      await component.onRegister();

      expect(utilsService.showToast).toHaveBeenCalledWith({
        message: error.message,
        type: 'alert'
      });
      expect(consoleSpy).toHaveBeenCalledWith('Register failed', error);
      expect(utilsService.hideLoader).toHaveBeenCalled();
    });

    it('should handle registration error with generic message', async () => {
      component.registerForm.setValue({
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      authService.register.and.rejectWith('Unknown error');
      const consoleSpy = spyOn(console, 'error');

      await component.onRegister();

      expect(utilsService.showToast).toHaveBeenCalledWith({
        message: 'Registration failed',
        type: 'alert'
      });
      expect(consoleSpy).toHaveBeenCalledWith('Register failed', 'Unknown error');
      expect(utilsService.hideLoader).toHaveBeenCalled();
    });
  });
});