export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

export function validatePasswordRules(password: string) {
  const errors: Record<string, boolean> = {};
  if (!password || password.length < PASSWORD_POLICY.minLength) {
    errors['minLength'] = true;
  }
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors['uppercase'] = true;
  }
  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(password)) {
    errors['number'] = true;
  }
  if (PASSWORD_POLICY.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    errors['specialChar'] = true;
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function getPasswordPolicy() {
  return PASSWORD_POLICY;
}
