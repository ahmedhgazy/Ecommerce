import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { EMPTY, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgxStarsModule } from 'ngx-stars';
import { UiGalleryComponent } from './ui-gellery/ui-gallery.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ProductsService } from '../../services/products/products.service';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/orders/cart.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProductReviewsComponent } from '../../shared/components/product-reviews/product-reviews.component';
@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [
        CommonModule,
        NgxStarsModule,
        UiGalleryComponent,
        InputNumberModule,
        ButtonModule,
        FormsModule,
        ToastModule,
        RouterModule,
        LoadingComponent,
        RouterModule,
        TranslateModule,
        ProductReviewsComponent,
    ],
    templateUrl: './product-details.component.html',
    styleUrl: './product-details.component.scss',
    providers: [
        {
            provide: MessageService,
        },
    ],
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
    messageService = inject(MessageService);
    cartService = inject(CartService);
    id: number;
    category: string;
    product$: Observable<Product>;
    productsService = inject(ProductsService);
    translate = inject(TranslateService);

    route = inject(ActivatedRoute);
    quantity: number = 1;
    product: Product | null = null;
    endsubs$ = new Subject<void>();
    ngOnInit(): void {
        this.route.params.subscribe((param: Params) => {
            this.id = +param['id']; // Use actual ID
            this.category = param['category'];
            this.getItemDetails(this.id);
        });
    }

    getItemDetails(id: number) {
        this.product$ = this.productsService.getProductById(id).pipe(
                map(product => this.product = product)
            );
    }

    addToCart() {
        if (this.product != null) {
            this.cartService.addToCart(this.product.id, this.quantity)
                .pipe(
                    switchMap(() => this.translate.get(['TOAST_MESSAGE.success', 'TOAST_MESSAGE.cartUpdated'])),
                    switchMap((translations) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: translations['TOAST_MESSAGE.success'],
                            detail: translations['TOAST_MESSAGE.cartUpdated'],
                        });
                        return EMPTY;
                    }),
                    takeUntil(this.endsubs$)
                )
                .subscribe();
        }
    }

    ngOnDestroy(): void {
        this.endsubs$.next();
        this.endsubs$.complete;
    }
}
