import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CheckoutItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface CheckoutShipping {
    address1: string;
    address2?: string;
    city: string;
    zipCode: string;
    country: string;
    phone: string;
}

export interface CreateCheckoutSessionRequest {
    items: CheckoutItem[];
    shipping: CheckoutShipping;
    customerEmail: string;
    customerName: string;
}

export interface CheckoutSessionResponse {
    clientSecret: string;
    paymentIntentId: string;
    totalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
    private readonly apiUrl = `${environment.apiUrl}/payments`;
    private http = inject(HttpClient);

    /**
     * Creates a checkout session with PaymentIntent.
     * Order is NOT created at this point - it will be created by webhook after payment succeeds.
     */
    createCheckoutSession(request: CreateCheckoutSessionRequest): Observable<CheckoutSessionResponse> {
        return this.http.post<CheckoutSessionResponse>(`${this.apiUrl}/create-checkout-session`, request);
    }

    /**
     * Legacy method for backward compatibility.
     * Used when order was already created before payment.
     */
    createPaymentIntent(amount: number, orderId: number, description?: string): Observable<{ clientSecret: string; paymentIntentId: string }> {
        return this.http.post<{ clientSecret: string; paymentIntentId: string }>(`${this.apiUrl}/create-payment-intent`, {
            amount,
            orderId,
            description
        });
    }

    /**
     * Confirms payment was successful (manual confirmation for localhost testing).
     */
    confirmPayment(paymentIntentId: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/confirm-payment`, {
            paymentIntentId
        });
    }
}
