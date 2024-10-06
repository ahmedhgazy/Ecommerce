import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { BannerComponent } from '../../shared/components/banner/banner.component';
import { CommonModule } from '@angular/common';
import { ProductItemComponent } from '../../components/producsts/product-item/product-item.component';
import { ProductListComponent } from '../../components/producsts/product-list/product-list.component';
import { CategoriesComponent } from '../../components/producsts/catepgries/categories.component';
import { CatBannerComponent } from '../../components/producsts/catepgries/cat-banner/cat-banner.component';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { NewArrivalsComponent } from '../../components/producsts/new-arrivals/new-arrivals.component';
import { DetailsComponent } from '../../components/details/details.component';
import { ProductsService } from '../../services/products/products.service';
import { concatMap, map, Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { LoadingService } from '../../shared/components/loading/loading.service';
import { SharedButton } from '../../shared/components/shared-button/shared-button.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { mapToPaginatedProducts } from '../../models/product.model';
import { TranslateModule } from '@ngx-translate/core';
import { BackToTopDirective } from '../../shared/directives/top.directive';
export interface sharedHeader {
    title: string;
    desc: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        BannerComponent,
        CommonModule,
        ProductItemComponent,
        ProductListComponent,
        CategoriesComponent,
        CatBannerComponent,
        SharedHeaderComponent,
        NewArrivalsComponent,
        DetailsComponent,
        SharedButton,
        LoadingComponent,
        TranslateModule,
        BackToTopDirective,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
    products$: Observable<Product[]>;
    flashSales$: Observable<Product[]>;
    bestSelling$: Observable<Product[]>;
    allProductsLoaded = false;
    allFlashSalesLoaded = false;
    allBestSellingLoaded = false;
    loadingS = inject(LoadingService);
    constructor(private productsService: ProductsService) {}

    ngOnInit(): void {
        this.products$ = this.loadingS.showLoadingUntilCompleted(
            this.productsService.getProducts(true)
        );

        this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
            this.productsService.getFlashSales(true)
        );

        this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
            this.productsService.bestSelling(true)
        );
    }

    loadMore(category) {
        if (
            this.allProductsLoaded ||
            this.allBestSellingLoaded ||
            this.allFlashSalesLoaded
        ) {
            switch (category) {
                case 'products':
                    this.products$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.productsAllItems().pipe(
                            concatMap((all) => {
                                return this.productsService
                                    .getProducts(false)
                                    .pipe(
                                        map((paginated) => {
                                            let { loaded, paginatedProducts } =
                                                mapToPaginatedProducts(
                                                    paginated,
                                                    all,
                                                    this.allProductsLoaded
                                                );
                                            this.allProductsLoaded = loaded;
                                            return paginatedProducts;
                                        })
                                    );
                            })
                        )
                    );
                    break;
                case 'bestSelling':
                    this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.bestSellingAllItems().pipe(
                            concatMap((all) => {
                                return this.productsService
                                    .bestSelling(false)
                                    .pipe(
                                        map((paginated) => {
                                            let { loaded, paginatedProducts } =
                                                mapToPaginatedProducts(
                                                    paginated,
                                                    all,
                                                    this.allBestSellingLoaded
                                                );
                                            this.allBestSellingLoaded = loaded;
                                            return paginatedProducts;
                                        })
                                    );
                            })
                        )
                    );
                    break;
                case 'flashSales':
                    this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.flashSalesAllItems().pipe(
                            concatMap((all) => {
                                return this.productsService
                                    .getFlashSales(false)
                                    .pipe(
                                        map((paginated) => {
                                            let { loaded, paginatedProducts } =
                                                mapToPaginatedProducts(
                                                    paginated,
                                                    all,
                                                    this.allFlashSalesLoaded
                                                );
                                            this.allFlashSalesLoaded = loaded;
                                            return paginatedProducts;
                                        })
                                    );
                            })
                        )
                    );
                    break;
            }
        } else if (
            !this.allProductsLoaded ||
            !this.allBestSellingLoaded ||
            !this.allFlashSalesLoaded
        ) {
            switch (category) {
                case 'products':
                    this.products$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.productsAllItems().pipe(
                            concatMap((all) => {
                                return this.productsService
                                    .getProducts(true)
                                    .pipe(
                                        map((paginated) => {
                                            let { loaded, paginatedProducts } =
                                                mapToPaginatedProducts(
                                                    paginated,
                                                    all,
                                                    this.allProductsLoaded
                                                );
                                            this.allProductsLoaded = loaded;
                                            return paginatedProducts;
                                        })
                                    );
                            })
                        )
                    );
                    break;
                case 'bestSelling':
                    this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.bestSellingAllItems().pipe(
                            concatMap((all) => {
                                return this.productsService
                                    .bestSelling(true)
                                    .pipe(
                                        map((paginated) => {
                                            let { loaded, paginatedProducts } =
                                                mapToPaginatedProducts(
                                                    paginated,
                                                    all,
                                                    this.allBestSellingLoaded
                                                );
                                            this.allBestSellingLoaded = loaded;
                                            return paginatedProducts;
                                        })
                                    );
                            })
                        )
                    );
                    break;
                case 'flashSales':
                    this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.flashSalesAllItems().pipe(
                            concatMap((all) => {
                                return this.productsService
                                    .getFlashSales(true)
                                    .pipe(
                                        map((paginated) => {
                                            let { loaded, paginatedProducts } =
                                                mapToPaginatedProducts(
                                                    paginated,
                                                    all,
                                                    this.allFlashSalesLoaded
                                                );
                                            this.allFlashSalesLoaded = loaded;
                                            return paginatedProducts;
                                        })
                                    );
                            })
                        )
                    );
                    break;
            }
        }
    }

    ngOnDestroy(): void {
        this.productsService.resetFlashSales?.reset();
        this.productsService.resetProducts?.reset();
        this.productsService.resetBestSelling?.reset();
    }
}
