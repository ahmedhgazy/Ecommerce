import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, map, tap, take, finalize } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { isPlatformBrowser } from '@angular/common';

declare var google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
    private googleUser = new BehaviorSubject<User | null>(null);
    private googleAuthEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=AIzaSyArXnKU909e-tuZ1sQbznfCC_hjhODpZuw`;
    private currentToken: string | null = null;
    private googleInitialized = false;
    private authInProgress = false;

    isLoggedInFromGoogle$: Observable<boolean>;
    isLoggedOutFromGoogle$: Observable<boolean>;
    googleUser$ = this.googleUser.asObservable();

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private http: HttpClient,
        private router: Router,
        private ngZone: NgZone
    ) {
        this.isLoggedInFromGoogle$ = this.googleUser$.pipe(
            map((user) => !!user)
        );

        this.isLoggedOutFromGoogle$ = this.isLoggedInFromGoogle$.pipe(
            map((loggedIn) => !loggedIn)
        );

        this.autoLogin();
    }

    initializeGoogleSignIn(): Observable<void> {
        if (!isPlatformBrowser(this.platformId)) {
            return of(undefined);
        }

        return new Observable<void>((observer) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                google.accounts.id.initialize({
                    client_id:
                        '18506674420-q5qbocm2n9h5hdn7f3gmuqq4opoga7aq.apps.googleusercontent.com',
                    callback: this.handleCredentialResponse.bind(this),
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });
                this.googleInitialized = true;
                observer.next();
                observer.complete();
            };
            script.onerror = (error) => {
                observer.error('Failed to load Google Sign-In script');
            };
            document.body.appendChild(script);
        });
    }

    signInWithGoogle(): Observable<User> {
        if (!isPlatformBrowser(this.platformId)) {
            return throwError(
                () =>
                    new Error(
                        'Google Sign-In is not available on this platform'
                    )
            );
        }

        if (!this.googleInitialized) {
            return throwError(
                () => new Error('Google Sign-In has not been initialized')
            );
        }

        if (this.authInProgress) {
            return throwError(
                () => new Error('Authentication already in progress')
            );
        }

        this.authInProgress = true;

        return new Observable((observer) => {
            google.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed()) {
                    console.warn(
                        'Google Sign-In prompt not displayed. Reason:',
                        notification.getNotDisplayedReason()
                    );
                    this.authInProgress = false;
                    // observer.error(
                    //     'Google Sign-In prompt could not be displayed. Please check your ad blocker or try again.'
                    // );
                    // } else if (notification.isSkippedMoment()) {
                    //     console.warn(
                    //         'Google Sign-In prompt skipped. Reason:',
                    //         notification.getSkippedReason()
                    //     );
                    //     this.authInProgress = false;
                    //     observer.error(
                    //         'Google Sign-In was skipped. Please try again and complete the sign-in process.'
                    //     );
                    // } else if (notification.isDismissedMoment()) {
                    //     console.warn(
                    //         'Google Sign-In prompt dismissed. Reason:',
                    //         notification.getDismissedReason()
                    //     );
                    //     this.authInProgress = false;
                    //     observer.error(
                    //         'Google Sign-In was dismissed. Please try again and complete the sign-in process.'
                    //     );
                    // }
                }
            });

            const unsubscribe = this.googleUser$
                .pipe(
                    take(1),
                    finalize(() => {
                        this.authInProgress = false;
                    })
                )
                .subscribe((user) => {
                    if (user) {
                        observer.next(user);
                        observer.complete();
                    }
                });

            return () => unsubscribe.unsubscribe();
        });
    }

    private handleCredentialResponse(response: any): void {
        const idToken = response.credential;
        this.verifyGoogleToken(idToken).subscribe({
            next: (user: User) => {
                this.ngZone.run(() => {
                    this.handleAuthentication(
                        user.email,
                        user.localId,
                        user.idToken,
                        +user.expiresIn
                    );
                    this.router.navigate(['/home']).then(
                        () => {
                            window.location.reload();
                        },
                        (err) =>
                            console.error('Navigation to home failed:', err)
                    );
                });
            },
            error: (error) => {
                console.error('Error during Google sign-in', error);
                this.authInProgress = false;
            },
        });
    }

    private verifyGoogleToken(idToken: string): Observable<any> {
        const requestBody = {
            postBody: `id_token=${idToken}&providerId=google.com`,
            requestUri: 'http://localhost',
            returnIdpCredential: true,
            returnSecureToken: true,
        };

        return this.http.post(this.googleAuthEndpoint, requestBody).pipe(
            tap((user: any) => {
                this.currentToken = user.idToken;
            }),
            catchError((error) => {
                console.error('Error verifying Google token:', error);
                return throwError(
                    () => new Error('Failed to verify Google token')
                );
            })
        );
    }

    private handleAuthentication(
        email: string,
        userId: string,
        token: string,
        expiresIn: number
    ): void {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const user = new User(email, userId, token, expirationDate);
        this.googleUser.next(user);
        this.storeAuthData(user);
    }

    private storeAuthData(user: User): void {
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
                this.googleUser.next(loadedUser);
            }
        }
    }

    logout(): void {
        this.googleUser.next(null);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('user');
        }
        this.router.navigate(['/auth/register']);
    }
}
