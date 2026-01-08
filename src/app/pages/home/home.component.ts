import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from '../../components/producsts/product-list/product-list.component';
import { CategoriesComponent } from '../../components/producsts/catepgries/categories.component';
import { CatBannerComponent } from '../../components/producsts/catepgries/cat-banner/cat-banner.component';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { NewArrivalsComponent } from '../../components/producsts/new-arrivals/new-arrivals.component';
import { DetailsComponent } from '../../components/details/details.component';
import { ProductsService } from '../../services/products/products.service';
import { concatMap, map, Observable, take, BehaviorSubject } from 'rxjs';
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
export class HomeComponent implements OnInit {
    productsSub = new BehaviorSubject<Product[]>([]);
    flashSalesSub = new BehaviorSubject<Product[]>([]);
    bestSellingSub = new BehaviorSubject<Product[]>([]);

    products$ = this.productsSub.asObservable();
    flashSales$ = this.flashSalesSub.asObservable();
    bestSelling$ = this.bestSellingSub.asObservable();

    productsPage = 1;
    flashSalesPage = 1;
    bestSellingPage = 1;

    allProductsLoaded = false;
    allFlashSalesLoaded = false;
    allBestSellingLoaded = false;

    loadingS = inject(LoadingService);
    productsService = inject(ProductsService);

    ngOnInit(): void {
        this.loadInitialData();
    }

    loadInitialData() {
        // Load Products
        this.productsService.getProducts({ pageNumber: 1 }).pipe(take(1)).subscribe(res => {
            this.productsSub.next(res.items);
            this.productsPage++;
            this.allProductsLoaded = !res.hasNextPage;
        });

        // Load Flash Sales
        this.productsService.getFlashSales(1).pipe(take(1)).subscribe(res => {
            this.flashSalesSub.next(res.items);
            this.flashSalesPage++;
            this.allFlashSalesLoaded = !res.hasNextPage;
        });

        // Load Best Selling
        this.productsService.getBestSelling(1).pipe(take(1)).subscribe(res => {
            this.bestSellingSub.next(res.items);
            this.bestSellingPage++;
            this.allBestSellingLoaded = !res.hasNextPage;
        });
    }

    loadMore(category: string) {
        switch (category) {
            case 'products':
                if (!this.allProductsLoaded) {
                    this.loadingS.showLoadingUntilCompleted(
                        this.productsService.getProducts({ pageNumber: this.productsPage }).pipe(
                            map(res => {
                                const current = this.productsSub.value;
                                this.productsSub.next([...current, ...res.items]);
                                this.productsPage++;
                                this.allProductsLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        )
                    ).subscribe();
                } else {
                    // Show Less: Reset to Page 1
                    this.loadingS.showLoadingUntilCompleted(
                        this.productsService.getProducts({ pageNumber: 1 }).pipe(
                            map(res => {
                                this.productsSub.next(res.items);
                                this.productsPage = 2;
                                this.allProductsLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        )
                    ).subscribe();
                }
                break;

            case 'bestSelling':
                if (!this.allBestSellingLoaded) {
                    this.loadingS.showLoadingUntilCompleted(
                        this.productsService.getBestSelling(this.bestSellingPage).pipe(
                            map(res => {
                                const current = this.bestSellingSub.value;
                                this.bestSellingSub.next([...current, ...res.items]);
                                this.bestSellingPage++;
                                this.allBestSellingLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        )
                    ).subscribe();
                } else {
                    // Show Less: Reset to Page 1
                    this.loadingS.showLoadingUntilCompleted(
                        this.productsService.getBestSelling(1).pipe(
                            map(res => {
                                this.bestSellingSub.next(res.items);
                                this.bestSellingPage = 2;
                                this.allBestSellingLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        )
                    ).subscribe();
                }
                break;

            case 'flashSales':
                if (!this.allFlashSalesLoaded) {
                    this.loadingS.showLoadingUntilCompleted(
                        this.productsService.getFlashSales(this.flashSalesPage).pipe(
                            map(res => {
                                const current = this.flashSalesSub.value;
                                this.flashSalesSub.next([...current, ...res.items]);
                                this.flashSalesPage++;
                                this.allFlashSalesLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        )
                    ).subscribe();
                } else {
                    // Show Less: Reset to Page 1
                    this.loadingS.showLoadingUntilCompleted(
                        this.productsService.getFlashSales(1).pipe(
                            map(res => {
                                this.flashSalesSub.next(res.items);
                                this.flashSalesPage = 2;
                                this.allFlashSalesLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        )
                    ).subscribe();
                }
                break;
        }
    }

    ngOnDestroy(): void {
        // No reset needed as service is stateless
    }
}
