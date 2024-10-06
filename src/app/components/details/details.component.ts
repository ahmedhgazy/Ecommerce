import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-details',
    standalone: true,
    imports: [TranslateModule],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss',
})
export class DetailsComponent {}
