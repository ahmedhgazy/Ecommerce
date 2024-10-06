import {
    Component,
    inject,
    OnInit,
    Inject,
    PLATFORM_ID,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GoogleAuthService } from '../../../services/auth/auth-google.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ToastModule,
        CommonModule,
        RouterModule,
        TranslateModule,
    ],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    providers: [MessageService],
})
export class RegisterComponent implements OnInit, OnDestroy {
    googleS = inject(GoogleAuthService);
    translate = inject(TranslateService);
    endSubs = new Subject<void>();
    router = inject(Router);
    fb = inject(FormBuilder);
    auth = inject(AuthService);
    cdr = inject(ChangeDetectorRef);

    form = this.fb.group({
        name: [''],
        email: ['', [Validators.required, Validators.email]],
        password: [
            '',
            [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(16),
            ],
        ],
    });

    isLoggedIn = false;
    error: string | null = null;
    isGoogleInitialized = false;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.googleS.initializeGoogleSignIn().subscribe({
            next: () => {
                this.isGoogleInitialized = true;
                this.cdr.detectChanges();
            },
        });

        this.googleS.isLoggedInFromGoogle$
            .pipe(takeUntil(this.endSubs))
            .subscribe((isLoggedIn) => {
                this.isLoggedIn = isLoggedIn;
                if (isLoggedIn) {
                    this.router.navigate(['/home']);
                }
                this.cdr.detectChanges();
            });
    }

    submit() {
        if (this.form.valid) {
            const { email, password } = this.form.value;
            this.auth.signUp(email!, password!).subscribe({
                next: () => {
                    this.isLoggedIn = true;
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.showErrorMessage(error.message);
                },
            });
        } else {
            this.showErrorMessage('TOAST_MESSAGE.fillForm');
        }
    }

    cancelError() {
        this.error = null;
        this.cdr.detectChanges();
    }

    authWgoo() {
        if (!this.isGoogleInitialized) {
            this.showErrorMessage('TOAST_MESSAGE.googleNotInitialized');
            return;
        }

        this.googleS.signInWithGoogle().subscribe({
            next: (user) => {},
        });
    }

    private showErrorMessage(messageKey: string) {
        this.translate
            .get(messageKey)
            .pipe(takeUntil(this.endSubs))
            .subscribe((translatedError: string) => {
                this.error = translatedError;
                this.cdr.detectChanges();
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('TOAST_MESSAGE.error'),
                    detail: translatedError,
                });
            });
    }

    ngOnDestroy(): void {
        this.endSubs.next();
        this.endSubs.complete();
    }
}
