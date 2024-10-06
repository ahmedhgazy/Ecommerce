export interface Cart {
    items?: CartItem[];
}
export interface CartItem {
    productId?: number;
    quantity?: number;
    category?: string;
}
