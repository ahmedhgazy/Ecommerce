import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface OrderDetails {
  id: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  dateOrdered: string;
  shippingAddress1: string;
  city: string;
  country: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrl: './order-confirmation.component.scss',
  templateUrl: './order-confirmation.component.html'
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  loading = signal(true);
  orderId = signal<string | null>(null);
  totalAmount = signal(0);
  orderDate = signal(new Date().toISOString());

  // Flag to indicate success-only mode (no order details to display)
  successOnlyMode = signal(false);

  confettiColors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff69b4', '#a8e6cf', '#fdfd96'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('orderId');

    if (id && id !== 'success') {
      // We have a real order ID - fetch order details
      this.orderId.set(id);
      this.fetchOrderDetails(id);
    } else {
      // Success-only mode: Payment succeeded but order was created by webhook
      // User should check their orders page to see the order
      this.successOnlyMode.set(true);

      // Try to get amount from navigation state for display
      const state = history.state;
      if (state?.amount) {
        this.totalAmount.set(state.amount);
      }

      this.loading.set(false);
    }
  }

  fetchOrderDetails(orderId: string): void {
    this.http.get<OrderDetails>(`${environment.apiUrl}/Orders/${orderId}`).subscribe({
      next: (order) => {
        this.orderId.set(orderId);
        this.totalAmount.set(order.totalPrice);
        this.orderDate.set(order.dateOrdered);
        this.loading.set(false);
      },
      error: () => {
        // If we can't fetch order details, switch to success-only mode
        this.successOnlyMode.set(true);
        this.loading.set(false);
      }
    });
  }

  getConfettiColor(index: number): string {
    return this.confettiColors[index % this.confettiColors.length];
  }
}

