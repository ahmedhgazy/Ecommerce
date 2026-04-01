import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
  ViewChild,
  ViewChildren,
  ElementRef,
  QueryList,
} from '@angular/core';
import { TagModule } from 'primeng/tag';
import { OrderStatus } from '../../../services/orders/orders.service';
import { FilterService } from 'primeng/api';
import { OrdersService } from '../../../services/orders/orders.service';
import { Observable } from 'rxjs';
import { Order } from '../../../services/orders/orders.service';
import { Table, TableModule } from 'primeng/table';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { LoadingService } from '../../../core/services/loading.service';
import { DialogModule } from 'primeng/dialog';
import { OrderDetailsComponent } from './order-details/order-details.component';

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
    TagModule,
    DialogModule,
    OrderDetailsComponent
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

  // Make OrderStatus available in template
  OrderStatus = OrderStatus;

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

  ordersS = inject(OrdersService);
  filterService = inject(FilterService);
  router = inject(Router);
  Orders$: Observable<Order[]> = this.ordersS.getOrders();
  @ViewChild('dt1') dt1: Table | undefined;
  selectedOrder: Order | null = null;
  isMobile: boolean = false;

  displayedColumns: string[] = [
    'product',
    'orderItems',
    'shippingAddress1',
    'dateOrdered',
    'status',
    'totalPrice'
  ];

  displayDetails = false;

  viewDetails(order: Order) {
    this.selectedOrder = order;
    this.displayDetails = true;
  }


  private resizeBoundObj = this.checkScreenSize.bind(this);

  ngOnInit(): void {
    this.ordersS.getOrders().subscribe((res) => {
    });
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeBoundObj);
  }

  getSeverity(status: OrderStatus): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status) {
      case OrderStatus.Pending:
        return 'warning';
      case OrderStatus.Processing:
        return 'info';
      case OrderStatus.Shipped:
        return 'secondary';
      case OrderStatus.Delivered:
        return 'success';
      case OrderStatus.Cancelled:
        return 'danger';
      default:
        return 'info';
    }
  }


  getStatusText(status: OrderStatus): string {
    return this.ordersS.getStatusString(status);
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

  @ViewChildren('rowElement', { read: ElementRef }) rowElements!: QueryList<ElementRef>;

  observer: IntersectionObserver | undefined;

  ngAfterViewInit() {
    this.setupObserver();
    this.rowElements.changes.subscribe(() => {
      this.setupObserver();
    });
  }

  setupObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible-row');
          entry.target.classList.remove('hidden-row');
          this.observer?.unobserve(entry.target); // Animate once
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px'
    });

    this.rowElements.forEach((el) => {
      el.nativeElement.classList.add('hidden-row'); // Start hidden
      this.observer?.observe(el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeBoundObj);
    this.observer?.disconnect();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    this.smallScreen = window.innerWidth <= 768;
  }

  get inOrders(): boolean {
    return this.router.url.includes('/profile/orders');
  }
}
