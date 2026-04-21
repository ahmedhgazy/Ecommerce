import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterModule,
  Scroll as RouterScroll,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../../services/auth/auth.service';
import { GoogleAuthService } from '../../../services/auth/auth-google.service';
import { CartService } from '../../../services/orders/cart.service';
import { WishlistService } from '../../../services/products/wishlist.service';
import { CartIconComponent } from '../../../components/cart/cart-icon/cart-icon.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Lang {
  name: string;
  code: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    CartIconComponent,
    FormsModule,
    DropdownModule,
    TranslateModule,
    SidebarComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  lang: Lang[] = [
    { name: 'English', code: 'en' },
    { name: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', code: 'ar' },
  ];

  selectedLang: Lang = this.lang[0];
  toggleSidebar = false;
  showUpperHeader = false;
  isHomeRoute = false;
  activeDarkMode = false;

  cartService = inject(CartService);
  wishlistService = inject(WishlistService);

  private translate = inject(TranslateService);
  private router = inject(Router);
  private routerEventsSubscription?: Subscription;

  constructor(
    public auth: AuthService,
    public googleS: GoogleAuthService
  ) {}

  ngOnInit(): void {
    this.auth.user.subscribe((user) => {
      if (user) {
        this.cartService.loadCart();
        this.wishlistService.loadWishlist();
      }
    });

    this.translate.setDefaultLang('en');
    const storedLang = localStorage.getItem('selectedLang');

    if (storedLang && this.lang.some((item) => item.code === storedLang)) {
      this.selectedLang =
        this.lang.find((item) => item.code === storedLang) ?? this.lang[0];
    } else {
      const browserLang = this.translate.getBrowserLang();
      const fallbackLang =
        browserLang && this.lang.some((item) => item.code === browserLang)
          ? browserLang
          : 'en';

      this.selectedLang =
        this.lang.find((item) => item.code === fallbackLang) ?? this.lang[0];
    }

    this.onLangChange();

    const theme = localStorage.getItem('theme');
    if (theme) {
      try {
        this.changeTheme(JSON.parse(theme));
      } catch {
        this.changeTheme(theme);
      }
    }

    this.routerEventsSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd | RouterScroll =>
            event instanceof NavigationEnd || event instanceof RouterScroll
        )
      )
      .subscribe(() => {
        requestAnimationFrame(() => this.updateHeaderState());
      });

    this.updateHeaderState();
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription?.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateHeaderState();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateHeaderState();
  }

  onLangChange(): void {
    if (!this.selectedLang) {
      return;
    }

    this.translate.use(this.selectedLang.code);
    document.documentElement.lang = this.selectedLang.code;
    document.documentElement.dir =
      this.selectedLang.code === 'ar' ? 'rtl' : 'ltr';

    localStorage.setItem('selectedLang', this.selectedLang.code);

    if (this.selectedLang.code === 'ar') {
      document.body.classList.add('ar');
    } else {
      document.body.classList.remove('ar');
    }
  }

  logout(): void {
    this.auth.logout();
    this.googleS.logout();
  }

  openSidebar(): void {
    this.toggleSidebar = true;
  }

  closeSidebar(): void {
    this.toggleSidebar = false;
  }

  changeTheme(theme: string): void {
    localStorage.setItem('theme', JSON.stringify(theme));
    const body = document.body as HTMLElement;
    body.setAttribute('data-bs-theme', theme);

    if (body.getAttribute('data-bs-theme') === 'dark') {
      body.classList.add('dark');
      this.activeDarkMode = true;
    } else {
      this.activeDarkMode = false;
      body.classList.remove('dark');
    }
  }

  private updateHeaderState(): void {
    this.isHomeRoute = this.isHomePath(this.router.url);

    const shouldShowUpperHeader =
      this.isHomeRoute &&
      window.innerWidth >= 992 &&
      window.scrollY >= window.innerHeight;

    if (this.showUpperHeader !== shouldShowUpperHeader) {
      this.showUpperHeader = shouldShowUpperHeader;
    }
  }

  private isHomePath(url: string): boolean {
    const path = url.split('?')[0];
    return path === '/home' || path === '' || path === '/';
  }
}
