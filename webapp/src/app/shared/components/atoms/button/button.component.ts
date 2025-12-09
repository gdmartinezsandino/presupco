import { CommonModule } from '@angular/common';
import { Component, computed, input, Input, signal } from '@angular/core';

@Component({
  selector: 'ui-button',
  standalone: true,
  templateUrl: './button.component.html',
  imports: [CommonModule],
})
export class UiButtonComponent {
  public type = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  public buttonClasses = computed(() => ({
    'btn-primary': this.type() === 'primary',
    'btn-secondary': this.type() === 'secondary',
    'btn-ghost': this.type() === 'ghost',
    'btn-error': this.type() === 'danger'
  }));
  public disabled = input<boolean>(false);
}
