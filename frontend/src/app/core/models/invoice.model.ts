/**
 * Invoice domain models
 * These models represent the data structure for the Invoice microservice
 */

export interface Invoice {
  id?: number;
  invoiceNumber: string;
  userId: number;
  paymentId: number;
  amount: number;
  currency: string;
  issueDate: string;
  dueDate?: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  courseId?: number;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  invoice?: Invoice;
}
