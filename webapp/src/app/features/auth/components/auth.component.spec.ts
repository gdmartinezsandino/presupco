import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Renderer2, ElementRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthComponent } from './auth.component';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AuthComponent,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        Renderer2
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with isLoaded as false', () => {
    expect(component.isLoaded()).toBeFalse();
  });

  it('should set isLoaded to true after initialization delay', fakeAsync(() => {
    component.ngAfterViewInit();
    expect(component.isLoaded()).toBeFalse();
    
    tick(1500);
    expect(component.isLoaded()).toBeTrue();
  }));

  it('should compute auth classes based on isLoaded signal', () => {
    expect(component.authClasses()).toEqual({ 'is-loaded': false });
    
    component.isLoaded.set(true);
    expect(component.authClasses()).toEqual({ 'is-loaded': true });
  });

  it('should align header after initialization', fakeAsync(() => {
    const mockRenderer = jasmine.createSpyObj('Renderer2', ['setStyle']);
    const component = new AuthComponent(mockRenderer);
    component.headerRef = { nativeElement: {} } as ElementRef<HTMLElement>;
    component.wrapperRef = { nativeElement: { getBoundingClientRect: () => ({ top: 100 }) } } as ElementRef<HTMLElement>;

    component.ngAfterViewInit();
    tick(1500);
    
    expect(mockRenderer.setStyle).toHaveBeenCalledWith(
      jasmine.any(Object),
      'top',
      '120px'
    );
  }));
});