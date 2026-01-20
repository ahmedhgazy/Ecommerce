import { Component, inject, OnInit, signal, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StripeService, StripeCardComponent, NgxStripeModule } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { CartService } from '../../services/orders/cart.service';
import { OrdersService } from '../../services/orders/orders.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout-wizard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgxStripeModule,
    ToastModule,
    InputTextModule,
    DropdownModule
  ],
  providers: [MessageService],
  styles: [`
    .wizard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .step-indicator {
      position: relative;
    }

    .step-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .step-circle.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .step-circle.completed {
      background: #10b981;
      color: white;
    }

    .step-circle.inactive {
      background: #e5e7eb;
      color: #9ca3af;
    }

    .step-line {
      width: 120px;
      height: 4px;
      background: #e5e7eb;
      transition: all 0.3s ease;
    }

    .step-line.active {
      background: linear-gradient(90deg, #10b981, #667eea);
    }

    .slide-enter {
      animation: slideIn 0.4s ease-out forwards;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.ng-invalid.ng-touched {
      border-color: #ef4444;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #6b7280;
      border: 2px solid #e5e7eb;
      padding: 1rem 2rem;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-secondary:hover {
      border-color: #667eea;
      color: #667eea;
    }
  `],
  template: `
    <div class="wizard-container py-4 px-3">
      <p-toast position="top-right"></p-toast>

      <div class="container" style="max-width: 1200px;">
        <!-- Header -->
        <div class="text-center mb-4">
          <h1 class="display-5 fw-bold text-white mb-2">Checkout</h1>
          <p class="text-white opacity-75">Complete your order in just a few steps</p>
        </div>

        <!-- Step Indicator -->
        <div class="d-flex justify-content-center align-items-center mb-5">
          <!-- Step 1 -->
          <div class="text-center">
            <div class="step-circle mx-auto mb-2"
                 [class.active]="currentStep() === 1"
                 [class.completed]="currentStep() > 1">
              @if (currentStep() > 1) {
                <i class="pi pi-check"></i>
              } @else {
                1
              }
            </div>
            <span class="small text-white fw-medium">Shipping</span>
          </div>

          <!-- Line -->
          <div class="step-line mx-3" [class.active]="currentStep() > 1"></div>

          <!-- Step 2 -->
          <div class="text-center">
            <div class="step-circle mx-auto mb-2"
                 [class.active]="currentStep() === 2"
                 [class.completed]="currentStep() > 2"
                 [class.inactive]="currentStep() < 2">
              @if (currentStep() > 2) {
                <i class="pi pi-check"></i>
              } @else {
                2
              }
            </div>
            <span class="small text-white fw-medium">Payment</span>
          </div>
        </div>

        <div class="row g-4">
          <!-- Order Summary Sidebar -->
          <div class="col-lg-4 order-2 order-lg-1">
            <div class="card glass-card border-0 rounded-4 shadow-lg sticky-lg-top" style="top: 1rem;">
              <div class="card-body p-4">
                <h3 class="h5 fw-semibold text-dark mb-4 d-flex align-items-center gap-2">
                  <i class="pi pi-shopping-bag text-primary"></i>
                  Order Summary
                </h3>

                <!-- Cart Items -->
                <div class="mb-4" style="max-height: 250px; overflow-y: auto;">
                  @for (item of cartItems(); track item.productId) {
                    <div class="d-flex gap-3 py-2 border-bottom">
                      <img [src]="item.imageUrl || 'assets/placeholder.png'"
                           class="rounded-3"
                           style="width: 60px; height: 60px; object-fit: cover;">
                      <div class="flex-grow-1">
                        <p class="small fw-medium text-dark mb-0 text-truncate">{{ item.name }}</p>
                        <p class="text-muted mb-0" style="font-size: 0.75rem;">Qty: {{ item.quantity }}</p>
                        <p class="text-primary fw-semibold mb-0">{{ item.price * item.quantity | currency }}</p>
                      </div>
                    </div>
                  } @empty {
                    <div class="text-center py-4 text-muted">
                      <i class="pi pi-shopping-cart fs-1 mb-2 d-block"></i>
                      <p class="small">Your cart is empty</p>
                    </div>
                  }
                </div>

                <!-- Totals -->
                <div class="border-top pt-3">
                  <div class="d-flex justify-content-between small text-muted mb-2">
                    <span>Subtotal</span>
                    <span>{{ totalPrice() | currency }}</span>
                  </div>
                  <div class="d-flex justify-content-between small text-muted mb-2">
                    <span>Shipping</span>
                    <span class="text-success">Free</span>
                  </div>
                  <div class="d-flex justify-content-between fs-5 fw-bold text-dark pt-2 border-top">
                    <span>Total</span>
                    <span class="text-primary">{{ totalPrice() | currency }}</span>
                  </div>
                </div>

                <!-- Trust Badges -->
                <div class="mt-4 pt-3 border-top">
                  <div class="d-flex justify-content-around text-center">
                    <div>
                      <i class="pi pi-shield fs-4 text-success"></i>
                      <p class="mb-0 small text-muted">Secure</p>
                    </div>
                    <div>
                      <i class="pi pi-truck fs-4 text-primary"></i>
                      <p class="mb-0 small text-muted">Free Ship</p>
                    </div>
                    <div>
                      <i class="pi pi-refresh fs-4 text-warning"></i>
                      <p class="mb-0 small text-muted">Returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="col-lg-8 order-1 order-lg-2">
            <div class="card glass-card border-0 rounded-4 shadow-lg">
              <div class="card-body p-4 p-md-5">

                <!-- Step 1: Shipping -->
                @if (currentStep() === 1) {
                  <div class="slide-enter">
                    <h3 class="h4 fw-bold text-dark mb-4">
                      <i class="pi pi-map-marker text-primary me-2"></i>
                      Shipping Details
                    </h3>

                    <form [formGroup]="shippingForm" class="row g-3">
                      <div class="col-md-6">
                        <label class="form-label small fw-medium">Full Name *</label>
                        <input type="text" class="form-input" formControlName="name" placeholder="John Doe">
                        @if (shippingForm.get('name')?.invalid && shippingForm.get('name')?.touched) {
                          <small class="text-danger">Name is required</small>
                        }
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-medium">Email *</label>
                        <input type="email" class="form-input" formControlName="email" placeholder="john@example.com">
                        @if (shippingForm.get('email')?.invalid && shippingForm.get('email')?.touched) {
                          <small class="text-danger">Valid email is required</small>
                        }
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-medium">Phone *</label>
                        <input type="tel" class="form-input" formControlName="phone" placeholder="+1 234 567 8900">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-medium">Country *</label>
                        <input type="text" class="form-input" formControlName="country" placeholder="United States">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-medium">City *</label>
                        <input type="text" class="form-input" formControlName="city" placeholder="New York">
                      </div>

                      <div class="col-md-6">
                        <label class="form-label small fw-medium">ZIP Code *</label>
                        <input type="text" class="form-input" formControlName="zip" placeholder="10001">
                      </div>

                      <div class="col-12">
                        <label class="form-label small fw-medium">Street Address *</label>
                        <input type="text" class="form-input" formControlName="address" placeholder="123 Main Street, Apt 4B">
                      </div>
                    </form>

                    <div class="d-flex justify-content-between mt-5">
                      <a routerLink="/cart" class="btn-secondary d-inline-flex align-items-center gap-2">
                        <i class="pi pi-arrow-left"></i>
                        Back to Cart
                      </a>
                      <button class="btn-primary d-inline-flex align-items-center gap-2"
                              [disabled]="shippingForm.invalid || isLoading()"
                              (click)="proceedToPayment()">
                        @if (isLoading()) {
                          <span class="spinner-border spinner-border-sm"></span>
                          Creating Order...
                        } @else {
                          Continue to Payment
                          <i class="pi pi-arrow-right"></i>
                        }
                      </button>
                    </div>
                  </div>
                }

                <!-- Step 2: Payment -->
                @if (currentStep() === 2) {
                  <div class="slide-enter">
                    <h3 class="h4 fw-bold text-dark mb-4">
                      <i class="pi pi-credit-card text-primary me-2"></i>
                      Payment Details
                    </h3>

                    <!-- Card Brands -->
                    <div class="d-flex align-items-center gap-2 mb-4">
                      <img src="https://img.icons8.com/color/40/visa.png" alt="Visa">
                      <img src="https://img.icons8.com/color/40/mastercard.png" alt="Mastercard">
                      <img src="https://img.icons8.com/color/40/amex.png" alt="Amex">
                      <span class="ms-auto small text-muted">
                        <i class="pi pi-lock text-success me-1"></i>
                        Secured by Stripe
                      </span>
                    </div>

                    <!-- Card Input -->
                    <div class="mb-4">
                      <label class="form-label small fw-medium">Card Information</label>
                      <div class="p-3 border border-2 rounded-3 bg-white" style="min-height: 50px;">
                        <ngx-stripe-card
                          [options]="cardOptions"
                          [elementsOptions]="elementsOptions"
                        ></ngx-stripe-card>
                      </div>
                      <small class="text-muted d-flex align-items-center gap-1 mt-2">
                        <i class="pi pi-info-circle"></i>
                        Test: 4242 4242 4242 4242 | Exp: Any future | CVC: Any 3 digits
                      </small>
                    </div>

                    <!-- Error -->
                    @if (paymentError()) {
                      <div class="alert alert-danger rounded-3 d-flex align-items-center gap-2">
                        <i class="pi pi-times-circle"></i>
                        {{ paymentError() }}
                      </div>
                    }

                    <!-- Shipping Summary -->
                    <div class="bg-light rounded-3 p-3 mb-4">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <p class="small fw-medium text-dark mb-1">Shipping to:</p>
                          <p class="small text-muted mb-0">{{ shippingForm.get('name')?.value }}</p>
                          <p class="small text-muted mb-0">{{ shippingForm.get('address')?.value }}</p>
                          <p class="small text-muted mb-0">{{ shippingForm.get('city')?.value }}, {{ shippingForm.get('country')?.value }} {{ shippingForm.get('zip')?.value }}</p>
                        </div>
                        <button class="btn btn-link text-primary p-0" (click)="goBack()">Edit</button>
                      </div>
                    </div>

                    <div class="d-flex justify-content-between mt-4">
                      <button class="btn-secondary d-inline-flex align-items-center gap-2" (click)="goBack()">
                        <i class="pi pi-arrow-left"></i>
                        Back
                      </button>
                      <button class="btn-primary d-inline-flex align-items-center gap-2"
                              [disabled]="isProcessing()"
                              (click)="processPayment()">
                        @if (isProcessing()) {
                          <span class="spinner-border spinner-border-sm"></span>
                          Processing...
                        } @else {
                          <i class="pi pi-lock"></i>
                          Pay {{ totalPrice() | currency }}
                        }
                      </button>
                    </div>
                  </div>
                }

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CheckoutWizardComponent implements OnInit {
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private stripeService = inject(StripeService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  currentStep = signal(1);
  isLoading = signal(false);
  isProcessing = signal(false);
  paymentError = signal<string | null>(null);
  orderId = signal<number>(0);

  cartItems = signal<any[]>([]);
  totalPrice = signal(0);

  shippingForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
    zip: ['', Validators.required],
    address: ['', Validators.required]
  });

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#667eea',
        color: '#1f2937',
        fontWeight: '500',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: '16px',
        '::placeholder': { color: '#9ca3af' }
      },
      invalid: { iconColor: '#ef4444', color: '#ef4444' }
    },
    hidePostalCode: true
  };

  elementsOptions: StripeElementsOptions = { locale: 'en' };

  ngOnInit(): void {
    // Load cart items from cart$ observable
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(cart => {
      if (cart) {
        this.cartItems.set(cart.items.map(item => ({
          productId: item.productId,
          name: item.productName,
          imageUrl: item.productImageUrl,
          price: item.discountedPrice,
          quantity: item.quantity
        })));
      }
    });

    this.cartService.totalPrice$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      this.totalPrice.set(total || 0);
    });

    // Load cart
    this.cartService.loadCart();

    // Prefill form if user has saved details
    const savedDetails = this.ordersService.getUserOrderDetails();
    if (savedDetails) {
      this.shippingForm.patchValue({
        name: savedDetails.name || '',
        email: savedDetails.email || '',
        phone: savedDetails.phone || '',
        country: savedDetails.country || '',
        city: savedDetails.city || '',
        zip: savedDetails.zip || '',
        address: savedDetails.apartment || ''
      });
    }
  }

  proceedToPayment(): void {
    if (this.shippingForm.invalid) return;

    this.isLoading.set(true);

    const orderRequest = {
      shippingAddress1: this.shippingForm.get('address')?.value,
      shippingAddress2: '',
      city: this.shippingForm.get('city')?.value,
      zipCode: this.shippingForm.get('zip')?.value,
      country: this.shippingForm.get('country')?.value,
      phone: this.shippingForm.get('phone')?.value
    };

    this.ordersService.createOrder(orderRequest).subscribe({
      next: (order: any) => {
        this.orderId.set(order.id || order.orderId);
        this.isLoading.set(false);
        this.currentStep.set(2);

        this.messageService.add({
          severity: 'success',
          summary: 'Order Created',
          detail: 'Please complete payment to confirm your order'
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Failed to create order'
        });
      }
    });
  }

  processPayment(): void {
    this.isProcessing.set(true);
    this.paymentError.set(null);

    // Create payment intent
    this.http.post<{ clientSecret: string }>(`${environment.apiUrl}/Payments/create-payment-intent`, {
      amount: this.totalPrice(),
      orderId: this.orderId(),
      description: `Order #${this.orderId()}`
    }).pipe(
      switchMap(res => {
        return this.stripeService.confirmCardPayment(res.clientSecret, {
          payment_method: {
            card: this.card.element,
            billing_details: {
              name: this.shippingForm.get('name')?.value,
              email: this.shippingForm.get('email')?.value,
              phone: this.shippingForm.get('phone')?.value,
              address: {
                city: this.shippingForm.get('city')?.value,
                country: this.shippingForm.get('country')?.value,
                postal_code: this.shippingForm.get('zip')?.value,
                line1: this.shippingForm.get('address')?.value
              }
            }
          }
        });
      })
    ).subscribe({
      next: (result) => {
        this.isProcessing.set(false);
        if (result.error) {
          this.paymentError.set(result.error.message || 'Payment failed');
        } else if (result.paymentIntent?.status === 'succeeded') {
          // Clear cart on success
          this.cartService.clearCart().subscribe();

          this.messageService.add({
            severity: 'success',
            summary: 'Payment Successful!',
            detail: 'Thank you for your purchase'
          });

          setTimeout(() => {
            this.router.navigate(['/order-confirmation', this.orderId()]);
          }, 1500);
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.paymentError.set(err.error?.message || 'Payment failed. Please try again.');
      }
    });
  }

  goBack(): void {
    this.currentStep.set(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
