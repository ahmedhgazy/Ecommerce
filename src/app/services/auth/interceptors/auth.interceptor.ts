import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';

/**
 * Queuing mechanism: when multiple requests get 401 simultaneously,
 * only ONE refresh call is made. All other requests wait and retry
 * after refresh completes.
 */
let isRefreshing = false;
let refreshSubject$ = new BehaviorSubject<string | null>(null);

export const UserInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
) => {
    const authService = inject(AuthService);
    const user = authService.user.value;

    // Skip auth header for auth endpoints (except /me and /logout)
    const isAuthEndpoint = req.url.includes('/auth/') &&
        !req.url.includes('/auth/me') &&
        !req.url.includes('/auth/logout');

    if (!user || !user.token || isAuthEndpoint) {
        return next(req);
    }

    // Clone request with Authorization header
    const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${user.token}`)
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If 401 Unauthorized and we have a refresh token, try to refresh
            if (error.status === 401 && user.refreshToken && !req.url.includes('/refresh-token')) {

                // If already refreshing, queue this request
                if (isRefreshing) {
                    return refreshSubject$.pipe(
                        filter(token => token !== null),
                        take(1),
                        switchMap(token => {
                            const retryReq = req.clone({
                                headers: req.headers.set('Authorization', `Bearer ${token}`)
                            });
                            return next(retryReq);
                        })
                    );
                }

                // Start refresh
                isRefreshing = true;
                refreshSubject$.next(null);

                return authService.refreshToken(false).pipe(
                    switchMap(() => {
                        const newUser = authService.user.value;
                        isRefreshing = false;

                        if (newUser && newUser.token) {
                            refreshSubject$.next(newUser.token);
                            const retryReq = req.clone({
                                headers: req.headers.set('Authorization', `Bearer ${newUser.token}`)
                            });
                            return next(retryReq);
                        }
                        return throwError(() => error);
                    }),
                    catchError(refreshError => {
                        isRefreshing = false;
                        refreshSubject$.next(null);
                        authService.logout(true);
                        return throwError(() => refreshError);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
