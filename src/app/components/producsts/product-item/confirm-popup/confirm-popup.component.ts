import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
    OnDestroy,
} from '@angular/core';
import { Product } from '../../../../models/product.model';
import { WishlistService } from '../../../../services/products/wishlist.service';
import {
    catchError,
    EMPTY,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-confirm-popup',
    standalone: true,
    templateUrl: './confirm-popup.component.html',
    styleUrl: './confirm-popup.component.scss',
    imports: [ToastModule, TranslateModule, CommonModule],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPopupComponent implements OnDestroy {
    wishlistS = inject(WishlistService);
    messageService = inject(MessageService);
    translate = inject(TranslateService);
    activeModal = inject(NgbActiveModal);

    endSubs$ = new Subject<void>();

    @Input() product: Product;

    close() {
        this.activeModal.dismiss();
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

                            if (result !== null) {
                                this.messageService.add({
                                    severity: result === null ? 'warn' : 'success',
                                    summary,
                                    detail,
                                });

                                if (result !== null) {
                                    setTimeout(() => this.activeModal.close(true), 1000);
                                }
                            } else {
                                this.messageService.add({
                                    severity: 'warn',
                                    summary,
                                    detail,
                                });
                            }
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
