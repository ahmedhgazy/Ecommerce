import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { globalErrorInterceptor } from './interceptors/global-error.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { UserInterceptor } from './services/auth/interceptors/auth.interceptor';
import { NgxStarsModule } from 'ngx-stars';

import { TranslateModule } from '@ngx-translate/core';
import { translateConfig } from './translation.config';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideNgxStripe(environment.stripePublishableKey),
    provideAnimationsAsync(),
    importProvidersFrom(
      TranslateModule.forRoot(translateConfig)
    ),
    BrowserAnimationsModule,
    provideHttpClient(
      // Cache interceptor FIRST to return cached responses before loading indicator shows
      withInterceptors([cacheInterceptor, loadingInterceptor, UserInterceptor, globalErrorInterceptor]),
      withFetch(),
    ),
    NgxStarsModule,
  ],
};


