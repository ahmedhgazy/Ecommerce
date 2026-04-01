
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';

import { LoadingService } from './core/services/loading.service';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { GoogleAuthService } from './services/auth/auth-google.service';
import { BackToTopDirective } from './shared/directives/top.directive';
import { AuthService } from './services/auth/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        HeaderComponent,
        FooterComponent,
        CommonModule,
        BackToTopDirective,
        LoadingComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    goService = inject(GoogleAuthService);
    loading = inject(LoadingService);
    authS = inject(AuthService);
    router = inject(Router);

    ngOnInit(): void {
        this.authS.autoLogin();
    }

    get hideFooter(): boolean {
        return this.router.url.includes('/auth/login') ||
            this.router.url.includes('/auth/register')
            || this.router.url.includes('/profile/wishlist')
            || this.router.url.includes('/profile');


    }


}

