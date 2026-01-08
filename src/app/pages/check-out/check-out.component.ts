import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedRoutesHeader } from '../../shared/components/shared-routes-header/shared-routes-header.component';
import { Router, RouterModule } from '@angular/router';
import { OrderSummaryComponent } from '../../components/orders/oreder-summary/order-summary.component';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Cart, CartItem } from '../../models/cart.model';
import { Order, OrderItem } from '../../models/order.model';
import { AuthService } from '../../services/auth/auth.service';
import { OrdersService } from '../../services/orders/orders.service';
import { CheckboxModule } from 'primeng/checkbox';
import { CartService } from '../../services/orders/cart.service';
import { finalize, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { LoadingService } from '../../shared/components/loading/loading.service';

import { MessageService } from 'primeng/api';

import { ToastModule } from 'primeng/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedRoutesHeader,
    RouterModule,
    OrderSummaryComponent,
    DropdownModule,
    CheckboxModule,
    LoadingComponent,
    ToastModule,
    TranslateModule,
  ],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.scss',
  providers: [MessageService],
})
export class CheckOutComponent implements OnInit, OnDestroy {
  totalPrice: number;
  form;
  isSubmitted;
  orderItems: OrderItem[] = [];
  cartS = inject(CartService);
  translate = inject(TranslateService);

  fb = inject(NonNullableFormBuilder);
  auth = inject(AuthService);
  ordersService = inject(OrdersService);
  loadingService = inject(LoadingService);
  messageService = inject(MessageService);
  userId: any;
  router = inject(Router);
  endSubs$ = new Subject<any>();
  ngOnInit(): void {
    this.userId = this.auth.user.getValue()?.id;
    this._initCheckoutForm();
    this.cartS.totalPrice$
      .pipe(takeUntil(this.endSubs$))
      .subscribe((totalPrice) => (this.totalPrice = totalPrice));
    this.ordersService.getOrders();
  }

  private _initCheckoutForm() {
    let initForm = {
      name: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      zip: '',
      apartment: '',
      checked: false,
    };

    const filledForm = this.ordersService.getUserOrderDetails();
    if (filledForm != null) {
      initForm.name = filledForm.name;
      initForm.email = filledForm.email;
      initForm.phone = filledForm.phone;
      initForm.city = filledForm.city;
      initForm.country = filledForm.country;
      initForm.zip = filledForm.zip;
      initForm.apartment = filledForm.apartment;
      initForm.checked = filledForm.checked;
    }

    this.form = this.fb.group({
      name: [initForm.name, Validators.required],
      email: [initForm.email, [Validators.email, Validators.required]],
      phone: [initForm.phone, Validators.required],
      city: [initForm.city, Validators.required],
      country: [initForm.country, Validators.required],
      zip: [initForm.zip, Validators.required],
      apartment: [initForm.apartment, Validators.required],
      checked: [initForm.checked],
    });
  }

  get checkoutForm() {
    return this.form.controls;
  }



  placeOrder() {
    this.isSubmitted = true;
    if (this.form.invalid) {
      return;
    }

    const orderRequest = {
      shippingAddress1: this.checkoutForm['apartment'].value || 'Not provided',
      shippingAddress2: '',
      city: this.checkoutForm['city'].value,
      zipCode: this.checkoutForm['zip'].value,
      country: this.checkoutForm['country'].value,
      phone: String(this.checkoutForm['phone'].value)
    };

    this.loadingService
      .showLoadingUntilCompleted(
        this.ordersService.createOrder(orderRequest).pipe(
          switchMap(() => {
            this.cartS.clearCart().subscribe();
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 3000);
            return this.translate.get([
              'TOAST_MESSAGE.success',
              'TOAST_MESSAGE.orderPlacedSuccessfully',
            ]);
          }),

          tap((translations) => {
            this.messageService.add({
              severity: 'success',
              summary: translations['TOAST_MESSAGE.success'],
              detail: translations[
                'TOAST_MESSAGE.orderPlacedSuccessfully'
              ],
            });
          }),

          finalize(() => {
            this.isSubmitted = false;
          })
        )
      )
      .subscribe();
  }

  onCheckboxChange(event: any) {
    const order = this.form.value;
    if (
      order.name === '' ||
      order.phone === '' ||
      order.email === '' ||
      order.apartment === '' ||
      order.zip === '' ||
      order.country === '' ||
      order.city === ''
    ) {
      return;
    }
    this.ordersService.saveUserDetails(order);
  }

  ngOnDestroy(): void {
    this.endSubs$.next(null);
    this.endSubs$.complete();
  }
}
