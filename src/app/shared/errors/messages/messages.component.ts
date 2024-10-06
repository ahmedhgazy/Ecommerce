import { Component, inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MessagesService } from './messages.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    standalone: true,
    selector: 'messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    imports: [CommonModule, TranslateModule],
})
export class MessagesComponent implements OnInit {
    showMessages = false;

    errors$: Observable<string[]>;

    router = inject(Router);

    auth = inject(AuthService);

    constructor(public messagesService: MessagesService) {}

    ngOnInit() {
        this.errors$ = this.messagesService.errors$.pipe(
            tap(() => (this.showMessages = true))
        );
    }

    onClose() {
        // this.router.navigate(['auth/register']);
        this.auth.logout();
        this.showMessages = false;
    }
}
