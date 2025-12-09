import { Component, forwardRef, input, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface UiOption { value: string; label: string; }

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiSelectComponent),
      multi: true,
    },
  ],
})
export class UiSelectComponent implements ControlValueAccessor {
  public options = input<UiOption[]>([]);
  public placeholder = input<string>('');
  public disabled = input<boolean>(false);
  public value = signal<string | null>(null);

  onChange: (v: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(v: any): void {
    this.value = v ?? null;
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  handleChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value || null;
    this.value.set(val);
    this.onChange(val);
  }
}
