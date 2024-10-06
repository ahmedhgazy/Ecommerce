import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
} from '@angular/core';
import { SharedHeaderComponent } from '../../../shared/components/shared-header/shared-header.component';
import { CategoryItemComponent } from './cateory-item/category-item.component';

@Component({
    selector: 'app-categories',
    standalone: true,
    imports: [CommonModule, SharedHeaderComponent, CategoryItemComponent],
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss',
})
export class CategoriesComponent {}
