import { Component, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  templateUrl: './input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UiInputComponent,
      multi: true,
    },
  ],
})
export class UiInputComponent implements ControlValueAccessor {
  public type = input<string>('text');
  public placeholder = input<string>('');
  public disabled = input<boolean>(false);
  public isDisabled = signal<boolean>(false);
  public value = signal<any>('');

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
  }
}
