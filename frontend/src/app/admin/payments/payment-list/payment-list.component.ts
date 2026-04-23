import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
  standalone: false,
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  isLoading = false;
  error: string = '';
  private currentDate = new Date().toISOString(); // Cache current date

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.error = '';
    
    this.paymentService.getPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payments: ' + err.message;
        this.isLoading = false;
        console.error('Error loading payments:', err);
      }
    });
  }

  editPayment(payment: Payment): void {
    this.router.navigate(['/admin/payments', payment.id, 'edit']);
  }

  deletePayment(payment: Payment): void {
    if (confirm(`Are you sure you want to delete payment from ${payment.userName || 'User ' + payment.userId}?`)) {
      this.paymentService.deletePayment(payment.id!).subscribe({
        next: () => {
          this.loadPayments(); // Reload the list
        },
        error: (err) => {
          this.error = 'Failed to delete payment: ' + err.message;
          console.error('Error deleting payment:', err);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    // Handle missing or null status - treat as completed
    if (!status) {
      return 'bg-success';
    }
    
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning';
      case 'FAILED':
        return 'bg-danger';
      case 'REFUNDED':
        return 'bg-info';
      case 'CANCELLED':
        return 'bg-secondary';
      default:
        return 'bg-success'; // Default to success for unknown status
    }
  }

  getStatusLabel(status: string): string {
    // Handle missing or null status - treat as completed
    if (!status) {
      return 'COMPLETED';
    }
    return status.toUpperCase();
  }

  getPaymentMethodLabel(method: string): string {
    // If method is null/empty, show "Not Specified" instead of defaulting to Credit Card
    if (!method) {
      return 'Not Specified';
    }
    
    // Convert snake_case to Title Case
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getPaymentDate(payment: Payment): string {
    // Use paymentDate if available, otherwise use createdAt, otherwise use cached current date
    if (payment.paymentDate) {
      return payment.paymentDate;
    }
    if (payment.createdAt) {
      return payment.createdAt;
    }
    // Return cached current date to avoid change detection issues
    return this.currentDate;
  }

  getPaymentMethodIcon(method: string): string {
    switch (method?.toUpperCase()) {
      case 'CREDIT_CARD':
        return 'bi-credit-card';
      case 'PAYPAL':
        return 'bi-paypal';
      case 'BANK_TRANSFER':
        return 'bi-bank';
      case 'STRIPE':
        return 'bi-credit-card-2-front';
      case 'DEBIT_CARD':
        return 'bi-credit-card';
      default:
        return 'bi-wallet2';
    }
  }
}
