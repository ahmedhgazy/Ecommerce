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
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';
import { NgxStarsModule } from 'ngx-stars';
import { LoadingService } from './shared/components/loading/loading.service';
import { GoogleInterceptor } from './services/auth/interceptors/google.interceptor';
import { TranslateModule } from '@ngx-translate/core';
import { translateConfig } from './translation.config';
const firebaseConfig = {
    apiKey: 'AIzaSyArXnKU909e-tuZ1sQbznfCC_hjhODpZuw',
    authDomain: 'e-commerce-ac5d3.firebaseapp.com',
    databaseURL: 'https://e-commerce-ac5d3-default-rtdb.firebaseio.com',
    projectId: 'e-commerce-ac5d3',
    storageBucket: 'e-commerce-ac5d3.appspot.com',
    messagingSenderId: '18506674420',
    appId: '1:18506674420:web:7b5bf84cdfcaac89456ea1',
    measurementId: 'G-SKL0V7HDPS',
};

export function initializeFirebase() {
    return isPlatformBrowser(globalThis.document)
        ? initializeApp(firebaseConfig)
        : null;
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideClientHydration(),
        provideAnimationsAsync(),
        importProvidersFrom(
            HttpClientModule,

            TranslateModule.forRoot(translateConfig)
        ),
        BrowserAnimationsModule,
        provideHttpClient(
            withFetch(),
            withInterceptors([UserInterceptor, GoogleInterceptor])
        ),
        provideFirebaseApp(() => initializeFirebase()),
        provideAuth(() => getAuth()),
        NgxStarsModule,
        LoadingService,
    ],
};
