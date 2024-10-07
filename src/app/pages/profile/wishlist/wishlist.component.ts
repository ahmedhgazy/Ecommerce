import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProductItemComponent } from '../../../components/producsts/product-item/product-item.component';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../../services/products/wishlist.service';
import { Observable } from 'rxjs';
import { Product } from '../../../models/product.model';
import { LoadingService } from '../../../shared/components/loading/loading.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [
        CommonModule,
        ProductItemComponent,
        RouterModule,
        LoadingComponent,
        TranslateModule,
    ],
    templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {
    loadingS = inject(LoadingService);
    wishlistS = inject(WishlistService);
    products$: Observable<Product[]> = this.loadingS.showLoadingUntilCompleted(
        this.wishlistS.getSavedItems()
    );
    ngOnInit(): void {}
}
