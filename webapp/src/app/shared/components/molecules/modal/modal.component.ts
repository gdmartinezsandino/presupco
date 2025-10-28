import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Button {
  label: string;
  action: () => void;
}

export interface ModalConfig {
  confirm?: boolean;
  icon?: string;
  customSvg?: string; // SVG string for custom icons
  title: string;
  description: string;
  button: Button;
  secondaryButton?: Button; // Optional second button for two-button modals
  hideCloseButton?: boolean; // Option to hide the X close button
  customClass?: string; // Custom CSS class for specific modal styling
}

@Component({
  selector: 'p-co-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule],
})
export class ModalComponent {
  public confirm = signal<boolean>(false);
  public icon = signal<string>('');
  public customSvg = signal<string>('');
  public sanitizedCustomSvg = signal<SafeHtml | null>(null);
  public title = signal<string>('');
  public description = signal<string>('');
  public button = signal<Button>({ label: '', action: () => {} });
  public secondaryButton = signal<Button | undefined>(undefined);
  public hideCloseButton = signal<boolean>(false);
  public customClass = signal<string>('');
  public visible = signal<boolean>(false);
  public isHiding = signal<boolean>(false);

  public modalClasses = computed(() => ({
    'modal--is-hiding': this.isHiding(),
    'modal--is-confirmation': this.confirm(),
    [this.customClass()]: this.customClass() !== '',
  }));

  constructor(private sanitizer: DomSanitizer) {}

  show(config: ModalConfig): void {
    this.icon.set(config.icon ?? '');
    this.customSvg.set(config.customSvg ?? '');

    // Sanitize the custom SVG if provided
    if (config.customSvg) {
      this.sanitizedCustomSvg.set(this.sanitizer.bypassSecurityTrustHtml(config.customSvg));
    } else {
      this.sanitizedCustomSvg.set(null);
    }

    this.confirm.set(config.confirm ?? false);
    this.title.set(config.title);
    this.description.set(config.description);
    this.button.set(config.button);
    this.secondaryButton.set(config.secondaryButton);
    this.hideCloseButton.set(config.hideCloseButton ?? false);
    this.customClass.set(config.customClass ?? '');

    this.visible.set(true);
    this.isHiding.set(false);
    document.body.classList.add('block-scroll');
  }

  hide(): void {
    if (this.isHiding()) return;
    this.isHiding.set(true);

    setTimeout(() => {
      this.visible.set(false);
      this.isHiding.set(false);
      this.resetConfig();
      document.body.classList.remove('block-scroll');
    }, 300);
  }

  resetConfig(): void {
    this.confirm.set(false);
    this.customSvg.set('');
    this.sanitizedCustomSvg.set(null);
    this.title.set('');
    this.description.set('');
    this.button.set({ label: '', action: () => {} });
    this.secondaryButton.set(undefined);
    this.hideCloseButton.set(false);
    this.customClass.set('');
  }
}
