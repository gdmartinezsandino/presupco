import { Component, computed, signal, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActionSheetConfig {
  title: string;
  content: TemplateRef<unknown>;
}

@Component({
  selector: 'p-co-action-sheet',
  standalone: true,
  templateUrl: './action-sheet.component.html',
  styleUrls: ['./action-sheet.component.scss'],
  imports: [CommonModule],
})
export class ActionSheetComponent {
  public title = signal<string>('');
  public content = signal<TemplateRef<unknown> | null>(null);
  public visible = signal<boolean>(false);
  public isHiding = signal<boolean>(false);

  public actionSheetClasses = computed(() => ({
    'action-sheet--is-visible': this.visible() && !this.isHiding(),
    'action-sheet--is-hiding': this.isHiding(),
  }));

  public open(config: ActionSheetConfig): void {
    this.title.set(config.title);
    this.content.set(config.content);
    this.visible.set(true);
  }

  public close(): void {
    if (this.isHiding()) return;
    this.isHiding.set(true);

    setTimeout(() => {
      this.visible.set(false);
      this.isHiding.set(false);
      this.resetConfig();
      document.body.classList.remove('block-scroll');
    }, 700);
  }

  public resetConfig(): void {
    this.title.set('');
    this.content.set(null);
  }
}
