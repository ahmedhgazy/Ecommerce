import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    Output,
} from '@angular/core';
import { Product } from '../../../../models/product.model';
import { WishlistService } from '../../../../services/products/wishlist.service';
import {
    catchError,
    EMPTY,
    Subject,
    Subscription,
    switchMap,
    takeUntil,
} from 'rxjs';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-confirm-popup',
    standalone: true,
    templateUrl: './confirm-popup.component.html',
    styleUrl: './confirm-popup.component.scss',
    imports: [ToastModule, TranslateModule],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPopupComponent implements OnDestroy {
    wishlistS = inject(WishlistService);
    messageService = inject(MessageService);
    translate = inject(TranslateService);
    endSubs$ = new Subject<void>();
    @Output() addToSavedItems = new EventEmitter<boolean>();
    @Output() closePopup = new EventEmitter<boolean>();
    @Input()
    product: Product;
    subscription: Subscription;

    close() {
        this.closePopup.emit(true);
    }

    SaveItem() {
        this.wishlistS
            .addToWishlist(this.product.id)
            .pipe(
                switchMap((result) => {
                    const translationKeys =
                        result === null
                            ? [
                                'TOAST_MESSAGE.warning',
                                'TOAST_MESSAGE.productAlreadyInWishlist',
                            ]
                            : [
                                'TOAST_MESSAGE.success',
                                'TOAST_MESSAGE.productAddedToWishlist',
                            ];

                    return this.translate.get(translationKeys).pipe(
                        switchMap((translations) => {
                            const [summary, detail] = translationKeys.map(
                                (key) => translations[key]
                            );
                            this.messageService.add({
                                severity: result === null ? 'error' : 'success',
                                summary,
                                detail,
                            });
                            return EMPTY;
                        })
                    );
                }),
                catchError((error) => {
                    return EMPTY;
                }),
                takeUntil(this.endSubs$)
            )
            .subscribe();
    }

    ngOnDestroy(): void {
        this.endSubs$.next();
        this.endSubs$.complete();
    }
}
