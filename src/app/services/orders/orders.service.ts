import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/auth.model';

export enum OrderStatus {
    Pending = 0,
    Processing = 1,
    Shipped = 2,
    Delivered = 3,
    Cancelled = 4
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImageUrl: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: number;
    shippingAddress1: string;
    shippingAddress2?: string;
    city: string;
    zipCode: string;
    country: string;
    phone: string;
    status: OrderStatus;
    totalPrice: number;
    dateOrdered: string;
    orderItems: OrderItem[];
}

export interface CreateOrderRequest {
    shippingAddress1: string;
    shippingAddress2?: string;
    city: string;
    zipCode: string;
    country: string;
    phone: string;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
    private readonly apiUrl = `${environment.apiUrl}/orders`;

    constructor(private http: HttpClient) { }

    getOrders(): Observable<Order[]> {
        return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}`)
            .pipe(map(response => response.data!));
    }

    getOrderById(id: number): Observable<Order> {
        return this.http.get<ApiResponse<Order>>(`${this.apiUrl}/${id}`)
            .pipe(map(response => response.data!));
    }

    createOrder(request: CreateOrderRequest): Observable<Order> {
        return this.http.post<ApiResponse<Order>>(`${this.apiUrl}`, request)
            .pipe(map(response => response.data!));
    }

    // Helper for displaying status
    getStatusString(status: OrderStatus): string {
        switch (status) {
            case OrderStatus.Pending: return 'Pending';
            case OrderStatus.Processing: return 'Processing';
            case OrderStatus.Shipped: return 'Shipped';
            case OrderStatus.Delivered: return 'Delivered';
            case OrderStatus.Cancelled: return 'Cancelled';
            default: return 'Unknown';
        }
    }

    saveUserDetails(orderDetails: any) {
        localStorage.setItem('checkoutDetails', JSON.stringify(orderDetails));
    }

    getUserOrderDetails() {
        if (typeof localStorage !== 'undefined') {
            const details = localStorage.getItem('checkoutDetails');
            return details ? JSON.parse(details) : null;
        }
        return null;
    }
}
