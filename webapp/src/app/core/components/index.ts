import { ErrorComponent } from './error/error.component';
import { LayoutComponent } from './layout/layout.component';

export const components = [
  ErrorComponent, 
  LayoutComponent, 
] as const;

export * from './layout/layout.component';
export * from './error/error.component';
