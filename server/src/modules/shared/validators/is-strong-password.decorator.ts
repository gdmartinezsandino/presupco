import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validatePasswordRules } from '../password-policy';

@ValidatorConstraint({ async: false })
export class IsStrongPasswordConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    if (typeof value !== 'string') return false;
    const result = validatePasswordRules(value);
    return result === null;
  }

  defaultMessage() {
    return 'Password does not meet the strength requirements';
  }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}
