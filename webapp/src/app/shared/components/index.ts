import { BackTopComponent } from './atoms/back-top/back-top.component';
import { LoaderComponent } from './atoms/loader/loader.component';
import { ToastComponent } from './atoms/toast/toast.component';
import { ActionSheetComponent } from './molecules/action-sheet/action-sheet.component';
import { ModalComponent } from './molecules/modal/modal.component';
import { HeaderComponent } from './organisms/header/header.component';
import { FooterComponent } from './organisms/footer/footer.component';

export const components = [
  BackTopComponent,
  LoaderComponent,
  ToastComponent,
  ActionSheetComponent,
  ModalComponent,
  HeaderComponent,
  FooterComponent,
] as const;

export * from './atoms/back-top/back-top.component';
export * from './atoms/loader/loader.component';
export * from './atoms/toast/toast.component';
export * from './molecules/action-sheet/action-sheet.component';
export * from './molecules/modal/modal.component';
export * from './organisms/header/header.component';
export * from './organisms/footer/footer.component';
