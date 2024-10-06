import { CommonModule } from '@angular/common';
import {
    Component,
    HostListener,
    inject,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { OrdersService } from '../../../services/orders/orders.service';
import { LoadingService } from '../../../shared/components/loading/loading.service';
import { Order } from '../../../models/order.model';
import { ButtonModule } from 'primeng/button';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { FilterService } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        TableModule,
        CommonModule,
        InputIconModule,
        IconFieldModule,
        ButtonModule,
        LoadingComponent,
        TranslateModule,
    ],

    templateUrl: './orders.component.html',
    styleUrl: './orders.component.scss',
    providers: [FilterService],
})
export class OrdersComponent implements OnInit {
    orderItemsStyleColors = [
        'red',
        'green',
        'blue',
        'orange',
        'purple',
        'pink',
        'yellow',
    ];

    getBackgroundColor(index: number): string {
        return this.orderItemsStyleColors[
            index % this.orderItemsStyleColors.length
        ];
    }

    smallScreen = false;

    @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
        this.checkScreenSize();
    }

    loadingS = inject(LoadingService);
    ordersS = inject(OrdersService);
    LoadingS = inject(LoadingService);
    filterService = inject(FilterService);
    router = inject(Router);
    Orders$: Observable<Order[]> = this.loadingS.showLoadingUntilCompleted(
        this.ordersS.getOrders()
    );
    @ViewChild('dt1') dt1: Table | undefined;
    selectedOrder: Order | null = null;
    isMobile: boolean = false;

    displayedColumns: string[] = [
        'product',
        'orderItems',
        'shippingAddress1',
        'dateOrdered',
    ];

    ngOnInit(): void {
        this.ordersS.getOrders().subscribe((res) => {
        });
        this.checkScreenSize();
        window.addEventListener('resize', this.checkScreenSize.bind(this));
    }

    onGlobalFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dt1?.filterGlobal(filterValue, 'contains');
    }

    customFilter(value: any, filter: string): boolean {
        if (filter === undefined || filter === null || filter.trim() === '') {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        filter = filter.toLowerCase();

        if (typeof value === 'string') {
            return value.toLowerCase().indexOf(filter) !== -1;
        } else if (typeof value === 'number') {
            return value.toString().toLowerCase().indexOf(filter) !== -1;
        } else if (value instanceof Date) {
            return value.toDateString().toLowerCase().indexOf(filter) !== -1;
        } else if (Array.isArray(value)) {
            return value.some((item) => this.customFilter(item, filter));
        } else if (typeof value === 'object') {
            return Object.values(value).some((item) =>
                this.customFilter(item, filter)
            );
        }

        return false;
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }

    checkScreenSize(): void {
        this.isMobile = window.innerWidth < 768;
        this.smallScreen = window.innerWidth <= 768;
    }

    get inOrders(): boolean {
        return this.router.url.includes('/profile/orders');
    }
}
