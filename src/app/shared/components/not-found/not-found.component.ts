import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedRoutesHeader } from '../shared-routes-header/shared-routes-header.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterModule, SharedRoutesHeader, TranslateModule],
    templateUrl: './not-found.component.html',
    styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {}
