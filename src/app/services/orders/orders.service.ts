import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Order } from '../../models/order.model';
import { AuthService } from '../auth/auth.service';
import { platformBrowser } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../models/user.model';
import { catchError, map, Observable, throwError } from 'rxjs';
import { MessagesService } from '../../shared/errors/messages/messages.service';

@Injectable({ providedIn: 'root' })
export class OrdersService {
    auth = inject(AuthService);
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private messages: MessagesService
    ) {}
    ORDER_DETAILS = 'orderDetails';

    private baseUrl = 'https://e-commerce-ac5d3-default-rtdb.firebaseio.com';
    // /products.json

    http = inject(HttpClient);

    createOrder(order): Observable<Order> {
        const userId = this.auth.user.getValue()?.id;

        return this.http.post<{ [key: string]: Order }>(
            `${this.baseUrl}/orders/${userId}.json`,
            order
        );
    }

    getOrders(): Observable<Order[]> {
        const userId = this.auth.user.getValue()?.id;
        return this.http
            .get<{ [key: string]: Order }>(
                `${this.baseUrl}/orders/${userId}.json`
            )
            .pipe(
                map((res: { [key: string]: Order }) => {
                    const ordersList: Order[] = [];

                    for (const key in res) {
                        if (res.hasOwnProperty(key)) {
                            ordersList.push({ ...res[key], encryptedId: key });
                        }
                    }
                    return ordersList;
                }),
                catchError((err) => {
                    const message =
                        'Something went wrong,please try again later';
                    this.messages.showErrors(message);
                    return throwError(err);
                })
            );
    }

    saveUserDetails(userOrderDetails) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(
                'orderDetails',
                JSON.stringify(userOrderDetails)
            );
        }
    }

    getUserOrderDetails() {
        if (isPlatformBrowser(this.platformId)) {
            const form = JSON.parse(
                localStorage.getItem(`${this.ORDER_DETAILS}`)
            );
            return form;
        } else {
            return null;
        }
    }

    emptyOrderDetailsStorage() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(`${this.ORDER_DETAILS}`);
        }
    }
}
