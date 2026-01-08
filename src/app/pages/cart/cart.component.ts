import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectorRef,
    inject,
} from '@angular/core';

import {
    Subject,
    debounceTime,
    takeUntil,
    forkJoin,
    Observable,
    EMPTY,
} from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProductsService } from '../../services/products/products.service';
import { Product } from '../../models/product.model';
import { Cart, CartItem } from '../../models/cart.model';
import { MessageService } from 'primeng/api';
import { SharedRoutesHeader } from '../../shared/components/shared-routes-header/shared-routes-header.component';
import { OrderSummaryComponent } from '../../components/orders/oreder-summary/order-summary.component';
import { ToastModule } from 'primeng/toast';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/orders/cart.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { LoadingService } from '../../shared/components/loading/loading.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss'],
    imports: [
        SharedRoutesHeader,
        OrderSummaryComponent,
        ToastModule,
        TruncatePipe,
        InputNumberModule,
        FormsModule,
        RouterModule,
        LoadingComponent,
        TranslateModule,
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
})
export class CartComponent implements OnInit, OnDestroy {
    cartItems: Product[] = [];
    translate = inject(TranslateService);

    totalPrice = 0;
    loadingS = inject(LoadingService);
    private endSubs$ = new Subject<void>();
    private quantityUpdate$ = new Subject<{
        index: number;
        quantity: number;
    }>();

    constructor(
        private productsService: ProductsService,
        private cartService: CartService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.getItems();
        this.setupQuantityUpdateListener();
    }

    private setupQuantityUpdateListener(): void {
        this.quantityUpdate$
            .pipe(debounceTime(300), takeUntil(this.endSubs$))
            .subscribe(({ index, quantity }) => {
                this.updateQuantity(index, quantity);
            });
    }

    getItems(): void {
        this.cartService.cart$
            .pipe(takeUntil(this.endSubs$))
            .subscribe((cart) => {
                if (cart) {
                    this.cartItems = cart.items.map(item => ({
                        id: item.productId,
                        name: item.productName,
                        imageUrl: item.productImageUrl,
                        price: item.price,
                        discount: item.discount,
                        discountPrice: item.discountedPrice,
                        description: '',
                        quantity: item.quantity,
                        subTotal: item.subTotal,
                        category: '',
                        reviews: [],
                        inStock: item.inStock
                    } as any as Product));
                    this.totalPrice = cart.totalPrice;
                    this.cdr.markForCheck();
                }
            });
    }


    removeItem(index: number): void {
        const item = this.cartItems[index];
        this.cartService.removeFromCart(item.id).subscribe(() => {
            this.translate
                .get(['TOAST_MESSAGE.success', 'TOAST_MESSAGE.itemRemovedFromCart'])
                .pipe(
                    switchMap((translations) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: translations['TOAST_MESSAGE.success'],
                            detail: translations['TOAST_MESSAGE.itemRemovedFromCart'],
                        });
                        return EMPTY;
                    })
                )
                .subscribe();
        });
    }

    onQuantityChange(index: number, quantity: number): void {
        this.quantityUpdate$.next({ index, quantity });
    }

    private updateQuantity(index: number, quantity: number): void {
        const item = this.cartItems[index];
        this.cartService.updateCartItem(item.id, quantity)
            .subscribe(() => {
                this.translate
                    .get(['TOAST_MESSAGE.success', 'TOAST_MESSAGE.cartUpdated'])
                    .pipe(
                        switchMap((translations) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: translations['TOAST_MESSAGE.success'],
                                detail: translations['TOAST_MESSAGE.cartUpdated'],
                            });
                            return EMPTY;
                        })
                    )
                    .subscribe();
            });
    }



    ngOnDestroy(): void {
        this.endSubs$.next();
        this.endSubs$.complete();
    }
}
