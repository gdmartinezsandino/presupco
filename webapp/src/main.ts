import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from '@core/core.routing';
import * as fromInterceptors from '@core/interceptors';
import { LayoutComponent } from '@core/components';

bootstrapApplication(LayoutComponent, {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(
      withInterceptors([
        fromInterceptors.AuthInterceptor, 
        fromInterceptors.LoggingHttpInterceptor,
      ]),
      withFetch(),
    ),
  ]
}).catch((err) => console.error(err));
