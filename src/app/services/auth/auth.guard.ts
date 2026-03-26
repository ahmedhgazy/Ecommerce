import { UrlTree } from '@angular/router';
import { map, Observable, take, switchMap, of, filter, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard = ():
    | Observable<boolean | UrlTree> => {
    const auth: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    // Wait for autoLogin() to finish before checking auth state
    return auth.authReady$.pipe(
        filter(ready => ready),
        take(1),
        switchMap(() => auth.user.pipe(
            take(1),
            switchMap(user => {
                // Case 1: User has a valid (non-expired) access token
                if (user && user.token) {
                    return of(true);
                }

                // Case 2: User has expired access token but has a refresh token — try silent refresh
                if (user && user.refreshToken) {
                    return auth.refreshToken(false).pipe(
                        map(() => true as boolean | UrlTree),
                        catchError(() => of(router.createUrlTree(['auth/login'])))
                    );
                }

                // Case 3: No auth at all — redirect to login
                return of(router.createUrlTree(['auth/login']));
            })
        ))
    );
};
