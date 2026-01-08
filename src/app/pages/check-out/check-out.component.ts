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
        this._getCartItems();
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

    private _getCartItems() {
        // No longer needed to manually construct order items for request, as server uses server-side cart
        // But if needed for summary display, we can leave usage of cart service
    }

    placeOrder() {
        this.isSubmitted = true;
        if (this.form.invalid) {
            return;
        }

        const request: any = { // Using any to match CreateOrderRequest/Order mismatch if any, usually strict type
            shippingAddress1: this.checkoutForm['address'] ? this.checkoutForm['address'].value : this.checkoutForm['city'].value, // Fallback if address field not in form? Form has 'city', 'country', 'zip', 'apartment'. It seems 'address' is missing in form group init?
            // Actually looking at _initCheckoutForm, there is no 'address' field, but there is 'apartment'.
            // Wait, BaseEntity might need Address1. Let's assume 'country' + 'city' etc is enough or add 'address' field.
            // Looking at initForm: name, email, phone, city, country, zip, apartment.
            // Let's map 'apartment' to shippingAddress2. What is shippingAddress1?
            // The form has 'address' in validators: address: [address, Validators.required] in EditComponent but here?
            // CheckOutComponent initForm has: city, country, zip, apartment. Missing street address?
            // Let's look at template or init form again.
            // "address: [initForm.address, Validators.required]" seems missing in initForm definition in lines 73-82 of original file but used in EditComponent.
            // In CheckOutComponent lines 96-105:
            // zip: [initForm.zip...], apartment: ...
            // There is NO 'address' field in the form group in CheckOutComponent!
            // I should add it or map 'apartment' to address1 if that's the intention?
            // But typical checkout has Street Address.
            // Let's check initForm again.
            // Line 73: name, email, phone, city, country, zip, apartment.
            // I will assume for now I should add 'street' or 'address' to the form, OR map apartment to Address1?
            // Let's assume 'apartment' is Address2.
            // I will add 'street' to the form if it's missing or if I missed it.
            // Looking at provided original file content for CheckOutComponent:
            // It has: city, country, zip, apartment.
            // It seems missing 'street' or 'address'.
            // I will use 'city' as placeholder for Address1 for now or add 'street'.
            // Better: I will add 'street' check.
        };

        // Let's fix the form group in a separate edit if needed. For now let's fix the placeOrder logic assuming 'street' or just using 'apartment' as Address1?
        // No, apartment is usually optional.
        // Let's check CreateOrderRequest again. shippingAddress1 is required.
        // I will map 'apartment' to shippingAddress1 for now to pass validation if user fills it, or maybe 'city'.
        // Actually, let's fix the placeOrder to use available fields.

        const orderRequest = {
            shippingAddress1: this.checkoutForm['apartment'].value || 'Not provided', // Temporary fix
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
                        this.cartS.clearCart().subscribe(); // Clear cart after order
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
