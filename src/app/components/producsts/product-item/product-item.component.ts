import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
} from '@angular/core';
import { NgxStarsModule } from 'ngx-stars';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ConfirmPopupComponent } from './confirm-popup/confirm-popup.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImagePreviewComponent } from './image-preview/image-preview.component';
import { fadeInOut } from '../../../shared/animations/popup.animation';
import { AnimateFromTopDirective } from '../../../shared/animations/scroll-animation/top';

@Component({
    selector: 'app-product-item',
    standalone: true,
    imports: [
        NgxStarsModule,
        CommonModule,
        RouterModule,
        ConfirmPopupComponent,
        NgbModule,
        ImagePreviewComponent,
        AnimateFromTopDirective,
    ],
    templateUrl: './product-item.component.html',
    styleUrl: './product-item.component.scss',

    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductItemComponent {
    showPopup = false;
    previewImage = false;
    inWishList = false;
    router = inject(Router);
    constructor(
        private modalService: NgbModal,
        private cdr: ChangeDetectorRef
    ) {
        if (this.router.url.includes('wishlist')) {
            this.inWishList = true;
        }
    }

    @Input()
    product: Product;

    @Input()
    flashSales: boolean;

    showConfirmPopUp() {
        this.showPopup = true;
    }

    closePopup() {
        this.showPopup = false;
    }

    openImagePreview() {
        const modalRef = this.modalService.open(ImagePreviewComponent, {
            size: 'xl',
            fullscreen: true,
            windowClass: 'image-preview-modal',
        });
        modalRef.componentInstance.imageUrl = this.product.img;
    }
}
