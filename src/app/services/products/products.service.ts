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
                        shareReplay({
                            bufferSize: 1,
                            refCount: true,
                        }),
                        catchError((err) => {
                            const message =
                                'Something went wrong,please try again later';
                            this.messages.showErrors(message);
                            return throwError(err);
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
                        shareReplay({
                            bufferSize: 1,
                            refCount: true,
                        }),
                        catchError((err) => {
                            const message =
                                'Something went wrong,please try again later';
                            this.messages.showErrors(message);
                            return throwError(err);
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
                        shareReplay({
                            bufferSize: 1,
                            refCount: true,
                        }),
                        catchError((err) => {
                            const message =
                                'Something went wrong,please try again later';
                            this.messages.showErrors(message);
                            return throwError(err);
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
                        shareReplay({
                            bufferSize: 1,
                            refCount: true,
                        }),
                        catchError((err) => {
                            const message =
                                'Something went wrong,please try again later';
                            this.messages.showErrors(message);
                            return throwError(err);
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

    bestSelling(loadMore) {
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
                        shareReplay({
                            bufferSize: 1,
                            refCount: true,
                        }),
                        catchError((err) => {
                            const message =
                                'Something went wrong,please try again later';
                            this.messages.showErrors(message);
                            return throwError(err);
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

                        shareReplay({
                            bufferSize: 1,
                            refCount: true,
                        }),
                        catchError((err) => {
                            const message =
                                'Something went wrong,please try again later';
                            this.messages.showErrors(message);
                            return throwError(err);
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
            .pipe(
                shareReplay({
                    bufferSize: 1,
                    refCount: true,
                })
            );
    }

    productsAllItems() {
        return this.http.get<Product[]>(`${this.baseUrl}/products.json`).pipe(
            shareReplay({
                bufferSize: 1,
                refCount: true,
            })
        );
    }

    flashSalesAllItems() {
        return this.http.get<Product[]>(`${this.baseUrl}/flashSales.json`).pipe(
            shareReplay({
                bufferSize: 1,
                refCount: true,
            })
        );
    }

    get resetProducts() {
        return this.productsPagination;
    }
    get resetFlashSales() {
        return this.bestSellingPagination;
    }
    get resetBestSelling() {
        return this.flashSalesPagination;
    }
}
