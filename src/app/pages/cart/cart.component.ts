import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
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
    ) {}

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
        this.cartService.cartSubject
            .pipe(
                switchMap((cart: Cart) => {
                    const productObservables = cart.items.map((item) =>
                        this.getProductByCategory(item)
                    );
                    return forkJoin(productObservables);
                })
            )
            .subscribe((products: Product[]) => {
                this.cartItems = products;
                this.calculateTotalPrice();
                this.cdr.markForCheck();
            });
    }

    private getProductByCategory(item: CartItem): Observable<Product> {
        let productObservable: Observable<Product[]>;

        switch (item.category) {
            case 'bestSelling':
                productObservable = this.loadingS.showLoadingUntilCompleted(
                    this.productsService.bestSellingAllItems()
                );
                break;
            case 'products':
                productObservable = this.loadingS.showLoadingUntilCompleted(
                    this.productsService.productsAllItems()
                );
                break;
            case 'flashSales':
                productObservable = this.loadingS.showLoadingUntilCompleted(
                    this.productsService.flashSalesAllItems()
                );
                break;
            default:
                throw new Error(`Unknown category: ${item.category}`);
        }

        return productObservable.pipe(
            map((products: Product[]) => {
                const product = products[item.productId - 1];
                return {
                    ...product,
                    quantity: item.quantity,
                    subTotal: product.price * item.quantity,
                    category: item.category,
                };
            })
        );
    }

    removeItem(index: number): void {
        const item = this.cartItems[index];
        this.cartService.removeItem(item.category, item.id);
        this.cartItems.splice(index, 1);
        this.calculateTotalPrice();
        this.cdr.markForCheck();

        this.translate
            .get(['TOAST_MESSAGE.success', 'TOAST_MESSAGE.itemRemovedFromCart'])
            .pipe(
                switchMap((translations) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: translations['TOAST_MESSAGE.success'],
                        detail: translations[
                            'TOAST_MESSAGE.itemRemovedFromCart'
                        ],
                    });
                    return EMPTY;
                })
            )
            .subscribe();
    }

    onQuantityChange(index: number, quantity: number): void {
        this.cartItems[index].quantity = quantity;
        this.cartItems[index].subTotal = this.cartItems[index].price * quantity;
        this.calculateTotalPrice();
        this.cdr.markForCheck();

        this.quantityUpdate$.next({ index, quantity });
    }
    private updateQuantity(index: number, quantity: number): void {
        const item = this.cartItems[index];
        this.cartService.setCartItem(
            {
                productId: item.id,
                category: item.category,
                quantity: quantity,
            },
            true
        );

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
    }

    private calculateTotalPrice(): void {
        this.totalPrice = this.cartItems.reduce(
            (sum, item) => sum + item.subTotal,
            0
        );
        this.cartService.setTotalPrice(this.totalPrice);
    }

    ngOnDestroy(): void {
        this.endSubs$.next();
        this.endSubs$.complete();
    }
}
