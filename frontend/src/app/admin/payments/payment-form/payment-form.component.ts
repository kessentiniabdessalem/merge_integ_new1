import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../../core/services/payment.service';
import { Payment } from '../../../core/models/payment.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
  standalone: false,
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup;
  isEditing = false;
  isLoading = false;
  error: string = '';
  paymentId: number | null = null;

  paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'stripe', label: 'Stripe' }
  ];

  paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  currencies = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' }
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      userId: ['', [Validators.required, Validators.min(1)]],
      courseId: ['', [Validators.required, Validators.min(1)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      paymentMethod: ['credit_card', Validators.required],
      paymentStatus: ['pending', Validators.required],
      transactionId: ['', Validators.required],
      paymentDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.paymentId = parseInt(id);
      this.isEditing = true;
      this.loadPayment(this.paymentId);
    }
  }

  loadPayment(id: number): void {
    this.isLoading = true;
    this.paymentService.getPaymentById(id).subscribe({
      next: (payment) => {
        this.paymentForm.patchValue({
          userId: payment.userId,
          courseId: payment.courseId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
          transactionId: payment.transactionId,
          paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payment: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Payment form submitted!');
    console.log('Form valid:', this.paymentForm.valid);
    console.log('Form values:', this.paymentForm.value);
    
    if (this.paymentForm.invalid) {
      console.log('Form is invalid, marking fields as touched');
      this.markFormGroupTouched(this.paymentForm);
      return;
    }

    console.log('Form is valid, proceeding with payment submission...');
    this.isLoading = true;
    this.error = '';

    const formData = this.paymentForm.value;
    console.log('Form data to submit:', formData);

    if (this.isEditing && this.paymentId) {
      // Update existing payment
      console.log('Updating payment with ID:', this.paymentId);
      this.paymentService.updatePayment(this.paymentId, formData).subscribe({
        next: (response) => {
          console.log('Payment updated successfully:', response);
          this.router.navigate(['/admin/payments']);
        },
        error: (err) => {
          console.error('Update payment error:', err);
          this.error = 'Failed to update payment: ' + err.message;
          this.isLoading = false;
        }
      });
    } else {
      // Create new payment
      console.log('Creating new payment...');
      this.paymentService.createPayment(formData).subscribe({
        next: (response) => {
          console.log('Payment created successfully:', response);
          this.router.navigate(['/admin/payments']);
        },
        error: (err) => {
          console.error('Create payment error:', err);
          this.error = 'Failed to create payment: ' + err.message;
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/payments']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['min']) return fieldName === 'amount' ? 'Amount must be greater than 0' : 'Value must be at least 1';
    }
    return '';
  }
}
