import { OrderStatus } from "../services/orders/orders.service";

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
