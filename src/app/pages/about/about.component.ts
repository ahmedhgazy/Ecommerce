import { Component } from '@angular/core';
import { SharedRoutesHeader } from '../../shared/components/shared-routes-header/shared-routes-header.component';
import { RouterModule } from '@angular/router';
import { DetailsComponent } from '../../components/details/details.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [
        SharedRoutesHeader,
        RouterModule,
        DetailsComponent,
        TranslateModule,
    ],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss',
})
export class AboutComponent {}
