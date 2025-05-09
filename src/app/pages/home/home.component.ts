import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../../components/producsts/product-list/product-list.component';
import { CategoriesComponent } from '../../components/producsts/catepgries/categories.component';
import { CatBannerComponent } from '../../components/producsts/catepgries/cat-banner/cat-banner.component';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { NewArrivalsComponent } from '../../components/producsts/new-arrivals/new-arrivals.component';
import { DetailsComponent } from '../../components/details/details.component';
import { ProductsService } from '../../services/products/products.service';
import { concatMap, map, Observable, take } from 'rxjs';
import { Product } from '../../models/product.model';
import { LoadingService } from '../../shared/components/loading/loading.service';
import { SharedButton } from '../../shared/components/shared-button/shared-button.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { mapToPaginatedProducts } from '../../models/product.model';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateFromTopDirective } from '../../shared/animations/scroll-animation/top';
import { AnimateFromRightDirective } from '../../shared/animations/scroll-animation/right';
import { AnimateFromLeftDirective } from '../../shared/animations/scroll-animation/left';
export interface sharedHeader {
    title: string;
    desc: string;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        ProductListComponent,
        CategoriesComponent,
        CatBannerComponent,
        SharedHeaderComponent,
        NewArrivalsComponent,
        DetailsComponent,
        SharedButton,
        LoadingComponent,
        TranslateModule,
        AnimateFromTopDirective,
        AnimateFromRightDirective,
        AnimateFromLeftDirective,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
    products$: Observable<Product[]>;
    flashSales$: Observable<Product[]>;
    bestSelling$: Observable<Product[]>;
    allProductsLoaded = false;
    allFlashSalesLoaded = false;
    allBestSellingLoaded = false;
    loadingS = inject(LoadingService);
    productsService = inject(ProductsService);

    ngOnInit(): void {
        this.products$ = this.loadingS.showLoadingUntilCompleted(
            this.productsService.getProducts(true).pipe(take(1))
        );

        this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
            this.productsService.getFlashSales(true).pipe(take(1))
        );

        this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
            this.productsService.bestSelling(true).pipe(take(1))
        );
    }

    loadMore(category) {
        if (
            this.allProductsLoaded &&
            (!this.allBestSellingLoaded || !this.allFlashSalesLoaded)
        ) {
            switch (category) {
                // !loaded
                case 'products':
                    this.products$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.productsAllItems().pipe(
                            take(1),

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
                // !Not loaded
                case 'bestSelling':
                    this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.bestSellingAllItems().pipe(
                            take(1),

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
                // !Not loaded
                case 'flashSales':
                    this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.flashSalesAllItems().pipe(
                            take(1),

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
        } else if (
            !this.allProductsLoaded &&
            (this.allBestSellingLoaded || !this.allFlashSalesLoaded)
        ) {
            switch (category) {
                // !Loaded
                case 'bestSelling':
                    this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.bestSellingAllItems().pipe(
                            take(1),
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
                // !Not loaded
                case 'products':
                    this.products$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.productsAllItems().pipe(
                            take(1),

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
                // !Not loaded
                case 'flashSales':
                    this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.flashSalesAllItems().pipe(
                            take(1),

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
        } else if (
            !this.allProductsLoaded &&
            (!this.allBestSellingLoaded || this.allFlashSalesLoaded)
        ) {
            switch (category) {
                // !Loaded
                case 'flashSales':
                    this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.flashSalesAllItems().pipe(
                            take(1),

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
                // !Not loaded
                case 'products':
                    this.products$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.productsAllItems().pipe(
                            take(1),

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
                // !Not loaded
                case 'bestSelling':
                    this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
                        this.productsService.bestSellingAllItems().pipe(
                            take(1),

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
            }
        }
    }
    ngOnDestroy(): void {
        this.productsService.resetFlashSales?.reset();
        this.productsService.resetProducts?.reset();
        this.productsService.resetBestSelling?.reset();
    }
}
