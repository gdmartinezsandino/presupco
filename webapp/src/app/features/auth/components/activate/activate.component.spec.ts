import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { ActivateComponent } from './activate.component';
import { AuthService } from '@auth/services';
import { UtilsService } from '@shared/services';

describe('ActivateComponent', () => {
  let component: ActivateComponent;
  let fixture: ComponentFixture<ActivateComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let utilsService: jasmine.SpyObj<UtilsService>;
  let router: Router;

  const mockPasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getActivationStatus', 'getPasswordPolicy']);
    const utilsServiceSpy = jasmine.createSpyObj('UtilsService', ['showToast', 'buildPasswordValidator', 'validateMatchField']);

    await TestBed.configureTestingModule({
      imports: [
        ActivateComponent,
        ReactiveFormsModule, 
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { token: 'valid-token' }
            }
          }
        },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UtilsService, useValue: utilsServiceSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    utilsService = TestBed.inject(UtilsService) as jasmine.SpyObj<UtilsService>;
    router = TestBed.inject(Router);

    // Default mock implementations
    authService.getActivationStatus.and.returnValue(Promise.resolve({ valid: true, activated: false, status: 'pending' }));
    authService.getPasswordPolicy.and.returnValue(Promise.resolve(mockPasswordPolicy));
    utilsService.buildPasswordValidator.and.returnValue(() => null);
    utilsService.validateMatchField.and.returnValue(() => null);

    fixture = TestBed.createComponent(ActivateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if token is missing', async () => {
    const activatedRoute = TestBed.inject(ActivatedRoute);
    Object.defineProperty(activatedRoute, 'snapshot', {
      get: () => ({ queryParams: {} })
    });

    const routerSpy = spyOn(router, 'navigate');
    fixture = TestBed.createComponent(ActivateComponent);
    component = fixture.componentInstance;
    
    // Trigger ngOnInit manually
    await component.ngOnInit();

    expect(utilsService.showToast).toHaveBeenCalledWith({ 
      message: 'Activation token missing', 
      type: 'alert' 
    });
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to register if token is invalid', async () => {
    authService.getActivationStatus.and.returnValue(Promise.resolve({ valid: false, activated: false, status: 'invalid' }));
    const routerSpy = spyOn(router, 'navigate');
    
    fixture.detectChanges();
    await fixture.whenStable();

    expect(utilsService.showToast).toHaveBeenCalledWith({ 
      message: 'Activation token invalid or expired', 
      type: 'alert' 
    });
    expect(routerSpy).toHaveBeenCalledWith(['/register']);
  });

  it('should redirect to login if account is already activated', async () => {
    authService.getActivationStatus.and.returnValue(Promise.resolve({ valid: true, activated: true, status: 'activated' }));
    const routerSpy = spyOn(router, 'navigate');
    
    fixture.detectChanges();
    await fixture.whenStable();

    expect(utilsService.showToast).toHaveBeenCalledWith({ 
      message: 'Account already activated. Please login.', 
      type: 'success' 
    });
    expect(routerSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should create form with password validators when token is valid', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.activateForm).toBeTruthy();
    expect(component.activateForm?.get('password')).toBeTruthy();
    expect(component.activateForm?.get('confirmPassword')).toBeTruthy();
    expect(utilsService.buildPasswordValidator).toHaveBeenCalledWith(mockPasswordPolicy);
    expect(utilsService.validateMatchField).toHaveBeenCalledWith(['password', 'confirmPassword']);
  });

  it('should toggle password visibility', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.passwordVisible).toBeFalse();
    component.passwordVisible = true;
    expect(component.passwordVisible).toBeTrue();
  });
});
