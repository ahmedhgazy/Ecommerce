import { HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { exhaustMap, Observable, take } from 'rxjs';
import { AuthService } from '../auth.service';

export const UserInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    return authService.user$.pipe(
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
