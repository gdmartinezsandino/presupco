import { AfterViewInit, Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastConfig {
  type: string;
  message: string;
}

@Component({
  selector: 'p-co-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports: [CommonModule],
})
export class ToastComponent implements AfterViewInit {
  @ViewChild('toast') toast!: ElementRef<HTMLElement>;
  public message = signal<string>('');
  public type = signal<string>('');
  public visible = signal<boolean>(false);
  public isHiding = signal<boolean>(false);

  public toastClasses = computed(() => ({
    'toast--warning': this.type() === 'warning',
    'toast--success': this.type() === 'success',
    'toast--alert': this.type() === 'alert',
    'toast--is-hiding': this.isHiding(),
  }));

  ngAfterViewInit(): void {
    this.centerToast();
  }

  show(config: ToastConfig): void {
    this.message.set(config.message);
    this.type.set(config.type);
    this.visible.set(true);
    this.isHiding.set(false);

    setTimeout(() => this.centerToast(), 0);
    setTimeout(() => this.hide(), 10000);
  }

  hide(): void {
    if (this.isHiding()) return;
    this.isHiding.set(true);

    setTimeout(() => {
      this.visible.set(false);
      this.message.set('');
      this.isHiding.set(false);
    }, 300);
  }

  centerToast(): void {
    if (!this.toast) return;
  
    const toastEl = this.toast.nativeElement as HTMLElement;
    const width = toastEl.offsetWidth;
    const left = `calc(50vw - ${width / 2}px)`;
  
    toastEl.style.left = left;
  }
}
