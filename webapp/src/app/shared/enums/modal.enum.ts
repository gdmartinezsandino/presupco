export const Modal = {
  SIZES: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
  }
} as const;

export type ModalKeys = keyof typeof Modal;
export type ModalValues = (typeof Modal)[ModalKeys];
