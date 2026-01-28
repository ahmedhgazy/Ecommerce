import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProductItemComponent } from '../../../components/producsts/product-item/product-item.component';
import { RouterModule } from '@angular/router';
import { WishlistService, Wishlist } from '../../../services/products/wishlist.service';
import { Observable, filter, map } from 'rxjs';
import { Product } from '../../../models/product.model';
import { LoadingService } from '../../../core/services/loading.service';
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
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  wishlistS = inject(WishlistService);

  // Reactively listen to wishlist$ BehaviorSubject for instant updates
  products$: Observable<Product[]> = this.wishlistS.wishlist$.pipe(
    filter((wishlist): wishlist is Wishlist => wishlist !== null),
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
  );

  ngOnInit(): void {
    // Ensure wishlist is loaded when component initializes
    this.wishlistS.loadWishlist();
  }
}
