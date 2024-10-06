import { HttpClient } from '@angular/common/http';
import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../../models/cart.model';

export const CART_KEY = 'cart';

@Injectable({ providedIn: 'root' })
export class CartService {
    cartSubject = new BehaviorSubject(this.getCartFromLs());
    private totalPrice = new BehaviorSubject<number>(0);
    totalPrice$ = this.totalPrice.asObservable();
    http = inject(HttpClient);
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    initCartLS() {
        if (isPlatformBrowser(this.platformId)) {
            const cart = this.getCartFromLs();
            if (!cart) {
                const initialCart = {
                    items: [],
                };
                localStorage.setItem(CART_KEY, JSON.stringify(initialCart));
            }
        }
    }

    setCartItem(cartItem: CartItem, updateQuantity: boolean): Cart {
        if (isPlatformBrowser(this.platformId)) {
            const cart: Cart = this.getCartFromLs();

            const cartItemExist = cart.items.find((cart) => {
                return (
                    cart.productId === cartItem.productId &&
                    cart.category == cartItem.category
                );
            });

            if (cartItemExist) {
                cart.items.map((item) => {
                    if (item.productId === cartItem.productId) {
                        if ((updateQuantity = true)) {
                            item.quantity = cartItem.quantity;
                        } else {
                            item.quantity = item.quantity + cartItem.quantity;
                        }
                    }
                });
            } else {
                cart.items.push(cartItem);
            }
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
            this.cartSubject.next(cart);
            return cart;
        }
        return {};
    }

    getCartFromLs() {
        if (isPlatformBrowser(this.platformId)) {
            return JSON.parse(localStorage.getItem(CART_KEY));
        }
    }

    removeItem(category: string, id: number) {
        const cart: Cart = this.getCartFromLs();
        const newCart = cart?.items?.filter((item) => {
            return !(item.productId === id && item.category === category);
        });
        cart.items = newCart;
        this.cartSubject.next(cart);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        }
    }

    emptyCart() {
        const intialCart = {
            items: [],
        };
        const intialCartJson = JSON.stringify(intialCart);
        localStorage.setItem(CART_KEY, intialCartJson);
        this.cartSubject.next(intialCart);
    }

    public setTotalPrice(value: number) {
        this.totalPrice.next(value);
    }
}
