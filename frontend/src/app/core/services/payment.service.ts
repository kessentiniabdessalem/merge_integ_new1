import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiGatewayService } from './api-gateway.service';
import { ApiConfig } from '../config/api.config';
import { Payment, BatchPaymentRequest, PaymentResponse } from '../models/payment.model';

/**
 * Payment Service - Communicates with Payment Microservice through API Gateway
 * All requests go through: http://localhost:8080/api/**
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly serviceName = 'payment' as const;

  constructor(private gateway: ApiGatewayService) {}

  /**
   * Get all payments with optional pagination
   */
  getPayments(page?: number, size?: number): Observable<Payment[]> {
    const params = page !== undefined && size !== undefined ? { page, size } : undefined;
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.payment.list,
      params
    ).pipe(map(response => response.data || response));
  }

  /**
   * Get payment by ID
   */
  getPaymentById(id: number): Observable<Payment> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.payment.getById(id)
    ).pipe(map(response => response.data || response));
  }

  /**
   * Get payments by user ID
   */
  getPaymentsByUser(userId: number): Observable<Payment[]> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.payment.getByUser(userId)
    ).pipe(map(response => response.data || response));
  }

  /**
   * Get payment by transaction ID
   */
  getPaymentByTransaction(transactionId: string): Observable<Payment> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.payment.getByTransaction(transactionId)
    ).pipe(map(response => response.data || response));
  }

  /**
   * Get total revenue
   */
  getTotalRevenue(): Observable<number> {
    return this.gateway.get<any>(
      this.serviceName,
      ApiConfig.endpoints.payment.totalRevenue
    ).pipe(map(response => response.data || response));
  }

  /**
   * Create a new payment
   */
  createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Observable<PaymentResponse> {
    return this.gateway.post<PaymentResponse>(
      this.serviceName,
      ApiConfig.endpoints.payment.create,
      payment
    );
  }

  /**
   * Create batch payments (multiple courses at once)
   */
  createBatchPayment(batchRequest: BatchPaymentRequest): Observable<PaymentResponse> {
    return this.gateway.post<PaymentResponse>(
      this.serviceName,
      ApiConfig.endpoints.payment.batchCreate,
      batchRequest
    );
  }

  /**
   * Update payment
   */
  updatePayment(id: number, payment: Partial<Payment>): Observable<PaymentResponse> {
    return this.gateway.put<PaymentResponse>(
      this.serviceName,
      ApiConfig.endpoints.payment.update(id),
      payment
    );
  }

  /**
   * Delete payment
   */
  deletePayment(id: number): Observable<void> {
    return this.gateway.delete<void>(
      this.serviceName,
      ApiConfig.endpoints.payment.delete(id)
    );
  }

  /**
   * Process cart checkout - creates batch payment for multiple courses
   */
  processCartCheckout(
    userId: number, 
    cartItems: { id: number; price: number; title?: string }[], 
    paymentMethod: string, 
    currency: string = 'USD',
    userEmail?: string,
    userName?: string
  ): Observable<PaymentResponse> {
    const batchRequest: BatchPaymentRequest = {
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      courses: cartItems.map(item => ({
        course_id: item.id,
        course_title: item.title,
        amount: item.price
      })),
      total_amount: cartItems.reduce((sum, item) => sum + item.price, 0),
      payment_method: paymentMethod,
      currency: currency,
      payment_status: 'COMPLETED' // Set status to COMPLETED instead of PENDING
    };

    console.log('🚀 Sending batch payment request:', JSON.stringify(batchRequest, null, 2));
    console.log('📍 Request URL:', `${ApiConfig.baseUrl}/api/payments/batch`);
    return this.createBatchPayment(batchRequest);
  }
}
