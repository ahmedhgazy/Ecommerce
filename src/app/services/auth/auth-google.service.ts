import { Injectable, NgZone, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private googleInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  get isLoggedInFromGoogle$(): Observable<boolean> {
    return this.authService.isLoggedIn$;
  }

  get isLoggedOutFromGoogle$(): Observable<boolean> {
    return this.authService.isLoggedOut$;
  }


  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.setupGoogleClient(resolve, reject);
        };
        script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
        document.head.appendChild(script);
      } else {
        this.setupGoogleClient(resolve, reject);
      }
    });

    return this.initializationPromise;
  }

  private setupGoogleClient(resolve: () => void, reject: (error: Error) => void): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleCredentialResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      this.googleInitialized = true;
      resolve();
    } catch (error) {
      reject(error as Error);
    }
  }

  signInWithGoogle(): Observable<User> {
    return new Observable(observer => {
      this.initializeGoogleSignIn().then(() => {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            observer.error(new Error('Google Sign-In not available. Please try again.'));
          } else if (notification.isSkippedMoment()) {
            observer.error(new Error('Google Sign-In was skipped.'));
          }
        });

        // Store observer for callback
        (window as any).__googleSignInObserver = observer;
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  private handleCredentialResponse(response: any): void {
    const idToken = response.credential;
    const observer = (window as any).__googleSignInObserver;

    this.ngZone.run(() => {
      this.authService.googleLogin(idToken).subscribe({
        next: (apiResponse) => {
          if (apiResponse.success) {
            const user = this.authService.user.value;
            if (observer && user) {
              observer.next(user);
              observer.complete();
            }
            this.router.navigate(['/home']);
          } else {
            if (observer) {
              observer.error(new Error(apiResponse.message || 'Google login failed'));
            }
          }
        },
        error: (error) => {
          if (observer) {
            observer.error(error);
          }
        }
      });
    });
  }

  renderSignInButton(elementId: string): void {
    this.initializeGoogleSignIn().then(() => {
      const element = document.getElementById(elementId);
      if (element) {
        google.accounts.id.renderButton(element, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 250
        });
      }
    });
  }

  logout(): void {
    this.signOut();
  }

  signOut(): void {

    google.accounts.id.disableAutoSelect();
    this.authService.logout();
  }
}
