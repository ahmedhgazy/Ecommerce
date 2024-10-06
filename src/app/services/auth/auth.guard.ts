import { UrlTree } from '@angular/router';
import { map, Observable, take } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard = ():
    | Boolean
    | Promise<Boolean | UrlTree>
    | Observable<Boolean | UrlTree>
    | UrlTree => {
    const auth: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    return auth.user.pipe(
        take(1),
        map((user) => {
            const isAuth = !!user;
            if (isAuth) {
                return true;
            }
            return router.createUrlTree(['auth/register']);
        })
    );
};
