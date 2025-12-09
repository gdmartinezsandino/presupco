import { Component, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UiCheckboxComponent, multi: true }
  ]
})
export class UiCheckboxComponent {
  public label = input<string>('');
  public value = signal<boolean>(false);
  public disabled = signal<boolean>(false);

  onChange = (_: any) => {};
  onTouched = () => {};

  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
}
