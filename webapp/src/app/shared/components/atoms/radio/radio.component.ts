import { Component, input, Input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-radio',
  standalone: true,
  templateUrl: './radio.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UiRadioComponent, multi: true }
  ]
})
export class UiRadioComponent implements ControlValueAccessor {
  public label = input<string>('');
  public disabled = input<boolean>(false);
  public value = input<boolean>(false);

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(v: any) { this.value = v; }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
}
