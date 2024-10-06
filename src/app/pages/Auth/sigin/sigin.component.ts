import {
    ChangeDetectorRef,
    Component,
    inject,
    OnDestroy,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, switchMap, takeUntil, tap } from 'rxjs';
@Component({
    selector: 'app-sigin',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CommonModule,
        ToastModule,
        RippleModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        TranslateModule,
    ],
    templateUrl: './sigin.component.html',
    styleUrl: './sigin.component.scss',
    encapsulation: ViewEncapsulation.None,
    providers: [MessageService],
})
export class SigInComponent implements OnDestroy {
    constructor(private messageService: MessageService) {}
    translate = inject(TranslateService);
    fb = inject(NonNullableFormBuilder);
    auth = inject(AuthService);
    cdr = inject(ChangeDetectorRef);

    form;
    logIn = false;
    isLoggedIn = false;
    error = null;
    endSubs = new Subject<void>();
    ngOnInit(): void {
        this.initForm();
    }

    private initForm() {
        this.form = this.fb.group({
            name: [''],
            email: [
                'ahsfgrdA@gmail.com',
                [Validators.required, Validators.email],
            ],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(16),
                ],
            ],
        });
    }

    submit() {
        if (this.form.valid) {
            const email = this.form.value.email;
            const password = this.form.value.password;

            this.auth.login(email, password).subscribe({
                next: () => {
                    this.isLoggedIn = true;
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.translate
                        .get(error.message)
                        .subscribe((translatedError: string) => {
                            this.error = translatedError;
                            this.cdr.detectChanges();
                            this.messageService.add({
                                severity: 'error',
                                summary: this.translate.instant(
                                    'TOAST_MESSAGE.error'
                                ),
                                detail: translatedError,
                            });
                        });
                },
            });
        } else {
            this.translate
                .get(['TOAST_MESSAGE.error', 'TOAST_MESSAGE.fillForm'])
                .pipe(takeUntil(this.endSubs))
                .subscribe((translations) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: translations['TOAST_MESSAGE.error'],
                        detail: translations['TOAST_MESSAGE.fillForm'],
                    });
                });
        }
    }

    router = inject(Router);
    switchToLogin() {
        this.logIn = true;
        this.router.navigate(['/auth/login']);
    }

    get email() {
        return this.form.value.email;
    }

    cancelError() {
        this.error = null;
    }

    /* ****************Reset Password Section***************** */

    visible: boolean = false;

    showDialog() {
        this.visible = true;
    }
    resetPassword(email: string) {
        this.auth
            .resetPassword(email)
            .pipe(
                switchMap(() => {
                    this.visible = false;
                    return this.translate.get([
                        'TOAST_MESSAGE.success',
                        'TOAST_MESSAGE.emailSent',
                    ]);
                }),
                tap((translations) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: translations['TOAST_MESSAGE.success'],
                        detail: translations['TOAST_MESSAGE.emailSent'],
                    });
                }),
                takeUntil(this.endSubs)
            )
            .subscribe({});
    }

    ngOnDestroy(): void {
        this.endSubs.next();
        this.endSubs.complete();
    }
}
