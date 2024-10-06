import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedRoutesHeader } from '../../shared/components/shared-routes-header/shared-routes-header.component';
import { SharedInputComponent } from '../../shared/components/shared-input/shared-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    standalone: true,
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.scss',
    imports: [
        RouterModule,
        CommonModule,
        SharedRoutesHeader,
        SharedInputComponent,
        ReactiveFormsModule,
        TranslateModule,
    ],
})
export class ProfileComponent {
    router = inject(Router);
    inOrders = false;
    constructor() {
        if (this.router.url.includes('orders')) {
            this.inOrders = true;
        }
    }
}
