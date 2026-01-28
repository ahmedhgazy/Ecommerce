import { Component, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
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
import { LoadingService } from '../../core/services/loading.service';
import { SharedButton } from '../../shared/components/shared-button/shared-button.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateFromTopDirective } from '../../shared/animations/scroll-animation/top';
import { AnimateFromRightDirective } from '../../shared/animations/scroll-animation/right';
import { AnimateFromLeftDirective } from '../../shared/animations/scroll-animation/left';
import { TimerDigitComponent } from '../../components/producsts/catepgries/cat-banner/timer-digit/timer-digit.component';
import { PromotionsService } from '../../services/promotions/promotions.service';

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
        SharedHeaderComponent,
        NewArrivalsComponent,
        DetailsComponent,
        SharedButton,
        LoadingComponent,
        TranslateModule,
        TimerDigitComponent,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
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
    promotionsService = inject(PromotionsService);

    // Timer Logic
    targetDate = signal(new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
    currentTime = signal(new Date());
    private animationFrameId: number | undefined;

    countdown = computed(() => {
        const timeDifference =
            this.targetDate().getTime() - this.currentTime().getTime();

        if (timeDifference > 0) {
            return {
                days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
                hours: Math.floor(
                    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                ),
                minutes: Math.floor(
                    (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
                ),
                seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
            };
        } else {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    });

    ngOnInit(): void {
        this.loadInitialData();
        this.fetchFlashSaleDate();
        this.updateTime();
    }

    ngOnDestroy(): void {
        if (this.animationFrameId !== undefined) {
            cancelAnimationFrame(this.animationFrameId);
        }
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

                        this.productsService.getProducts({ pageNumber: this.productsPage }).pipe(
                            map(res => {
                                const current = this.productsSub.value;
                                this.productsSub.next([...current, ...res.items]);
                                this.productsPage++;
                                this.allProductsLoaded = !res.hasNextPage;
                                return res.items;
                            })
                    ).subscribe();
                } else {
                    // Show Less: Reset to Page 1
                    this.productsService.getProducts({ pageNumber: 1 }).pipe(
                            map(res => {
                                this.productsSub.next(res.items);
                                this.productsPage = 2;
                                this.allProductsLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        ).subscribe();
                }
                break;

            case 'bestSelling':
                if (!this.allBestSellingLoaded) {
                        this.productsService.getBestSelling(this.bestSellingPage).pipe(
                            map(res => {
                                const current = this.bestSellingSub.value;
                                this.bestSellingSub.next([...current, ...res.items]);
                                this.bestSellingPage++;
                                this.allBestSellingLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        ).subscribe();
                } else {
                    // Show Less: Reset to Page 1
                        this.productsService.getBestSelling(1).pipe(
                            map(res => {
                                this.bestSellingSub.next(res.items);
                                this.bestSellingPage = 2;
                                this.allBestSellingLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        ).subscribe();
                }
                break;

            case 'flashSales':
                if (!this.allFlashSalesLoaded) {
                    this.productsService.getFlashSales(this.flashSalesPage).pipe(
                            map(res => {
                                const current = this.flashSalesSub.value;
                                this.flashSalesSub.next([...current, ...res.items]);
                                this.flashSalesPage++;
                                this.allFlashSalesLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        ).subscribe();
                } else {
                    // Show Less: Reset to Page 1
                    this.productsService.getFlashSales(1).pipe(
                            map(res => {
                                this.flashSalesSub.next(res.items);
                                this.flashSalesPage = 2;
                                this.allFlashSalesLoaded = !res.hasNextPage;
                                return res.items;
                            })
                        ).subscribe();
                }
                break;
        }
    }

    private fetchFlashSaleDate() {
        this.promotionsService.getFlashSaleEndDate().subscribe({
            next: (date) => {
                this.targetDate.set(date);
            },
            error: (err) => {
                console.error('Failed to fetch flash sale date', err);
                this.targetDate.set(this.calculateFallbackDate(1, 5, 9));
            }
        });
    }

    private calculateFallbackDate(days: number, hours: number = 0, minutes: number = 0): Date {
        const now = new Date();
        return new Date(
            now.getTime() +
            days * 24 * 60 * 60 * 1000 +
            hours * 60 * 60 * 1000 +
            minutes * 60 * 1000
        );
    }

    private updateTime() {
        this.currentTime.set(new Date());
        this.animationFrameId = requestAnimationFrame(() => this.updateTime());
    }
}

