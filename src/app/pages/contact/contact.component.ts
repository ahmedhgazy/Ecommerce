import { Component, inject } from '@angular/core';
import { SharedRoutesHeader } from '../../shared/components/shared-routes-header/shared-routes-header.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

import { MessageService } from 'primeng/api';

import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AnimateFadeUpDirective } from '../../shared/animations/scroll-animation/fade-up';
import { AnimateFromLeftDirective } from '../../shared/animations/scroll-animation/left';
import { AnimateFromRightDirective } from '../../shared/animations/scroll-animation/right';
@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [
        SharedRoutesHeader,
        CommonModule,
        RouterModule,
        FormsModule,
        ToastModule,
        TranslateModule,
        AnimateFadeUpDirective,
        AnimateFromLeftDirective,
        AnimateFromRightDirective
    ],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss',
    providers: [MessageService],
})
export class ContactComponent {
    form: NgForm;
    messageService = inject(MessageService);
    translate = inject(TranslateService);

    submit(form: NgForm) {
        this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('TOAST_MESSAGE.success'),
            detail: this.translate.instant('CONTACT.MESSAGE_SENT'),
        });
        form.reset();
    }
}
