import {
    HttpHandlerFn,
    HttpInterceptorFn,
    HttpParams,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { exhaustMap, Observable, take } from 'rxjs';
import { GoogleAuthService } from '../auth-google.service';

export const GoogleInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
) => {
    const googleService = inject(GoogleAuthService);
    return googleService.googleUser$.pipe(
        take(1),
        exhaustMap((user) => {
            if (!user || !user.token) {
                return next(req);
            }
            const reqClone = req.clone({
                params: req.params.set('auth', user.token),
            });
            return next(reqClone);
        })
    );
};
