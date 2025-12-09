import { Component, input, ContentChild, TemplateRef, AfterContentInit } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './form-field.component.html'
})
export class UiFormFieldComponent implements AfterContentInit {
  public label = input<string>('');
  public control = input<AbstractControl | null>(null);

  @ContentChild(NgControl) ngControl!: NgControl;
  @ContentChild('errors') errorsTpl!: TemplateRef<any>;
  @ContentChild('hint') hintTpl!: TemplateRef<any>;

  public hasError: boolean | undefined = false;

  ngAfterContentInit() {
    const control = this.ngControl?.control;
    if (!control) return;
    
    control.statusChanges?.subscribe(() => {
      this.hasError = control.invalid && (control.dirty || control.touched);
    });
  }
}
