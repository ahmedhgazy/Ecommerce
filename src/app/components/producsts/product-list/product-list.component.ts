import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductItemComponent } from '../product-item/product-item.component';
import { CommonModule } from '@angular/common';
import { SharedButton } from '../../../shared/components/shared-button/shared-button.component';
import { SharedHeaderComponent } from '../../../shared/components/shared-header/shared-header.component';
import { Product } from '../../../models/product.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        ProductItemComponent,
        CommonModule,
    ],
    templateUrl: './product-list.component.html',
    styleUrl: './product-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
    @Input()
    products: Product[];
}
