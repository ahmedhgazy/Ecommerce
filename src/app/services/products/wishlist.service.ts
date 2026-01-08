import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product } from '../../models/product.model';
import { ApiResponse } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

export interface WishlistItem {
    id: number;
    productId: number;
    productName: string;
    productImageUrl: string;
    price: number;
    discount: number;
    discountedPrice: number;
    rating: number;
    inStock: boolean;
}

export interface Wishlist {
    items: WishlistItem[];
    totalItems: number;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private readonly apiUrl = `${environment.apiUrl}/wishlist`;

    wishlist$ = new BehaviorSubject<Wishlist | null>(null);

    constructor(private http: HttpClient) { }

    getWishlist(): Observable<Wishlist> {
        return this.http.get<ApiResponse<Wishlist>>(`${this.apiUrl}`)
            .pipe(
                map(response => response.data!),
                tap(wishlist => this.wishlist$.next(wishlist))
            );
    }

    addToWishlist(productId: number): Observable<Wishlist> {
        return this.http.post<ApiResponse<Wishlist>>(`${this.apiUrl}/${productId}`, {})
            .pipe(
                map(response => response.data!),
                tap(wishlist => this.wishlist$.next(wishlist))
            );
    }

    removeFromWishlist(productId: number): Observable<Wishlist> {
        return this.http.delete<ApiResponse<Wishlist>>(`${this.apiUrl}/${productId}`)
            .pipe(
                map(response => response.data!),
                tap(wishlist => this.wishlist$.next(wishlist))
            );
    }

    isInWishlist(productId: number): Observable<boolean> {
        return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/${productId}/check`)
            .pipe(map(response => response.data!));
    }

    loadWishlist(): void {
        this.getWishlist().subscribe({
            error: () => {
                this.wishlist$.next({ items: [], totalItems: 0 });
            }
        });
    }

    // Quick check from cached state
    isProductInWishlist(productId: number): boolean {
        const wishlist = this.wishlist$.value;
        return wishlist?.items.some(item => item.productId === productId) || false;
    }

    get wishlistItems(): WishlistItem[] {
        return this.wishlist$.value?.items || [];
    }

    get itemCount(): number {
        return this.wishlist$.value?.totalItems || 0;
    }
}
