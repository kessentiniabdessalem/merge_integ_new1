/**
 * Transaction domain models
 * These models represent the data structure for the Transaction microservice
 */

export interface Transaction {
  id?: number;
  transactionId: string;
  userId: number;
  paymentId: number;
  amount: number;
  currency: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED'
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
}
