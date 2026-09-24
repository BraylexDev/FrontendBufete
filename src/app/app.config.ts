import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { FileManagementService } from './domain/services/fileManagement/file-management.service';
import { FormsModule } from '@angular/forms';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimations(),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(FormsModule),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    FileManagementService
  ]
};
