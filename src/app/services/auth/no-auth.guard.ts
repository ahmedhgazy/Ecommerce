import { UrlTree, Router } from '@angular/router';
import { map, Observable, take, switchMap, filter } from 'rxjs';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

/**
 * Prevents authenticated users from accessing login/register pages.
 * Redirects them to /home instead.
 * This fixes the "back button shows login page" problem.
 */
export const noAuthGuard = ():
    | Observable<boolean | UrlTree> => {
    const auth: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    return auth.authReady$.pipe(
        filter(ready => ready),
        take(1),
        switchMap(() => auth.user.pipe(
            take(1),
            map(user => {
                // If user is authenticated (has valid token or refresh token), redirect to home
                if (user && (user.token || user.refreshToken)) {
                    return router.createUrlTree(['/home']);
                }
                // Otherwise, allow access to auth pages
                return true;
            })
        ))
    );
};
