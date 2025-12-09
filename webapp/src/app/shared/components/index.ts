import { BackTopComponent } from './atoms/back-top/back-top.component';
import { UiButtonComponent } from './atoms/button/button.component';
import { UiCheckboxComponent } from './atoms/checkbox/checkbox.component';
import { UiDatepickerComponent } from './atoms/datepicker/datepicker.component';
import { UiInputComponent } from './atoms/input/input.component';
import { LoaderComponent } from './atoms/loader/loader.component';
import { UiRadioComponent } from './atoms/radio/radio.component';
import { UiSelectComponent } from './atoms/select/select.component';
import { UiSwitchComponent } from './atoms/switch/switch.component';
import { UiTextareaComponent } from './atoms/textarea/textarea.component';
import { ToastComponent } from './atoms/toast/toast.component';
import { ActionSheetComponent } from './molecules/action-sheet/action-sheet.component';
import { UiFormFieldComponent } from './molecules/form-field/form-field.component';
import { ModalComponent } from './molecules/modal/modal.component';
import { HeaderComponent } from './organisms/header/header.component';
import { FooterComponent } from './organisms/footer/footer.component';

export const components = [
  BackTopComponent,
  UiButtonComponent,
  UiCheckboxComponent,
  UiDatepickerComponent,
  LoaderComponent,
  UiInputComponent,
  UiRadioComponent,
  UiSelectComponent,
  UiSwitchComponent,
  UiTextareaComponent,
  ActionSheetComponent,
  UiFormFieldComponent,
  ToastComponent,
  ModalComponent,
  HeaderComponent,
  FooterComponent,
] as const;

export * from './atoms/back-top/back-top.component';
export * from './atoms/button/button.component';
export * from './atoms/checkbox/checkbox.component';
export * from './atoms/datepicker/datepicker.component';
export * from './atoms/input/input.component';
export * from './atoms/loader/loader.component';
export * from './atoms/radio/radio.component';
export * from './atoms/select/select.component';
export * from './atoms/switch/switch.component';
export * from './atoms/textarea/textarea.component';
export * from './atoms/toast/toast.component';
export * from './molecules/action-sheet/action-sheet.component';
export * from './molecules/form-field/form-field.component';
export * from './molecules/modal/modal.component';
export * from './organisms/header/header.component';
export * from './organisms/footer/footer.component';
