import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

import { LoggerService } from '@shared/services';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const start = Date.now();

    let hasError = false;

    return next.handle().pipe(
      tap(() => {
        // called on successful emission; we only log here for non-error responses
        if (!hasError && res.statusCode < 400) {
          const elapsed = Date.now() - start;
          const urlWithCtx = `${req.originalUrl} [${className}.${handlerName}]`;
          this.logger.logRequest(
            req.method,
            urlWithCtx,
            res.statusCode,
            elapsed,
            req.body,
          );
        }
      }),
      catchError((err: unknown) => {
        hasError = true;
        const elapsed = Date.now() - start;

        const augReq: Record<string, unknown> = {
          method: req.method,
          url: req.originalUrl,
          controller: className,
          handler: handlerName,
          body: req.body,
          elapsed,
        };

        this.logger.logError(err, augReq);
        return throwError(() => err);
      }),
    );
  }
}
