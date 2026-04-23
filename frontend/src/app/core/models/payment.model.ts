/**
 * Payment domain models
 * Backend returns camelCase, so we use camelCase here
 */

export interface Payment {
  id?: number;
  userId: number;
  courseId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  userName?: string;
  courseTitle?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  STRIPE = 'STRIPE'
}

export interface BatchPaymentRequest {
  user_id: number;
  user_name?: string;
  user_email?: string;
  courses: Array<{
    course_id: number;
    course_title?: string;
    amount: number;
  }>;
  total_amount: number;
  payment_method: string;
  currency: string;
  payment_status?: string; // Optional: defaults to COMPLETED on backend
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  payment?: Payment;
  transactionId?: string;
  data?: {
    transaction_id?: string;
    total_amount?: number;
    payment_count?: number;
    payments?: Payment[];
  };
}
