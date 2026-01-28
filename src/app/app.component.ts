
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
    ngOnInit(): void {
        this.authS.autoLogin();
    }
}

