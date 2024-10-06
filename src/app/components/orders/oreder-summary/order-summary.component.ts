import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-order-summary',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './order-summary.component.html',
    styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent implements OnInit {
    router = inject(Router);
    @Input()
    totalPrice: number;
    isCheckout = false;
    constructor() {
        this.router.url.includes('checkout')
            ? (this.isCheckout = true)
            : (this.isCheckout = false);
    }
    ngOnInit(): void {}
}
