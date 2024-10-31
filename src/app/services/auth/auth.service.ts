import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { User } from '../../models/user.model';
import {} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ResponsePayload } from '../../models/auth.res';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private baseUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:';

    private api_key = 'AIzaSyArXnKU909e-tuZ1sQbznfCC_hjhODpZuw';

    private signUpUrl = `${this.baseUrl}signUp?key=${this.api_key}`;

    private signInUrl = `${this.baseUrl}signInWithPassword?key=${this.api_key}`;

    userId: string;

    user = new BehaviorSubject<User>(null);

    user$: Observable<User> = this.user.asObservable();

    isLoggedIn$: Observable<boolean>;

    isLoggedOut$: Observable<boolean>;

    private tokenExpirationTimer: any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private http: HttpClient,
        private router: Router
    ) {
        if (isPlatformBrowser(this.platformId)) {
            this.isLoggedIn$ = this.user$.pipe(map((user) => !!user));

            this.isLoggedOut$ = this.isLoggedIn$.pipe(
                map((loggedIn) => !loggedIn)
            );

            const user = localStorage.getItem('user');

            if (user) {
                this.user.next(JSON.parse(user));
            } else {
                this.logout();
            }
        }

        this.userId = this.user.getValue()?.id;
    }

    signUp(email: string, password: string): Observable<any> {
        return this.http
            .post<ResponsePayload>(this.signUpUrl, {
                email: email,
                password: password,
                returnSecureToken: true,
            })

            .pipe(
                tap((resData: ResponsePayload) => {
                    this.handleAuthentication(
                        resData.email,
                        resData.localId,
                        resData.idToken,
                        +resData.expiresIn
                    );
                }),
                shareReplay(1),
                catchError(this.handleError)
            );
    }

    login(email: string, password: string): Observable<any> {
        return this.http
            .post<ResponsePayload>(this.signInUrl, {
                email: email,
                password: password,
                returnSecureToken: true,
            })

            .pipe(
                tap((resData: ResponsePayload) => {
                    this.handleAuthentication(
                        resData.email,
                        resData.localId,
                        resData.idToken,
                        +resData.expiresIn
                    );
                }),
                shareReplay(1),
                catchError(this.handleError)
            );
    }

    logout() {
        this.user.next(null);

        localStorage.removeItem('user');

        this.router.navigate(['/auth/register']);

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }

        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(
        email: string,
        userId: string,
        token: string,
        expiresIn: number
    ) {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    autoLogin(): void {
        if (isPlatformBrowser(this.platformId)) {
            const userData: {
                email: string;
                id: string;
                _token: string;
                _tokenExpirationDate: string;
            } = JSON.parse(localStorage.getItem('user') || 'null');

            if (!userData) {
                return;
            }

            const loadedUser = new User(
                userData.email,
                userData.id,
                userData._token,
                new Date(userData._tokenExpirationDate)
            );

            if (loadedUser.token) {
                this.user.next(loadedUser);
            }

            const expirationDuration =
                new Date(userData._tokenExpirationDate).getTime() -
                new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    private handleError(errorResponse: any) {
        let errorKey = 'ERROR_MESSAGES.UNKNOWN_ERROR';
        if (!errorResponse.error || !errorResponse.error.error) {
            return throwError(() => new Error(errorKey));
        }
        switch (errorResponse.error.error.message) {
            case 'ERR_NAME_NOT_RESOLVED':
                errorKey = 'ERROR_MESSAGES.NO_INTERNET';
                break;
            case 'EMAIL_EXISTS':
                errorKey = 'ERROR_MESSAGES.EMAIL_EXISTS';
                break;
            case 'OPERATION_NOT_ALLOWED':
                errorKey = 'ERROR_MESSAGES.OPERATION_NOT_ALLOWED';
                break;
            case 'TOO_MANY_ATTEMPTS_TRY_LATER':
                errorKey = 'ERROR_MESSAGES.TOO_MANY_ATTEMPTS_TRY_LATER';
                break;
            case 'EMAIL_NOT_FOUND':
                errorKey = 'ERROR_MESSAGES.EMAIL_NOT_FOUND';
                break;
            case 'INVALID_PASSWORD':
                errorKey = 'ERROR_MESSAGES.INVALID_PASSWORD';
                break;
            case 'USER_DISABLED':
                errorKey = 'ERROR_MESSAGES.USER_DISABLED';
                break;
        }
        return throwError(() => new Error(errorKey));
    }

    private readonly BASE_URL =
        'https://identitytoolkit.googleapis.com/v1/accounts:';

    resetPassword(email: string): Observable<boolean> {
        return this.http
            .post<any>(`${this.BASE_URL}sendOobCode?key=${this.api_key}`, {
                email,
                requestType: 'PASSWORD_RESET',
            })
            .pipe(
                map(() => true),
                catchError(this.handleError)
            );
    }

    verifyPasswordResetCode(oobCode: string): Observable<string> {
        return this.http
            .post<any>(`${this.BASE_URL}resetPassword?key=${this.api_key}`, {
                oobCode,
            })
            .pipe(
                map((response) => response.email),
                catchError(this.handleError)
            );
    }

    confirmPasswordReset(
        oobCode: string,
        newPassword: string
    ): Observable<boolean> {
        return this.http
            .post<any>(`${this.BASE_URL}resetPassword?key=${this.api_key}`, {
                oobCode,
                newPassword,
            })
            .pipe(
                map(() => true),
                catchError(this.handleError)
            );
    }
}
