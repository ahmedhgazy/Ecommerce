import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Product } from '../../models/product.model';
import { AuthService } from '../auth/auth.service';
import {
    map,
    shareReplay,
    switchMap,
    of,
    Observable,
    throwError,
    catchError,
} from 'rxjs';
import { MessagesService } from '../../shared/errors/messages/messages.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
    http = inject(HttpClient);
    private baseUrl = 'https://e-commerce-ac5d3-default-rtdb.firebaseio.com';
    authS = inject(AuthService);
    private messages: MessagesService = inject(MessagesService);

    addToWishlist(product: Product): Observable<any> {
        const userId = this.authS.user.getValue()?.id;
        return this.checkIfProductExists(userId, product.id).pipe(
            switchMap((exists) => {
                if (exists) {
                    return of(null);
                } else {
                    return this.http.post<Product>(
                        `${this.baseUrl}/collections/${userId}.json`,
                        product
                    );
                }
            }),
            shareReplay(1),
            catchError((err) => {
                const message = 'Something went wrong,please try again later';
                this.messages.showErrors(message);
                return throwError(() => new Error(err));

            })
        );
    }

    private checkIfProductExists(
        userId: string,
        productId: number
    ): Observable<boolean> {
        return this.getSavedItems().pipe(
            map((items) => items.some((item) => item.id === productId))
        );
    }

    getSavedItems(): Observable<Product[]> {
        const userId = this.authS.user.getValue()?.id;
        return this.http
            .get<{ [key: string]: Product }>(
                `${this.baseUrl}/collections/${userId}.json`
            )
            .pipe(
                map((response: { [key: string]: Product }) => {
                    const ProductList: Product[] = [];
                    for (const key in response) {
                        response[key].inWishlist = true;
                        ProductList.push(response[key]);
                    }
                    return ProductList;
                }),
                shareReplay(1),
                catchError((err) => {
                    const message =
                        'Something went wrong,please try again later';
                    this.messages.showErrors(message);
                    return throwError(() => new Error(err));
                })
            );
    }
}
