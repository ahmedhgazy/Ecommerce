import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProductItemComponent } from '../../../components/producsts/product-item/product-item.component';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../../services/products/wishlist.service';
import { Observable, map } from 'rxjs';
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
        this.wishlistS.getWishlist().pipe(
            map((wishlist) =>
                wishlist.items.map(
                    (item) =>
                    ({
                        id: item.productId,
                        name: item.productName,
                        price: item.price,
                        discount: item.discount,
                        discountPrice: item.discountedPrice,
                        rating: item.rating,
                        imageUrl: item.productImageUrl,
                        images: [item.productImageUrl],
                        category: '',
                        description: '',
                        colors: [],
                    } as any as Product)
                )
            )
        )
    );
    ngOnInit(): void { }
}
