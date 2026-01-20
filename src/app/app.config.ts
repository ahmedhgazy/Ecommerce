import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {
    HttpClientModule,
    provideHttpClient,
    withFetch,
    withInterceptors,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { UserInterceptor } from './services/auth/interceptors/auth.interceptor';
import { NgxStarsModule } from 'ngx-stars';
import { LoadingService } from './shared/components/loading/loading.service';

import { TranslateModule } from '@ngx-translate/core';
import { translateConfig } from './translation.config';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideClientHydration(),
        provideNgxStripe(environment.stripePublishableKey),
        provideAnimationsAsync(),
        importProvidersFrom(
            HttpClientModule,
            TranslateModule.forRoot(translateConfig)
        ),
        BrowserAnimationsModule,
        provideHttpClient(
            withFetch(),
            withInterceptors([UserInterceptor])
        ),
        NgxStarsModule,
        LoadingService,
    ],
};
