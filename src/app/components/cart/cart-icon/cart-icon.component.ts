import { Component, inject, OnInit } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../services/orders/cart.service';
import { Cart } from '../../../models/cart.model';

@Component({
    selector: 'app-cart-icon',
    standalone: true,
    imports: [BadgeModule, CommonModule, RouterModule],
    templateUrl: './cart-icon.component.html',
    styleUrl: './cart-icon.component.scss',
})
export class CartIconComponent implements OnInit {
    cartService = inject(CartService);
    cartCount: number;
    ngOnInit(): void {
        this.cartService.cart$.subscribe((cart: Cart | null) => {
            this.cartCount = cart?.items?.length ?? 0;
        });
    }
}
