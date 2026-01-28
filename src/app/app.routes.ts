import { Routes } from '@angular/router';
import { authGuard } from './services/auth/auth.guard';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./pages/Auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then((m) => m.ProductsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'products/:category/:id',
    loadComponent: () =>
      import('./pages/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout-wizard/checkout-wizard.component').then(
        (m) => m.CheckoutWizardComponent
      ),
    canActivate: [authGuard],
    canDeactivate: [UnsavedChangesGuard],
  },
  {
    // Keep payment route for backward compatibility
    path: 'payment',
    redirectTo: 'checkout',
    pathMatch: 'full',
  },
  {
    path: 'order-confirmation/:orderId',
    loadComponent: () =>
      import('./pages/order-confirmation/order-confirmation.component').then(
        (m) => m.OrderConfirmationComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
    loadChildren: () =>
      import('./pages/profile/profile.routes').then(
        (m) => m.PROFILE_ROUTES
      ),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./pages/contact/contact.component').then(
        (m) => m.ContactComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then(
        (m) => m.AboutComponent
      ),
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
