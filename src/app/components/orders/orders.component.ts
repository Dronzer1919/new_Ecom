import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService, OrderSummary } from '../../services/payment.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: OrderSummary[] = [];
  loading: boolean = true;

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orders = this.paymentService.getOrderHistory();
    this.loading = false;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-success';
      case 'pending': return 'text-warning';
      case 'cancelled': return 'text-danger';
      default: return 'text-info';
    }
  }
}
