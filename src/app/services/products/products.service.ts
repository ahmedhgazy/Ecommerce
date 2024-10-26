import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, shareReplay, throwError } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductPagination } from './pagination';
import { MessagesService } from '../../shared/errors/messages/messages.service';

@Injectable({ providedIn: 'root' })
export class ProductsService {
    private baseUrl = 'https://e-commerce-ac5d3-default-rtdb.firebaseio.com';
    private messages: MessagesService = inject(MessagesService);

    private productsPagination: ProductPagination;
    private flashSalesPagination: ProductPagination;
    private bestSellingPagination: ProductPagination;
    allLoaded = false;

    constructor(private http: HttpClient) {}

    getProducts(loadMore: boolean) {
        if (loadMore) {
            if (!this.productsPagination) {
                return this.http
                    .get<Product[]>(`${this.baseUrl}/products.json`)
                    .pipe(
                        map((data: Product[]) => {
                            this.productsPagination = new ProductPagination(
                                data
                            );
                            return this.productsPagination.getItems(8);
                        }),
                        shareReplay(1),
                        catchError((err) => {
                            const message =
                                'Something went wrong, please try again later';
                            this.messages.showErrors(message);
                            return throwError(() => new Error(err.message));
                        })
                    );
            } else {
                return new Observable<Product[]>((observer) => {
                    observer.next(this.productsPagination.getItems(4));
                    observer.complete();
                });
            }
        } else {
            if (!this.productsPagination) {
                return this.http
                    .get<Product[]>(`${this.baseUrl}/products.json`)
                    .pipe(
                        map((data: Product[]) => {
                            this.productsPagination = new ProductPagination(
                                data
                            );
                            return this.productsPagination.reset();
                        }),
                        shareReplay(1),

                        catchError((err) => {
                            const message =
                                'Something went wrong, please try again later';
                            this.messages.showErrors(message);
                            return throwError(() => new Error(err.message));
                        })
                    );
            } else {
                return new Observable<Product[]>((observer) => {
                    observer.next(this.productsPagination.reset());
                    observer.complete();
                });
            }
        }
    }

    getFlashSales(loadMore: boolean) {
        if (loadMore) {
            if (!this.flashSalesPagination) {
                return this.http
                    .get<Product[]>(`${this.baseUrl}/flashSales.json`)
                    .pipe(
                        map((data: Product[]) => {
                            this.flashSalesPagination = new ProductPagination(
                                data
                            );
                            return this.flashSalesPagination.getItems();
                        }),
                        shareReplay(1),

                        catchError((err) => {
                            const message =
                                'Something went wrong, please try again later';
                            this.messages.showErrors(message);
                            return throwError(() => new Error(err.message));
                        })
                    );
            } else {
                return new Observable<Product[]>((observer) => {
                    observer.next(this.flashSalesPagination.getItems(4));
                    observer.complete();
                });
            }
        } else {
            if (!this.flashSalesPagination) {
                return this.http
                    .get<Product[]>(`${this.baseUrl}/flashSales.json`)
                    .pipe(
                        map((data: Product[]) => {
                            this.flashSalesPagination = new ProductPagination(
                                data
                            );
                            return this.flashSalesPagination.reset();
                        }),
                        shareReplay(1),

                        catchError((err) => {
                            const message =
                                'Something went wrong, please try again later';
                            this.messages.showErrors(message);
                            return throwError(() => new Error(err.message));
                        })
                    );
            } else {
                return new Observable<Product[]>((observer) => {
                    observer.next(this.flashSalesPagination.reset());
                    observer.complete();
                });
            }
        }
    }

    bestSelling(loadMore: boolean) {
        if (loadMore) {
            if (!this.bestSellingPagination) {
                return this.http
                    .get<Product[]>(`${this.baseUrl}/bestSelling.json`)
                    .pipe(
                        map((data: Product[]) => {
                            this.bestSellingPagination = new ProductPagination(
                                data
                            );
                            return this.bestSellingPagination.getItems();
                        }),
                        shareReplay(1),

                        catchError((err) => {
                            const message =
                                'Something went wrong, please try again later';
                            this.messages.showErrors(message);
                            return throwError(() => new Error(err.message));
                        })
                    );
            } else {
                return new Observable<Product[]>((observer) => {
                    observer.next(this.bestSellingPagination.getItems(4));
                    observer.complete();
                });
            }
        } else {
            if (!this.bestSellingPagination) {
                return this.http
                    .get<Product[]>(`${this.baseUrl}/bestSelling.json`)
                    .pipe(
                        map((data: Product[]) => {
                            this.bestSellingPagination = new ProductPagination(
                                data
                            );
                            return this.bestSellingPagination.reset();
                        }),
                        shareReplay(1),

                        catchError((err) => {
                            const message =
                                'Something went wrong, please try again later';
                            this.messages.showErrors(message);
                            return throwError(() => new Error(err.message));
                        })
                    );
            } else {
                return new Observable<Product[]>((observer) => {
                    observer.next(this.bestSellingPagination.reset());
                    observer.complete();
                });
            }
        }
    }

    bestSellingAllItems() {
        return this.http
            .get<Product[]>(`${this.baseUrl}/bestSelling.json`)
            .pipe(shareReplay(1));
    }

    productsAllItems() {
        return this.http
            .get<Product[]>(`${this.baseUrl}/products.json`)
            .pipe(shareReplay(1));
    }

    flashSalesAllItems() {
        return this.http
            .get<Product[]>(`${this.baseUrl}/flashSales.json`)
            .pipe(shareReplay(1));
    }

    get resetProducts() {
        return this.productsPagination;
    }

    get resetFlashSales() {
        return this.flashSalesPagination;
    }

    get resetBestSelling() {
        return this.bestSellingPagination;
    }
}
