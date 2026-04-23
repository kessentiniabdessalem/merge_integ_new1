import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment-management-simple',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="payment-management-container">
      <div class="dashboard-header">
        <h1>Payment Management</h1>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="refreshPayments()">
            <i class="icon-refresh">↻</i>
            Refresh
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">\${{ totalRevenue.toFixed(2) }}</div>
          <div class="stat-label">Total Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalPayments }}</div>
          <div class="stat-label">Total Payments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ successRate.toFixed(1) }}%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>

      <div class="filters-section">
        <h2>Filters & Search</h2>
        <form [formGroup]="filterForm" class="filter-form">
          <div class="filter-row">
            <div class="form-group">
              <label for="search">Search</label>
              <input type="text" id="search" formControlName="search" 
                     placeholder="Search by ID, transaction, user...">
            </div>
            
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" formControlName="status">
                <option value="">All</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="currency">Currency</label>
              <select id="currency" formControlName="currency">
                <option value="">All</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="TND">TND</option>
              </select>
            </div>
          </div>
          
          <div class="filter-row">
            <div class="form-group">
              <label for="fromDate">From Date</label>
              <input type="date" id="fromDate" formControlName="fromDate">
            </div>
            
            <div class="form-group">
              <label for="toDate">To Date</label>
              <input type="date" id="toDate" formControlName="toDate">
            </div>
            
            <div class="filter-actions">
              <button type="button" class="btn btn-primary" (click)="applyFilters()">
                Apply Filters
              </button>
              <button type="button" class="btn btn-secondary" (click)="resetFilters()">
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="table-section">
        <h2>Payment Transactions</h2>
        <div class="table-container">
          <div class="loading" *ngIf="isLoading">
            <div class="spinner"></div>
            <p>Loading payments...</p>
          </div>

          <div class="no-data" *ngIf="payments.length === 0 && !isLoading">
            <div class="no-data-icon">📄</div>
            <p>No payments found</p>
          </div>

          <table class="payments-table" *ngIf="payments.length > 0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Transaction ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let payment of payments">
                <td>{{ payment.id }}</td>
                <td>
                  <span class="transaction-id">{{ payment.transactionId }}</span>
                </td>
                <td>{{ payment.userId }}</td>
                <td>
                  <span class="amount">\${{ payment.amount }}</span>
                </td>
                <td>{{ payment.currency }}</td>
                <td>
                  <span class="method-badge" [ngClass]="getPaymentMethodClass(payment.paymentMethod)">
                    {{ getPaymentMethodLabel(payment.paymentMethod) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="getStatusClass(payment.paymentStatus)">
                    {{ payment.paymentStatus }}
                  </span>
                </td>
                <td>{{ payment.paymentDate | date:'medium' }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-icon" (click)="viewPayment(payment)" title="View Details">
                      👁
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" *ngIf="payments.length > 0">
          <button class="btn btn-secondary" (click)="previousPage()" [disabled]="currentPage === 0">
            Previous
          </button>
          <span class="page-info">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
          <button class="btn btn-secondary" (click)="nextPage()" [disabled]="currentPage >= totalPages - 1">
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-management-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e0e0e0;
    }

    .dashboard-header h1 {
      margin: 0;
      color: #333;
      font-size: 28px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 14px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .filters-section {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 30px;
    }

    .filters-section h2 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 20px;
      font-weight: 500;
    }

    .filter-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .filter-row {
      display: flex;
      gap: 16px;
      align-items: end;
      flex-wrap: wrap;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }

    .form-group input,
    .form-group select {
      padding: 10px 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
      margin-left: auto;
    }

    .table-section {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .table-section h2 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 20px;
      font-weight: 500;
    }

    .table-container {
      position: relative;
      min-height: 400px;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .no-data-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .payments-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .payments-table th,
    .payments-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .payments-table th {
      background: #f8f9fa;
      font-weight: 600;
      color: #333;
      position: sticky;
      top: 0;
    }

    .payments-table tr:hover {
      background: #f8f9fa;
    }

    .transaction-id {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .amount {
      font-weight: bold;
      color: #28a745;
    }

    .method-badge,
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .method-credit-card {
      background: #e3f2fd;
      color: #1976d2;
    }

    .method-paypal {
      background: #fff3e0;
      color: #f57c00;
    }

    .method-bank-transfer {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .status-completed {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .status-pending {
      background: #fff3e0;
      color: #f57c00;
    }

    .status-failed {
      background: #ffebee;
      color: #c62828;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .btn-icon {
      background: none;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #f0f0f0;
      border-color: #999;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .page-info {
      color: #666;
      font-weight: 500;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .payment-management-container {
        padding: 16px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-actions {
        justify-content: center;
        margin-top: 16px;
      }

      .payments-table {
        font-size: 12px;
      }

      .payments-table th,
      .payments-table td {
        padding: 8px;
      }

      .action-buttons {
        flex-direction: column;
        gap: 2px;
      }
    }
  `]
})
export class PaymentManagementSimpleComponent implements OnInit, OnDestroy {
  payments: Payment[] = [];
  isLoading = false;
  currentPage = 0;
  pageSize = 25;
  totalPayments = 0;
  
  // Stats
  totalRevenue = 0;
  successRate = 0;
  
  filterForm: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private paymentService: PaymentService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      currency: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  ngOnInit(): void {
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalPages(): number {
    return Math.ceil(this.totalPayments / this.pageSize);
  }

  loadPayments(): void {
    this.isLoading = true;
    this.paymentService.getPayments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (payments) => {
          console.log('Raw payments from backend:', JSON.stringify(payments, null, 2));
          
          // Calculate stats first with all payments
          this.calculateStats(payments);
          
          // Then filter for display
          this.payments = this.filterPayments(payments);
          
          this.isLoading = false;
          console.log('Loaded payments:', payments);
          console.log('Stats - Revenue:', this.totalRevenue, 'Total:', this.totalPayments, 'Success Rate:', this.successRate);
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          alert('Failed to load payments');
          this.isLoading = false;
        }
      });
  }

  calculateStats(payments: Payment[]): void {
    console.log('Calculating stats for payments:', payments);
    
    // Calculate total revenue from completed payments
    const completedPayments = payments.filter(p => {
      const status = p.paymentStatus?.toUpperCase();
      console.log('Payment', p.id, 'status:', p.paymentStatus, 'uppercase:', status);
      return status === 'COMPLETED';
    });
    
    console.log('Completed payments:', completedPayments);
    
    this.totalRevenue = completedPayments.reduce((sum, p) => {
      const amount = parseFloat(p.amount?.toString() || '0');
      console.log('Adding amount:', amount, 'from payment', p.id);
      return sum + amount;
    }, 0);
    
    // Total payments count
    this.totalPayments = payments.length;
    
    // Calculate success rate
    this.successRate = payments.length > 0 
      ? (completedPayments.length / payments.length) * 100 
      : 0;
    
    console.log('Final stats - Revenue:', this.totalRevenue, 'Total:', this.totalPayments, 'Success Rate:', this.successRate);
  }

  filterPayments(payments: Payment[]): Payment[] {
    const filters = this.filterForm.value;
    
    return payments.filter(payment => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          payment?.id?.toString().includes(searchLower) ||
          payment.transactionId?.toLowerCase().includes(searchLower) ||
          payment?.userId?.toString().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      // Status filter
      if (filters.status && payment.paymentStatus !== filters.status) {
        return false;
      }
      
      // Currency filter
      if (filters.currency && payment.currency !== filters.currency) {
        return false;
      }
      
      // Date filters
      if (filters.fromDate && payment.paymentDate) {
        try {
          if (new Date(payment.paymentDate) < new Date(filters.fromDate)) {
            return false;
          }
        } catch (e) {
          // Invalid date format, skip filter
        }
      }
      
      if (filters.toDate && payment.paymentDate) {
        try {
          if (new Date(payment.paymentDate) > new Date(filters.toDate)) {
            return false;
          }
        } catch (e) {
          // Invalid date format, skip filter
        }
      }
      
      return true;
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadPayments();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadPayments();
  }

  refreshPayments(): void {
    this.loadPayments();
  }

  viewPayment(payment: Payment): void {
    const details = `
Payment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${payment.id}
Transaction: ${payment.transactionId}
User ID: ${payment.userId}
Amount: ${payment.amount} ${payment.currency}
Status: ${payment.paymentStatus}
Method: ${payment.paymentMethod}
Date: ${payment.paymentDate}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
    alert(details);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPayments();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPayments();
    }
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  getPaymentMethodClass(method: string): string {
    if (!method) return '';
    switch (method.toLowerCase()) {
      case 'credit_card': return 'method-credit-card';
      case 'paypal': return 'method-paypal';
      case 'bank_transfer': return 'method-bank-transfer';
      default: return '';
    }
  }

  getPaymentMethodLabel(method: string): string {
    if (!method) return 'N/A';
    switch (method.toLowerCase()) {
      case 'credit_card': return 'Credit Card';
      case 'paypal': return 'PayPal';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  }
}
