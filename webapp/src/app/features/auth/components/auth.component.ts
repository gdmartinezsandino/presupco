import { 
  Component, 
  AfterViewInit, 
  signal, 
  computed, 
  ViewChild, 
  ElementRef, 
  Renderer2 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'p-co-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterOutlet,
  ],
})
export class AuthComponent implements AfterViewInit {
  @ViewChild('header') headerRef!: ElementRef;
  @ViewChild('wrapper') wrapperRef!: ElementRef;

  public isLoaded = signal<boolean>(false);
  public authClasses = computed(() => ({
    'is-loaded': this.isLoaded(),
  }));

  constructor(private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isLoaded.set(true);
      this.headerAlignment();
    }, 1500);
  }

  headerAlignment(): void {
    const wrapperTop = this.wrapperRef.nativeElement.getBoundingClientRect().top;
    // const newHeaderTop = wrapperTop;
    this.renderer.setStyle(
      this.headerRef.nativeElement,
      'top',
      `${wrapperTop + 20}px`
    );
  }
}
