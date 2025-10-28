import { AuthInterceptor } from './auth-interceptor';
import { LoggingHttpInterceptor } from './logging-http-interceptor';

export const services = [
  AuthInterceptor, 
  LoggingHttpInterceptor, 
] as const;

export * from './auth-interceptor';
export * from './logging-http-interceptor';
