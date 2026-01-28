import { Component, inject, OnInit, signal, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StripeService, StripeCardComponent, NgxStripeModule } from 'ngx-stripe';
import { StripeCardElementOptions, StripeElementsOptions } from '@stripe/stripe-js';
import { switchMap, takeUntil, tap, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { CartService } from '../../services/orders/cart.service';
import { OrdersService } from '../../services/orders/orders.service';
import { AuthService } from '../../services/auth/auth.service';
import { PaymentsService, CheckoutItem } from '../../services/payments/payments.service';
import { CanComponentDeactivate } from '../../guards/unsaved-changes.guard';

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
  templateUrl:'./checkout-wizard.component.html',
  styleUrl:'./checkout-wizard.component.scss'
})
export class CheckoutWizardComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private authService = inject(AuthService);
  private stripeService = inject(StripeService);
  private messageService = inject(MessageService);
  private paymentsService = inject(PaymentsService);
  private destroy$ = new Subject<void>();

  currentStep = signal(1);
  isLoading = signal(false);
  isProcessing = signal(false);
  paymentError = signal<string | null>(null);

  // Payment-First flow: store clientSecret instead of orderId
  clientSecret = signal<string | null>(null);
  paymentIntentId = signal<string | null>(null);

  cartItems = signal<any[]>([]);
  totalPrice = signal(0);

  // Track if payment was completed successfully (to skip the confirmation dialog)
  private paymentCompleted = false;

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

  /**
   * CanDeactivate implementation - shows confirmation dialog if form has data
   */
  canDeactivate(): boolean {
    // Allow navigation if payment was completed
    if (this.paymentCompleted) {
      return true;
    }

    // Check if user has entered any data in the shipping form
    const formValues = this.shippingForm.value;
    const hasFormData = Object.values(formValues).some(value =>
      value !== null && value !== undefined && value !== ''
    );

    // Check if we're in the middle of the checkout process (step 2 = payment)
    const isProcessing = this.currentStep() === 2 || this.clientSecret() !== null;

    if (hasFormData || isProcessing) {
      return confirm('You have unsaved changes. Are you sure you want to leave this page? Your checkout progress will be lost.');
    }

    return true;
  }

  /**
   * Handle browser refresh/close - show native browser warning
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    const formValues = this.shippingForm.value;
    const hasFormData = Object.values(formValues).some(value =>
      value !== null && value !== undefined && value !== ''
    );
    const isProcessing = this.currentStep() === 2;

    if ((hasFormData || isProcessing) && !this.paymentCompleted) {
      $event.preventDefault();
      $event.returnValue = '';
    }
  }

  /**
   * PAYMENT-FIRST FLOW:
   * 1. Create a checkout session (PaymentIntent with metadata) - NO ORDER CREATED YET
   * 2. Move to payment step with clientSecret
   * 3. User completes payment
   * 4. Stripe webhook creates the order after payment succeeds
   */
  proceedToPayment(): void {
    if (this.shippingForm.invalid) return;

    const items = this.cartItems();
    if (items.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cart Empty',
        detail: 'Your cart is empty. Please add items before checkout.',
      });
      return;
    }

    this.isLoading.set(true);

    // Prepare checkout items with product details
    const checkoutItems: CheckoutItem[] = items.map(item => ({
      productId: item.productId,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price
    }));

    // Create checkout session request
    const checkoutRequest = {
      items: checkoutItems,
      shipping: {
        address1: this.shippingForm.get('address')?.value,
        address2: '',
        city: this.shippingForm.get('city')?.value,
        zipCode: String(this.shippingForm.get('zip')?.value),
        country: this.shippingForm.get('country')?.value,
        phone: String(this.shippingForm.get('phone')?.value)
      },
      customerEmail: this.shippingForm.get('email')?.value,
      customerName: this.shippingForm.get('name')?.value
    };

    // Save shipping details for future use
    this.ordersService.saveUserDetails({
      name: checkoutRequest.customerName,
      email: checkoutRequest.customerEmail,
      phone: checkoutRequest.shipping.phone,
      country: checkoutRequest.shipping.country,
      city: checkoutRequest.shipping.city,
      zip: checkoutRequest.shipping.zipCode,
      apartment: checkoutRequest.shipping.address1
    });

    this.paymentsService.createCheckoutSession(checkoutRequest).pipe(
      tap((response) => {
        // Store clientSecret for payment step
        this.clientSecret.set(response.clientSecret);
        this.paymentIntentId.set(response.paymentIntentId);

        // Move to payment step - NO ORDER CREATED YET
        this.currentStep.set(2);

        this.messageService.add({
          severity: 'info',
          summary: 'Ready for Payment',
          detail: 'Please enter your card details to complete the purchase'
        });
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe({
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Checkout Error',
          detail: err.error?.message || 'Failed to create checkout session. Please try again.',
        });
      }
    });
  }

  /**
   * PAYMENT-FIRST: Use the pre-created clientSecret to confirm payment.
   * Order will be created by webhook after payment succeeds.
   */
  processPayment(): void {
    const secret = this.clientSecret();
    if (!secret) {
      this.paymentError.set('Payment session expired. Please go back and try again.');
      return;
    }

    this.isProcessing.set(true);
    this.paymentError.set(null);

    this.stripeService.confirmCardPayment(secret, {
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
    }).subscribe({
      next: (result) => {
        this.isProcessing.set(false);
        if (result.error) {
          this.paymentError.set(result.error.message || 'Payment failed. Please try again.');
        } else if (result.paymentIntent?.status === 'succeeded') {
          // Payment succeeded!
          // For localhost development, manually confirm payment (webhooks may not work locally)
          this.paymentsService.confirmPayment(result.paymentIntent.id).pipe(
            switchMap(() => this.cartService.clearCart())
          ).subscribe({
            next: () => {
              this.showSuccessAndRedirect();
            },
            error: () => {
              // Even if confirmation fails, payment succeeded - still redirect
              this.showSuccessAndRedirect();
            }
          });
        }
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.paymentError.set(err.error?.message || 'Payment failed. Please try again.');
      }
    });
  }

  private showSuccessAndRedirect(): void {
    this.paymentCompleted = true; // Mark as complete to skip confirmation dialog
    this.messageService.add({
      severity: 'success',
      summary: 'Payment Successful!',
      detail: 'Thank you for your purchase. Your order is being processed.'
    });

    setTimeout(() => {
      // Navigate to order confirmation page with amount for display
      this.router.navigate(['/order-confirmation', 'success'], {
        state: { amount: this.totalPrice() }
      });
    }, 1500);
  }

  goBack(): void {
    this.currentStep.set(1);
    // Clear payment session - user will get a new one when they proceed again
    this.clientSecret.set(null);
    this.paymentIntentId.set(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

