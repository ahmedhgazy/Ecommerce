import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';
import { GoogleAuthService } from '../../../services/auth/auth-google.service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [TranslateModule, CommonModule, RouterModule, TranslateModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
    auth = inject(AuthService);
    googleS = inject(GoogleAuthService);

    router = inject(Router);
    @Input() toggleSidebar;
    @Output()
    logOut = new EventEmitter<boolean>();

    @Output()
    close = new EventEmitter<boolean>();

    logout() {
        this.logOut.emit(true);
        this.closeSidebar();
    }

    closeSidebar() {
        this.close.emit(false);
    }

    navTo(routeWord: string) {
        switch (routeWord) {
            case 'home':
                this.closeSidebar();
                this.router.navigate(['/home']);
                break;
            case 'contact':
                this.closeSidebar();
                this.router.navigate(['/contact']);

                break;
            case 'about':
                this.closeSidebar();
                this.router.navigate(['/about']);

                break;
            case 'wishlist':
                this.closeSidebar();
                this.router.navigate(['/profile/wishlist']);

                break;
            case 'profile':
                this.closeSidebar();
                this.router.navigate(['/profile']);

                break;
            case 'cart':
                this.closeSidebar();
                this.router.navigate(['/cart']);

                break;
            case 'auth':
                this.closeSidebar();
                this.router.navigate(['/auth/register']);
                break;
        }
    }
}
