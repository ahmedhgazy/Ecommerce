import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { GoogleAuthService } from '../../../services/auth/auth-google.service';
import { CartIconComponent } from '../../../components/cart/cart-icon/cart-icon.component';
import { CartService } from '../../../services/orders/cart.service';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
export class HeaderComponent implements OnInit {
  lang: Lang[] = [
    { name: 'English', code: 'en' },
    { name: 'العربية', code: 'ar' },
  ];

  selectedLang: Lang = this.lang[0];
  toggleSidebar = false;
  private translate = inject(TranslateService);
  constructor(
    public auth: AuthService,
    public googleS: GoogleAuthService,
  ) { }
  cartService = inject(CartService);
  activeDarkMode = false;

  ngOnInit(): void {
    this.auth.user.subscribe((user) => {
      if (user) {
        this.cartService.loadCart();
      }
    });

    this.translate.setDefaultLang('en');
    const storedLang = localStorage.getItem('selectedLang');

    if (storedLang && this.lang.some((l) => l.code === storedLang)) {
      this.selectedLang =
        this.lang.find((l) => l.code === storedLang) ||
        this.lang[0];
    } else {
      const browserLang = this.translate.getBrowserLang();
      this.selectedLang =
        this.lang.find(
          (l) =>
            l.code ===
            (browserLang &&
              this.lang.some((lang) => lang.code === browserLang)
              ? browserLang
              : 'en')
        ) || this.lang[0];
    }

    this.onLangChange();

    const theme = localStorage.getItem('theme');
    if (theme) {
      try {
        this.changeTheme(JSON.parse(theme));
      } catch (error) {
        this.changeTheme(theme);
      }
    }
  }

  onLangChange(): void {
    if (this.selectedLang) {
      this.translate.use(this.selectedLang.code);
      document.documentElement.dir =
        this.selectedLang.code === 'ar' ? 'rtl' : 'ltr';

      localStorage.setItem('selectedLang', this.selectedLang.code);

      if (this.selectedLang.code === 'ar') {
        document.body.classList.add('ar');
      } else {
        document.body.classList.remove('ar');
      }
    }
  }

  logout() {
    this.auth.logout();
    this.googleS.logout();
  }

  openSidebar() {
    this.toggleSidebar = true;
  }

  closeSidebar() {
    this.toggleSidebar = false;
  }

  changeTheme(theme: string) {
    localStorage.setItem('theme', JSON.stringify(theme));
    const body = document.body as HTMLElement;
    body.setAttribute('data-bs-theme', theme);
    const themeValue = body.getAttribute('data-bs-theme');
    if (themeValue === 'dark') {
      document.body.classList.add('dark');
      this.activeDarkMode = true;
    } else {
      this.activeDarkMode = false;
      document.body.classList.remove('dark');
    }
  }
}
