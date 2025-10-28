import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';

@Component({
  selector: 'p-co-back-top',
  styleUrls: ['./back-top.component.scss'],
  templateUrl: './back-top.component.html',
  imports: [
    CommonModule,
  ],
})
export class BackTopComponent implements OnInit {
  public windowScrolled: boolean = false;
  
  constructor(@Inject(DOCUMENT) private document: Document) {}
  
  @HostListener("window:scroll", [])
  onWindowScroll(): void {
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
      this.windowScrolled = true;
    } 
    else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
      this.windowScrolled = false;
    }
  }
  
  scrollToTop(): void {
    (function smoothscroll() {
      const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothscroll);
        window.scrollTo(0, currentScroll - (currentScroll / 8));
      }
    })();
  }

  // Initialize logic for back-to-top functionality
  ngOnInit(): void {
    // Check initial scroll position
    this.onWindowScroll();
  }
}
