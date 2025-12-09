
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'p-co-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html',
  imports: [],
})
export class FooterComponent {
  private _router = inject(Router);

  constructor() { }

  goTo(path: string): Promise<boolean> {
    return this._router.navigate([path]);
  }
}
