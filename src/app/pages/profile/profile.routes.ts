import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./edit/edit.component').then((m) => m.EditComponent),
    },
    {
        path: 'orders',
        loadComponent: () =>
            import('./orders/orders.component').then((m) => m.OrdersComponent),
    },
    {
        path: 'wishlist',
        loadComponent: () =>
            import('./wishlist/wishlist.component').then(
                (m) => m.WishlistComponent
            ),
    },
];
