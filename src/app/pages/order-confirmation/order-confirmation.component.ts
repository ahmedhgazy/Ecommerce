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
  styles: [`

 /* Background gradient */
  .bg-gradient {
    background: linear-gradient(to bottom right, #f0fdf4, #d1fae5, #ccfbf1);
  }

  @media (prefers-color-scheme: dark) {
    .bg-gradient {
      background: linear-gradient(to bottom right, #111827, #1f2937, #111827);
    }
  }

  /* Confetti animation */
  .confetti {
    width: 10px;
    height: 10px;
    top: -50px;
    animation: confetti-fall 3s linear infinite;
  }

  @keyframes confetti-fall {
    0% {
      transform: translateY(-50px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(360deg);
      opacity: 0;
    }
  }

  /* Scale in animation */
  .animate-scale-in {
    animation: scale-in 0.5s ease-out;
  }

  @keyframes scale-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Checkmark animation */
  .animate-checkmark {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: draw-checkmark 0.6s ease-out 0.3s forwards;
  }

  @keyframes draw-checkmark {
    to {
      stroke-dashoffset: 0;
    }
  }

  /* Fade in up animation */
  .animate-fade-in-up {
    opacity: 0;
    animation: fade-in-up 0.6s ease-out forwards;
  }

  @keyframes fade-in-up {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Button hover effects */
  .btn-success:hover {
    background: linear-gradient(to right, #059669, #047857) !important;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3) !important;
  }

  .btn-outline-secondary:hover {
    transform: translateY(-2px);
  }

  .btn {
    transition: all 0.3s ease;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .card {
      background-color: #1f2937 !important;
    }

    .text-dark {
      color: #ffffff !important;
    }

    .text-muted {
      color: #9ca3af !important;
    }

    .bg-light {
      background-color: rgba(55, 65, 81, 0.5) !important;
    }

    .border-bottom {
      border-color: #374151 !important;
    }

    .btn-outline-secondary {
      border-color: #4b5563 !important;
      color: #d1d5db !important;
      background-color: #1f2937 !important;
    }

    .btn-outline-secondary:hover {
      background-color: #374151 !important;
    }
  }

    @keyframes checkmark {
      0% { stroke-dashoffset: 100; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes scale-in {
      0% { transform: scale(0); opacity: 0; }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-checkmark {
      animation: checkmark 0.8s ease-out forwards;
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
    }
    .animate-scale-in {
      animation: scale-in 0.5s ease-out forwards;
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out forwards;
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #ffd700;
      animation: confetti-fall 3s linear infinite;
    }
    @keyframes confetti-fall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
  `],
  template: `

<div class="min-vh-100 bg-gradient py-5 px-3 px-md-4 position-relative overflow-hidden">

  <!-- Confetti (decorative) -->
  @for (i of [1,2,3,4,5,6,7,8]; track i) {
    <div class="confetti position-absolute" [style.left.%]="i * 12" [style.animation-delay.s]="i * 0.3" [style.background]="getConfettiColor(i)"></div>
  }

  <div class="container position-relative" style="max-width: 672px; z-index: 10;">

    <!-- Success Animation -->
    <div class="text-center mb-4">
      <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-4 animate-scale-in" style="width: 96px; height: 96px;">
        <svg class="text-success" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path class="animate-checkmark" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h1 class="display-5 fw-bold text-dark mb-2 animate-fade-in-up" style="animation-delay: 0.2s">
        Payment Successful!
      </h1>
      <p class="fs-5 text-muted animate-fade-in-up" style="animation-delay: 0.3s">
        Thank you for your order
      </p>
    </div>

    <!-- Order Details Card -->
    <div class="card border-0 rounded-4 shadow-lg mb-4 animate-fade-in-up" style="animation-delay: 0.4s">
      <div class="card-body p-4 p-md-5">

        @if (loading()) {
          <div class="d-flex justify-content-center py-5">
            <div class="spinner-border text-success" role="status" style="width: 2.5rem; height: 2.5rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        } @else {
          <!-- Order Number -->
          <div class="text-center pb-4 border-bottom">
            <p class="small text-muted mb-1">Order Number</p>
            <p class="fs-3 fw-bold text-dark">#{{ orderId() }}</p>
          </div>

          <!-- Order Info Grid -->
          <div class="row g-4 py-4">
            <div class="col-6">
              <p class="small text-muted mb-1">Date</p>
              <p class="fw-medium text-dark mb-0">{{ orderDate() | date:'medium' }}</p>
            </div>
            <div class="col-6">
              <p class="small text-muted mb-1">Total Amount</p>
              <p class="fw-bold fs-4 text-success mb-0">{{ totalAmount() | currency }}</p>
            </div>
            <div class="col-6">
              <p class="small text-muted mb-1">Payment Status</p>
              <span class="badge rounded-pill bg-success bg-opacity-10 text-success fw-medium d-inline-flex align-items-center gap-1" style="padding: 0.375rem 0.75rem; font-size: 0.75rem;">
                <i class="pi pi-check-circle"></i>
                Paid
              </span>
            </div>
            <div class="col-6">
              <p class="small text-muted mb-1">Order Status</p>
              <span class="badge rounded-pill bg-primary bg-opacity-10 text-primary fw-medium d-inline-flex align-items-center gap-1" style="padding: 0.375rem 0.75rem; font-size: 0.75rem;">
                <i class="pi pi-clock"></i>
                Processing
              </span>
            </div>
          </div>

          <!-- What's Next -->
          <div class="bg-light rounded-3 p-4 mt-3">
            <h3 class="h6 fw-semibold text-dark mb-3 d-flex align-items-center gap-2">
              <i class="pi pi-info-circle text-primary"></i>
              What's Next?
            </h3>
            <ul class="list-unstyled mb-0">
              <li class="d-flex align-items-start gap-2 mb-2 small text-muted">
                <i class="pi pi-envelope text-success" style="margin-top: 0.125rem;"></i>
                <span>You'll receive an order confirmation email shortly</span>
              </li>
              <li class="d-flex align-items-start gap-2 mb-2 small text-muted">
                <i class="pi pi-box text-warning" style="margin-top: 0.125rem;"></i>
                <span>We'll notify you when your order ships</span>
              </li>
              <li class="d-flex align-items-start gap-2 small text-muted">
                <i class="pi pi-truck text-info" style="margin-top: 0.125rem;"></i>
                <span>Estimated delivery: 3-5 business days</span>
              </li>
            </ul>
          </div>
        }
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center animate-fade-in-up" style="animation-delay: 0.5s">
      <a
        routerLink="/profile/orders"
        class="btn btn-outline-secondary btn-lg rounded-3 d-inline-flex align-items-center justify-content-center px-4 py-3 fw-medium"
      >
        <i class="pi pi-list me-2"></i>
        View My Orders
      </a>
      <a
        routerLink="/home"
        class="btn btn-success btn-lg rounded-3 d-inline-flex align-items-center justify-content-center px-4 py-3 fw-medium shadow-lg"
        style="background: linear-gradient(to right, #10b981, #059669); border: none;"
      >
        <i class="pi pi-shopping-bag me-2"></i>
        Continue Shopping
      </a>
    </div>

    <!-- Support Link -->
    <div class="text-center mt-4 small text-muted animate-fade-in-up" style="animation-delay: 0.6s">
      <p class="mb-0">Need help? <a routerLink="/contact" class="text-success text-decoration-none fw-medium">Contact Support</a></p>
    </div>
  </div>
</div>

  `
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  loading = signal(true);
  orderId = signal<string>('');
  totalAmount = signal(0);
  orderDate = signal(new Date().toISOString());

  confettiColors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff69b4', '#a8e6cf', '#fdfd96'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('orderId');

    if (id && id !== 'success') {
      this.orderId.set(id);
      this.fetchOrderDetails(id);
    } else {
      // Generic success - get from navigation state
      const state = history.state;
      this.orderId.set(state?.orderId || 'N/A');
      this.totalAmount.set(state?.amount || 0);
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
        this.loading.set(false);
      }
    });
  }

  getConfettiColor(index: number): string {
    return this.confettiColors[index % this.confettiColors.length];
  }
}
