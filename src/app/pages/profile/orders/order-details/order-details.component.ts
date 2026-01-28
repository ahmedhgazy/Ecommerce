import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrdersService, OrderStatus } from '../../../../services/orders/orders.service';
import { TranslateModule } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, TagModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {
  @Input() order: Order | null = null;
  ordersService = inject(OrdersService);

  getBackgroundColor(index: number): string {
    const colors = ['red', 'green', 'blue', 'orange', 'purple', 'pink', 'yellow'];
    return colors[index % colors.length];
  }

  getStatusText(status: OrderStatus): string {
    return this.ordersService.getStatusString(status);
  }
}
