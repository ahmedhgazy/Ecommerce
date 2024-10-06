import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
    {
        path: 'register',
        loadComponent: () =>
            import('./register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./sigin/sigin.component').then((m) => m.SigInComponent),
    },
];
