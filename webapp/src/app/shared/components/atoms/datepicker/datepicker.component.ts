import { Component, ElementRef, Input, AfterViewInit, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import flatpickr from 'flatpickr';

@Component({
  selector: 'ui-datepicker',
  standalone: true,
  templateUrl: './datepicker.component.html',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: UiDatepickerComponent, multi: true }
  ]
})
export class UiDatepickerComponent implements AfterViewInit, ControlValueAccessor {
  public enableTime = signal<boolean>(false);

  private instance!: flatpickr.Instance;
  private value: any;

  constructor(private el: ElementRef) {}

  onChange = (_: any) => {};
  onTouched = () => {};

  ngAfterViewInit() {
    this.instance = flatpickr(this.el.nativeElement.querySelector('input'), {
      enableTime: this.enableTime(),
      dateFormat: this.enableTime() ? 'Y-m-d H:i' : 'Y-m-d',
      defaultDate: this.value,
      onChange: (selected) => {
        this.value = selected[0];
        this.onChange(this.value);
      }
    });
  }

  writeValue(v: any) {
    this.value = v;
    if (this.instance) this.instance.setDate(v, false);
  }

  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean) {
    this.el.nativeElement.querySelector('input').disabled = isDisabled;
  }
}
