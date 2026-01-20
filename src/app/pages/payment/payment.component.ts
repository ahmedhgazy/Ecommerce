import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { StripeService, StripeCardComponent, NgxStripeModule } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { switchMap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CartService } from '../../services/orders/cart.service';


interface OrderContext {
  orderId: number;
  amount: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: string;
  customerName: string;
  customerEmail: string;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, NgxStripeModule, ToastModule],
  providers: [MessageService],
  styles: [`


  .text-purple {
    color: #7c3aed !important;
  }

  .btn:hover {
    transform: scale(1.02);
  }

  .btn:active {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  a[routerLink]:hover {
    opacity: 1 !important;
  }

  /* Maintain your existing custom classes */
  .gradient-bg,
  .glass-card,
  .animate-fade-in-up,
  .animate-pulse-slow,
  .card-input-focus {
    /* Keep your existing CSS for these classes */
  }

    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .dark .glass-card {
      background: rgba(31, 41, 55, 0.95);
    }
    .gradient-bg {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card-input-focus {
      transition: all 0.3s ease;
    }
    .card-input-focus:focus-within {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
      border-color: #6366f1;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.5s ease-out forwards;
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .animate-pulse-slow {
      animation: pulse-slow 2s ease-in-out infinite;
    }
  `],
  template: `
  <div class="min-vh-100 gradient-bg py-4 px-3 px-md-4">
  <p-toast position="top-right"></p-toast>

  <div class="container" style="max-width: 1200px;">
    <!-- Header -->
    <div class="text-center mb-4 animate-fade-in-up">
      <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-20 mb-3" style="width: 64px; height: 64px;">
        <i class="pi pi-lock fs-2 text-white"></i>
      </div>
      <h1 class="display-5 fw-bold text-white mb-2">Secure Checkout</h1>
      <p class="text-white opacity-75">Your payment is protected by 256-bit SSL encryption</p>
    </div>

    <div class="row g-4">
      <!-- Order Summary (Left Side) -->
      <div class="col-lg-5 order-2 order-lg-1">
        <div class="card glass-card border-0 rounded-4 shadow-lg animate-fade-in-up" style="animation-delay: 0.1s">
          <div class="card-body p-4">
            <h3 class="h5 fw-semibold text-dark mb-4 d-flex align-items-center gap-2">
              <i class="pi pi-shopping-bag"></i>
              Order Summary
            </h3>

            <!-- Items List -->
            <div class="mb-4" style="max-height: 192px; overflow-y: auto;">
              @for (item of orderContext().items; track item.name) {
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div class="flex-grow-1">
                    <p class="small fw-medium text-dark mb-0">{{ item.name }}</p>
                    <p class="text-muted mb-0" style="font-size: 0.75rem;">Qty: {{ item.quantity }}</p>
                  </div>
                  <span class="small fw-semibold text-dark">
                    {{ item.price * item.quantity | currency }}
                  </span>
                </div>
              }
              @empty {
                <div class="py-4 text-center text-muted">
                  <i class="pi pi-shopping-cart fs-3 mb-2 d-block"></i>
                  <p class="small">Loading order details...</p>
                </div>
              }
            </div>

            <!-- Totals -->
            <div class="border-top pt-3">
              <div class="d-flex justify-content-between small text-muted mb-2">
                <span>Subtotal</span>
                <span>{{ amount() | currency }}</span>
              </div>
              <div class="d-flex justify-content-between small text-muted mb-2">
                <span>Shipping</span>
                <span class="text-success">Free</span>
              </div>
              <div class="d-flex justify-content-between fs-5 fw-bold text-dark pt-2 border-top">
                <span>Total</span>
                <span class="text-primary">{{ amount() | currency }}</span>
              </div>
            </div>

            <!-- Shipping Info -->
            @if (orderContext().shippingAddress) {
              <div class="mt-3 pt-3 border-top">
                <h4 class="small fw-medium text-secondary mb-2 d-flex align-items-center gap-2">
                  <i class="pi pi-map-marker"></i>
                  Shipping To
                </h4>
                <p class="small text-secondary mb-1">{{ orderContext().customerName }}</p>
                <p class="small text-muted mb-0">{{ orderContext().shippingAddress }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Trust Badges -->
        <div class="card glass-card border-0 rounded-4 shadow-lg mt-3 animate-fade-in-up" style="animation-delay: 0.2s">
          <div class="card-body p-3">
            <div class="d-flex align-items-center justify-content-around">
              <div class="text-center">
                <i class="pi pi-shield fs-3 text-success mb-1"></i>
                <p class="mb-0" style="font-size: 0.75rem; color: #6c757d;">Secure</p>
              </div>
              <div class="text-center">
                <i class="pi pi-verified fs-3 text-primary mb-1"></i>
                <p class="mb-0" style="font-size: 0.75rem; color: #6c757d;">Verified</p>
              </div>
              <div class="text-center">
                <i class="pi pi-credit-card fs-3 text-purple mb-1"></i>
                <p class="mb-0" style="font-size: 0.75rem; color: #6c757d;">Encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Form (Right Side) -->
      <div class="col-lg-7 order-1 order-lg-2">
        <div class="card glass-card border-0 rounded-4 shadow-lg animate-fade-in-up" style="animation-delay: 0.15s">
          <div class="card-body p-4 p-md-5">

            @if (loading()) {
              <div class="d-flex flex-column align-items-center justify-content-center py-5">
                <div class="position-relative mb-3">
                  <div class="spinner-border text-primary" role="status" style="width: 4rem; height: 4rem;">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
                <p class="text-muted animate-pulse-slow">Initializing secure payment...</p>
              </div>
            } @else {
              <form (ngSubmit)="pay()">

                <!-- Card Brands -->
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <h3 class="h5 fw-semibold text-dark mb-0">Payment Details</h3>
                  <div class="d-flex gap-2">
                    <img src="https://img.icons8.com/color/32/visa.png" alt="Visa" height="24">
                    <img src="https://img.icons8.com/color/32/mastercard.png" alt="Mastercard" height="24">
                    <img src="https://img.icons8.com/color/32/amex.png" alt="Amex" height="24">
                  </div>
                </div>

                <!-- Card Input -->
                <div class="mb-3">
                  <label class="form-label small fw-medium text-dark">
                    Card Information
                  </label>
                  <div class="card-input-focus p-3 border border-2 rounded-3 bg-white">
                    <ngx-stripe-card
                      [options]="cardOptions"
                      [elementsOptions]="elementsOptions"
                    ></ngx-stripe-card>
                  </div>
                  <div class="form-text d-flex align-items-center gap-1">
                    <i class="pi pi-info-circle"></i>
                    Test card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
                  </div>
                </div>

                <!-- Error Display -->
                @if (error()) {
                  <div class="alert alert-danger rounded-3 d-flex align-items-start gap-3" role="alert">
                    <div class="flex-shrink-0">
                      <i class="pi pi-times-circle fs-5"></i>
                    </div>
                    <div>
                      <h4 class="alert-heading h6">Payment Failed</h4>
                      <p class="mb-0 small">{{ error() }}</p>
                    </div>
                  </div>
                }

                <!-- Pay Button -->
                <button
                  type="submit"
                  [disabled]="processing()"
                  class="btn btn-lg w-100 text-white fw-semibold rounded-3 shadow-lg position-relative overflow-hidden"
                  style="background: linear-gradient(to right, #4f46e5, #7c3aed); border: none; padding: 1rem 1.5rem; transition: all 0.3s ease;"
                >
                  @if (processing()) {
                    <span class="d-flex align-items-center justify-content-center gap-3">
                      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Processing Payment...
                    </span>
                  } @else {
                    <span class="d-flex align-items-center justify-content-center gap-2">
                      <i class="pi pi-lock"></i>
                      Pay {{ amount() | currency }} Securely
                    </span>
                  }
                </button>

                <!-- Security Note -->
                <div class="text-center pt-4 mt-4 border-top">
                  <p class="small text-muted mb-0 d-flex align-items-center justify-content-center gap-2">
                    <i class="pi pi-shield text-success"></i>
                    Your payment info is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Back Link -->
    <div class="text-center mt-4">
      <a routerLink="/cart" class="text-white text-decoration-none opacity-75 d-inline-flex align-items-center gap-2" style="transition: opacity 0.2s;">
        <i class="pi pi-arrow-left"></i>
        Return to Cart
      </a>
    </div>
  </div>
</div>
  `
})
export class PaymentComponent implements OnInit {
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  private http = inject(HttpClient);
  private stripeService = inject(StripeService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cartService = inject(CartService);

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#6366f1',
        color: '#1f2937',
        fontWeight: '500',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#9ca3af'
        }
      },
      invalid: {
        iconColor: '#ef4444',
        color: '#ef4444'
      }
    },
    hidePostalCode: true
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  loading = signal(false);
  processing = signal(false);
  error = signal<string | null>(null);
  amount = signal(0);

  orderContext = signal<OrderContext>({
    orderId: 0,
    amount: 0,
    items: [],
    shippingAddress: '',
    customerName: '',
    customerEmail: ''
  });

  ngOnInit(): void {
    // Get order context from browser history state (persists after navigation completes)
    const state = history.state as any;

    if (state?.amount) {
      this.amount.set(state.amount);
      this.orderContext.set({
        orderId: state.orderId || 0,
        amount: state.amount,
        items: state.items || [
          { name: 'Order Items', quantity: 1, price: state.amount }
        ],
        shippingAddress: state.shippingAddress || '',
        customerName: state.customerName || 'Customer',
        customerEmail: state.customerEmail || ''
      });
    } else {
      // No order context - redirect to cart
      this.messageService.add({
        severity: 'warn',
        summary: 'Session Expired',
        detail: 'Please start checkout again'
      });
      setTimeout(() => this.router.navigate(['/cart']), 2000);
    }
  }

  pay() {
    this.processing.set(true);
    this.error.set(null);

    this.http.post<{ clientSecret: string }>(`${environment.apiUrl}/Payments/create-payment-intent`, {
      amount: this.amount(),
      orderId: this.orderContext().orderId,
      description: `Order #${this.orderContext().orderId}`
    }).pipe(
      switchMap(res => {
        return this.stripeService.confirmCardPayment(res.clientSecret, {
          payment_method: {
            card: this.card.element,
            billing_details: {
              name: this.orderContext().customerName,
              email: this.orderContext().customerEmail
            },
          },
        });
      })
    ).subscribe({
      next: (result) => {
        this.processing.set(false);
        if (result.error) {
          this.error.set(result.error.message || 'Payment failed. Please try again.');
        } else if (result.paymentIntent?.status === 'succeeded') {
          // Clear cart only after successful payment
          this.cartService.clearCart().subscribe();

          this.messageService.add({
            severity: 'success',
            summary: 'Payment Successful!',
            detail: 'Thank you for your purchase'
          });
          // Navigate to order confirmation
          setTimeout(() => {
            this.router.navigate(['/order-confirmation', this.orderContext().orderId || 'success']);
          }, 1500);
        }
      },
      error: (err) => {
        this.processing.set(false);
        this.error.set(err.error?.message || 'An unexpected error occurred. Please try again.');
      }
    });
  }
}
