import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';

import * as fromEnums from '@shared/enums';

@Component({
  selector: 'p-co-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [
    CommonModule,
  ],
})
export class LoaderComponent {
  public visible = signal<boolean>(false);
  public message = input<string>('');
  public darkBackdrop = input<boolean>(false);
  public spinnerSize = input<number>(fromEnums.App.LOADER.SIZES.MEDIUM);

  public loaderClasses = computed(() => ({
    'loader--is-visible': this.visible(),
    'loader--dark-backdrop': this.darkBackdrop(),
  }));

  show(): void {
    this.visible.set(true);
  }

  hide(): void {
    this.visible.set(false);
  }
}
