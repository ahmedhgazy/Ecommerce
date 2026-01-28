import { Component, inject, signal, ViewChild, OnInit, HostListener } from '@angular/core';
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
import { PaymentsService } from '../../services/payments/payments.service';
import { CanComponentDeactivate } from '../../guards/unsaved-changes.guard';


interface PaymentContext {
  clientSecret?: string;          // New flow: pre-created PaymentIntent
  paymentIntentId?: string;
  orderId?: number;               // Legacy flow only
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
  templateUrl: `./payment.component.html`,
  styleUrl: './payment.component.scss',
})
export class PaymentComponent implements OnInit, CanComponentDeactivate {
  @ViewChild(StripeCardComponent) card!: StripeCardComponent;

  private http = inject(HttpClient);
  private stripeService = inject(StripeService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private cartService = inject(CartService);
  private paymentsService = inject(PaymentsService);

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

  // Track if payment was completed successfully
  private paymentCompleted = false;

  paymentContext = signal<PaymentContext>({
    amount: 0,
    items: [],
    shippingAddress: '',
    customerName: '',
    customerEmail: ''
  });

  ngOnInit(): void {
    // Get payment context from browser history state
    const state = history.state as any;

    if (state?.amount) {
      this.amount.set(state.amount);
      this.paymentContext.set({
        clientSecret: state.clientSecret,
        paymentIntentId: state.paymentIntentId,
        orderId: state.orderId,
        amount: state.amount,
        items: state.items || [
          { name: 'Order Items', quantity: 1, price: state.amount }
        ],
        shippingAddress: state.shippingAddress || '',
        customerName: state.customerName || 'Customer',
        customerEmail: state.customerEmail || ''
      });
    } else {
      // No payment context - redirect to cart
      this.messageService.add({
        severity: 'warn',
        summary: 'Session Expired',
        detail: 'Please start checkout again'
      });
      setTimeout(() => this.router.navigate(['/cart']), 2000);
    }
  }

  /**
   * CanDeactivate implementation - shows confirmation if payment is in progress
   */
  canDeactivate(): boolean {
    // Allow navigation if payment was completed
    if (this.paymentCompleted) {
      return true;
    }

    // Check if user has payment context (is in the middle of checkout)
    const hasPaymentContext = this.amount() > 0 || this.paymentContext().clientSecret;

    if (hasPaymentContext && !this.processing()) {
      return confirm('You are in the middle of checkout. Are you sure you want to leave? Your payment will not be completed.');
    }

    // Don't allow leaving while payment is actively processing
    if (this.processing()) {
      alert('Payment is being processed. Please wait for it to complete.');
      return false;
    }

    return true;
  }

  /**
   * Handle browser refresh/close - show native browser warning
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    const hasPaymentContext = this.amount() > 0;

    if (hasPaymentContext && !this.paymentCompleted) {
      $event.preventDefault();
      $event.returnValue = '';
    }
  }

  pay() {
    this.processing.set(true);
    this.error.set(null);

    const context = this.paymentContext();

    // Check if we have a pre-created clientSecret (new Payment-First flow)
    if (context.clientSecret) {
      this.processPaymentWithClientSecret(context.clientSecret);
    } else if (context.orderId) {
      // Legacy flow: create payment intent with orderId
      this.processPaymentLegacy(context.orderId);
    } else {
      this.error.set('Invalid payment session. Please try again.');
      this.processing.set(false);
    }
  }

  /**
   * NEW PAYMENT-FIRST FLOW:
   * ClientSecret was already created during checkout.
   * Just confirm the payment - order will be created by webhook.
   */
  private processPaymentWithClientSecret(clientSecret: string) {
    this.stripeService.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.card.element,
        billing_details: {
          name: this.paymentContext().customerName,
          email: this.paymentContext().customerEmail
        },
      },
    }).subscribe({
      next: (result) => {
        this.processing.set(false);
        if (result.error) {
          this.error.set(result.error.message || 'Payment failed. Please try again.');
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
        this.processing.set(false);
        this.error.set(err.error?.message || 'An unexpected error occurred. Please try again.');
      }
    });
  }

  /**
   * LEGACY FLOW:
   * Order was already created, create PaymentIntent now.
   */
  private processPaymentLegacy(orderId: number) {
    this.paymentsService.createPaymentIntent(
      this.amount(),
      orderId,
      `Order #${orderId}`
    ).pipe(
      switchMap(res => {
        return this.stripeService.confirmCardPayment(res.clientSecret, {
          payment_method: {
            card: this.card.element,
            billing_details: {
              name: this.paymentContext().customerName,
              email: this.paymentContext().customerEmail
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
          this.paymentsService.confirmPayment(result.paymentIntent.id).pipe(
            switchMap(() => this.cartService.clearCart())
          ).subscribe({
            next: () => this.showSuccessAndRedirect(),
            error: () => this.showSuccessAndRedirect()
          });
        }
      },
      error: (err) => {
        this.processing.set(false);
        this.error.set(err.error?.message || 'An unexpected error occurred. Please try again.');
      }
    });
  }

  private showSuccessAndRedirect() {
    this.paymentCompleted = true; // Mark as complete to skip confirmation dialog
    this.messageService.add({
      severity: 'success',
      summary: 'Payment Successful!',
      detail: 'Thank you for your purchase. Your order is being processed.'
    });
    setTimeout(() => {
      // Navigate to orders page since we don't have orderId in new flow
      this.router.navigate(['/profile/orders']);
    }, 1500);
  }
}

