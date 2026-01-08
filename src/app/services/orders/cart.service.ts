import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiResponse } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  discount: number;
  discountedPrice: number;
  quantity: number;
  subTotal: number;
  inStock: boolean;
  availableQuantity: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  cart$ = new BehaviorSubject<Cart | null>(null);
  totalPrice$ = new BehaviorSubject<number>(0);
  totalItems$ = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
  ) { }

  getCart(): Observable<Cart> {
    return this.http.get<ApiResponse<Cart>>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data!),
        tap(cart => this.updateCartState(cart))
      );
  }

  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    const request: AddToCartRequest = { productId, quantity };

    return this.http.post<ApiResponse<Cart>>(`${this.apiUrl}`, request)
      .pipe(
        map(response => response.data!),
        tap(cart => this.updateCartState(cart))
      );
  }

  updateCartItem(productId: number, quantity: number): Observable<Cart> {
    const request: UpdateCartItemRequest = { quantity };

    return this.http.put<ApiResponse<Cart>>(`${this.apiUrl}/${productId}`, request)
      .pipe(
        map(response => response.data!),
        tap(cart => this.updateCartState(cart))
      );
  }

  removeFromCart(productId: number): Observable<Cart> {
    return this.http.delete<ApiResponse<Cart>>(`${this.apiUrl}/${productId}`)
      .pipe(
        map(response => response.data!),
        tap(cart => this.updateCartState(cart))
      );
  }

  clearCart(): Observable<void> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}`)
      .pipe(
        tap(() => {
          this.cart$.next({ items: [], totalPrice: 0, totalItems: 0 });
          this.totalPrice$.next(0);
          this.totalItems$.next(0);
        }),
        map(() => undefined)
      );
  }

  loadCart(): void {
    this.getCart().subscribe({
      error: () => {

        this.cart$.next({ items: [], totalPrice: 0, totalItems: 0 });
      }
    });
  }

  private updateCartState(cart: Cart): void {
    this.cart$.next(cart);
    this.totalPrice$.next(cart.totalPrice);
    this.totalItems$.next(cart.totalItems);
  }

  // Convenience methods for components
  get cartItems(): CartItem[] {
    return this.cart$.value?.items || [];
  }

  get cartTotal(): number {
    return this.totalPrice$.value;
  }

  get itemCount(): number {
    return this.totalItems$.value;
  }
}
