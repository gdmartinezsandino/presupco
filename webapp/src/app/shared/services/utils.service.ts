import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import * as fromSharedComponents from '../components';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  private loaderRef!: fromSharedComponents.LoaderComponent;
  private toastRef!: fromSharedComponents.ToastComponent;
  private actionSheetRef!: fromSharedComponents.ActionSheetComponent;
  private modalRef!: fromSharedComponents.ModalComponent;

  constructor() {}

  validateMatchField(fields: [string, string]) {
    return (form: FormGroup): ValidationErrors | null => {
      const fieldA = form.get(fields[0]);
      const fieldB = form.get(fields[1]);
  
      if (!fieldA || !fieldB) return null;
  
      const valueA = fieldA.value;
      const valueB = fieldB.value;
  
      if (!valueB) return null;
  
      if (valueA !== valueB) {
        fieldB.setErrors({ ...(fieldB.errors || {}), dontMatch: true });
        return { dontMatch: true };
      } else {
        if (fieldB.errors?.['dontMatch']) {
          delete fieldB.errors['dontMatch'];
          if (Object.keys(fieldB.errors).length === 0) {
            fieldB.setErrors(null);
          } else {
            fieldB.setErrors(fieldB.errors); // update remaining errors
          }
        }
      }
  
      return null;
    };
  }

  passwordStrengthValidator(): ValidatorFn {
    // Deprecated: frontend should fetch the canonical password policy from the backend
    // and use `buildPasswordValidator(policy)` to construct a ValidatorFn.
    // Kept for backward compatibility; it mirrors the common policy.
    return this.buildPasswordValidator({ minLength: 8, requireUppercase: true, requireNumber: true, requireSpecialChar: true });
  }

  buildPasswordValidator(policy: { minLength: number; requireUppercase: boolean; requireNumber: boolean; requireSpecialChar: boolean; }): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value ?? '';
      if (!value) return null;

      const errors: ValidationErrors = {};
      if (value.length < (policy.minLength || 8)) errors['minLength'] = true;
      if (policy.requireUppercase && !/[A-Z]/.test(value)) errors['uppercase'] = true;
      if (policy.requireNumber && !/[0-9]/.test(value)) errors['number'] = true;
      if (policy.requireSpecialChar && !/[^A-Za-z0-9]/.test(value)) errors['specialChar'] = true;

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  resetFormState(form: FormGroup): void {
    form.reset();
    form.markAsUntouched();
    form.markAsPristine();
  }

  registerLoader(ref: fromSharedComponents.LoaderComponent): void {
    this.loaderRef = ref;
  }
  showLoader(): void {
    document.body.classList.add('block-scroll');
    this.loaderRef?.show();
  }
  hideLoader(): void {
    document.body.classList.remove('block-scroll');
    this.loaderRef?.hide();
  }

  registerToast(ref: fromSharedComponents.ToastComponent): void {
    this.toastRef = ref;
  }
  showToast(config: fromSharedComponents.ToastConfig): void {
    this.toastRef?.show(config);
  }

  registerModal(ref: fromSharedComponents.ModalComponent): void {
    this.modalRef = ref;
  }
  showModal(config: fromSharedComponents.ModalConfig): void {
    this.modalRef?.show({
      ...config,
    });
  }

  registerActionSheet(ref: fromSharedComponents.ActionSheetComponent): void {
    this.actionSheetRef = ref;
  }
  showActionSheet(config: fromSharedComponents.ActionSheetConfig): void {
    document.body.classList.add('block-scroll');
    this.actionSheetRef?.open({
      ...config,
    });
  }
  hideActionSheet(): void {
    document.body.classList.remove('block-scroll');
    this.actionSheetRef?.close();
  }

  toTitleCase(str: string): string {
    return str
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
  }
}
