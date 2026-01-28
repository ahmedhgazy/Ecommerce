import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth/auth.service';
import { ProfileService } from '../../../services/profile/profile.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Profile } from '../../../models/profile.model';
import { CommonModule } from '@angular/common';
import { SharedInputComponent } from '../../../shared/components/shared-input/shared-input.component';
import { ToastModule } from 'primeng/toast';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
    selector: 'app-edit',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        SharedInputComponent,
        ReactiveFormsModule,
        ToastModule,
        TranslateModule,
        LoadingComponent,
    ],
    templateUrl: './edit.component.html',
    styleUrl: './edit.component.scss',
    providers: [MessageService],
})
export class EditComponent implements OnInit, OnDestroy {
    messageService = inject(MessageService);
    router = inject(Router);
    auth = inject(AuthService);
    profileService = inject(ProfileService);
    endSubs$ = new Subject<any>();
    profileData: Profile;
    activeProfile = false;
    form: FormGroup;
    subscription: Subscription;
    constructor(private fb: FormBuilder) { }
    ngOnInit(): void {
        this._initForm(); // Initialize immediately
        this.getProfileData();
        this.profileService.profile$.pipe().subscribe((data) => {
            if (data) {
                // Patch values when data arrives
                this.form.patchValue({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    zipCode: data.zipCode,
                    address: data.address,
                    dateOfBirth: data.dateOfBirth
                });
            }
        });
        this.inProfile();
    }

    private _initForm() {
        let emailAddress = this.auth.user.getValue()?.email;
        this.form = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: [
                {
                    value: emailAddress,
                    disabled: true,
                },
            ],
            zipCode: ['', Validators.required],
            address: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
        });
    }

    submit() {
        if (this.form.invalid) {
            return;
        }

        const formValue = { ...this.form.value };
        if (formValue.zipCode) {
            formValue.zipCode = String(formValue.zipCode);
        }

        this.profileService
            .updateProfile(formValue)
            .pipe(takeUntil(this.endSubs$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Profile Updated',
                    });
                },
            });
    }

    getProfileData() {
        this.subscription = this.profileService.getProfile()
            .subscribe((data) => { });
    }

    inProfile() {
        if (this.router.url.includes('profile')) {
            this.activeProfile = true;
        }
    }

    ngOnDestroy(): void {
        this.endSubs$.next(null);
        this.endSubs$.complete();
        this.subscription.unsubscribe();
    }
}
