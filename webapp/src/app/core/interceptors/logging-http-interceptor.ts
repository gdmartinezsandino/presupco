import { HttpInterceptorFn } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';

export const LoggingHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  let ok = '';

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          ok = 'succeeded';
        }
      },
      error: _error => {
        ok = 'failed';
      }
    }),
    finalize(() => {
      const elapsed = Date.now() - started;
      const msg = `${req.method} "${req.urlWithParams}" ${ok} in ${elapsed} ms.`;
      console.log(`LoggingHttp => ${msg}`);
    })
  );
};
