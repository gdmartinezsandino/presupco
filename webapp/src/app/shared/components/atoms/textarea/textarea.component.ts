import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  templateUrl: './textarea.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UiTextareaComponent, multi: true }
  ]
})
export class UiTextareaComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() rows = 4;

  value = '';
  disabled = false;

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(v: any) { this.value = v ?? ''; }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean) { this.disabled = isDisabled; }
}
