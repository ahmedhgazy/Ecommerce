import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-category-item',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './category-item.component.html',
    styleUrl: './category-item.component.scss',
})
export class CategoryItemComponent {
    @Input() queryParams: any = {};
}
