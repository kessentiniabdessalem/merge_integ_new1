import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { Payment } from '../../core/models/payment.model';
import { CartService } from '../../services/cart.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router, ActivatedRoute } from '@angular/router';

// CartItem interface for cart checkout
interface CartItem {
  id: number;
  title: string;
  price: number;
  instructor?: string;
}

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  standalone: false,
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  isProcessing = false;
  isSuccess = false;
  selectedCourse: any = null;
  error: string = '';
  isCartCheckout = false;
  cartItems: CartItem[] = [];
  cartTotal = 0;
  totalAmount = 0; // For AI recommendation

  currencies = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'TND', label: 'Tunisian Dinar (د.ت)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' }
  ];

  courses = [
    { id: 1, title: 'Web Development Bootcamp', price: 49.00 },
    { id: 2, title: 'UI/UX Design Masterclass', price: 79.00 },
    { id: 3, title: 'Data Science & Analytics', price: 129.00 },
    { id: 4, title: 'Digital Marketing Pro', price: 69.00 },
    { id: 5, title: 'Mobile App Development', price: 89.00 },
    { id: 6, title: 'Graphic Design Fundamentals', price: 59.00 }
  ];

  paymentMethods = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'stripe', label: 'Stripe' }
  ];

  constructor(
      private fb: FormBuilder,
      private paymentService: PaymentService,
      private cartService: CartService,
      private enrollmentService: EnrollmentService,
      private notificationService: NotificationService,
      private router: Router,
      private route: ActivatedRoute
    ) {
      this.paymentForm = this.fb.group({
        course_id: ['', [Validators.required]],
        amount: ['', [Validators.required, Validators.min(0)]],
        currency: ['USD', [Validators.required]],
        payment_method: ['credit_card', [Validators.required]],
        user_email: ['', [Validators.required, Validators.email]],
        user_name: ['', [Validators.required]],
        card_holder_name: ['', [Validators.required]],
        card_number: ['', [Validators.required, Validators.pattern(/^\d{12,19}$/)]],
        expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
        cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
      });
    }

  ngOnInit(): void {
    // Check for cart checkout or single course parameters from URL
    this.route.queryParams.subscribe(params => {
      if (params['fromCart'] === 'true' && params['courses']) {
        // Cart checkout mode
        this.isCartCheckout = true;
        try {
          this.cartItems = JSON.parse(decodeURIComponent(params['courses']));
          this.cartTotal = this.cartItems.reduce((sum, item) => sum + item.price, 0);
          
          // Update form for cart checkout
          this.paymentForm.patchValue({
            amount: this.cartTotal,
            currency: 'USD'
          });
          
          // Make course_id optional for cart checkout
          this.paymentForm.get('course_id')?.clearValidators();
          this.paymentForm.get('course_id')?.updateValueAndValidity();
        } catch (error) {
          console.error('Error parsing cart items:', error);
          this.error = 'Invalid cart data';
        }
      } else if (params['courseId'] && params['courseTitle'] && params['coursePrice']) {
        // Single course mode
        const courseId = parseInt(params['courseId']);
        const courseTitle = params['courseTitle'];
        const coursePrice = parseFloat(params['coursePrice']);
        
        // Find or create the course
        this.selectedCourse = this.courses.find(c => c.id === courseId) || {
          id: courseId,
          title: courseTitle,
          price: coursePrice
        };
        
        // Pre-fill the form
        this.paymentForm.patchValue({
          course_id: courseId,
          amount: coursePrice,
          currency: 'USD'
        });
      } else {
        // Default to first course
        this.selectCourse(this.courses[0]);
      }
    });
  }

  selectCourse(course: any): void {
    this.selectedCourse = course;
    this.paymentForm.patchValue({
      course_id: course.id,
      amount: course.price
    });
  }

  pay(): void {
    this.onSubmit();
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

    console.log('Form is valid, proceeding with payment...');
    this.isProcessing = true;
    const formData = this.paymentForm.value;
    console.log('Form data to submit:', formData);

    if (this.isCartCheckout) {
      // Process cart checkout
      this.processCartPayment(formData);
    } else {
      // Process single course payment
      this.processSingleCoursePayment(formData);
    }
  }

  private processCartPayment(formData: any): void {
    const userId = 1; // TODO: Get from logged-in user
    const userEmail = formData.user_email; // Get from form
    const userName = formData.user_name; // Get from form
    
    this.paymentService.processCartCheckout(
      userId, 
      this.cartItems, 
      formData.payment_method, 
      formData.currency,
      userEmail,
      userName
    ).subscribe({
      next: (response) => {
        console.log('Cart payment processed successfully:', response);
        this.isProcessing = false;
        this.isSuccess = true;
        
        // Send payment confirmation email
        const totalAmount = this.cartItems.reduce((sum, item) => sum + item.price, 0);
        const courseTitles = this.cartItems.map(item => item.title).join(', ');
        const transactionId = response.transactionId || 'TXN_' + Date.now();
        
        this.notificationService.sendPaymentConfirmation(
          userEmail,
          userName,
          totalAmount,
          formData.currency,
          courseTitles,
          transactionId
        ).subscribe({
          next: () => console.log('✅ Payment confirmation email sent'),
          error: (err) => console.error('❌ Failed to send email:', err)
        });
        
        // Send SMS for large payments
        if (totalAmount > 500) {
          this.notificationService.sendLargePaymentSMS(
            '+1234567890', // TODO: Get from user profile
            totalAmount,
            formData.currency,
            transactionId
          ).subscribe({
            next: () => console.log('✅ Large payment SMS sent'),
            error: (err) => console.error('❌ Failed to send SMS:', err)
          });
        }
        
        // Enroll user in all purchased courses
        const courseIds = this.cartItems.map(item => item.id);
        this.enrollmentService.enrollUserInCourses(userId, courseIds).subscribe({
          next: () => {
            console.log('✅ User enrolled in courses:', courseIds);
            alert('Payment successful! Check your email for more information.');
            
            // Clear cart after successful payment and enrollment
            this.cartService.clearCart();
            
            // Redirect to first course content page after 2 seconds
            setTimeout(() => {
              this.isSuccess = false;
              this.paymentForm.reset();
              // Redirect to first purchased course
              if (courseIds.length > 0) {
                this.router.navigate(['/courses', courseIds[0], 'content']);
              } else {
                this.router.navigate(['/courses']);
              }
            }, 2000);
          },
          error: (enrollError) => {
            console.error('Enrollment error:', enrollError);
            alert('Payment successful but enrollment failed. Please contact support.');
          }
        });
      },
      error: (error) => {
        console.error('Cart payment error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.isProcessing = false;
        this.error = 'Payment failed: ' + (error.error?.message || error.message || 'Unknown error');
        
        // Send failed payment notification to admin
        const totalAmount = this.cartItems.reduce((sum, item) => sum + item.price, 0);
        this.notificationService.sendFailedPaymentNotification(
          'admin@learnifyenglish.com',
          userId,
          totalAmount,
          error.error?.message || error.message || 'Unknown error'
        ).subscribe({
          next: () => console.log('✅ Admin notified of failed payment'),
          error: (err) => console.error('❌ Failed to notify admin:', err)
        });
        
        alert('Payment failed: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  private processSingleCoursePayment(formData: any): void {
    const userId = 1; // TODO: Get from logged-in user
    
    // Use batch payment endpoint even for single course
    const batchRequest: any = {
      user_id: userId,
      user_name: formData.user_name,
      user_email: formData.user_email,
      courses: [{
        course_id: formData.course_id,
        course_title: this.selectedCourse?.title || 'Course',
        amount: formData.amount
      }],
      total_amount: formData.amount,
      payment_method: formData.payment_method,
      currency: formData.currency,
      payment_status: 'COMPLETED'
    };
    
    console.log('Final payment data:', batchRequest);

    this.paymentService.createBatchPayment(batchRequest).subscribe({
      next: (response) => {
        console.log('Payment created successfully:', response);
        this.isProcessing = false;
        this.isSuccess = true;
        
        // Send email notification
        this.notificationService.sendPaymentConfirmation(
          formData.user_email,
          formData.user_name,
          this.selectedCourse?.title || 'Course',
          formData.amount,
          formData.currency,
          response.data?.transaction_id || 'TXN_' + Date.now()
        ).subscribe({
          next: () => console.log('✅ Payment confirmation email sent'),
          error: (err) => console.error('❌ Failed to send email:', err)
        });
        
        // Enroll user in the purchased course
        this.enrollmentService.enrollUser(userId, formData.course_id).subscribe({
          next: () => {
            console.log('✅ User enrolled in course:', formData.course_id);
            alert('Payment successful! Check your email for more information.');
            
            // Redirect to course content page after 2 seconds
            setTimeout(() => {
              this.isSuccess = false;
              this.paymentForm.reset();
              this.router.navigate(['/courses', formData.course_id, 'content']);
            }, 2000);
          },
          error: (enrollError) => {
            console.error('Enrollment error:', enrollError);
            alert('Payment successful but enrollment failed. Please contact support.');
          }
        });
      },
      error: (error) => {
        console.error('Payment error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        this.isProcessing = false;
        this.error = 'Payment failed: ' + (error.error?.message || error.message || 'Unknown error');
        alert('Payment failed: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  getFormControl(name: string) {
    return this.paymentForm.get(name);
  }

  isFieldInvalid(name: string): boolean {
    const field = this.getFormControl(name);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(name: string): string {
    const field = this.getFormControl(name);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['min']) return 'Value must be greater than or equal to 0';
    }
    return '';
  }

  // Format card number (digits only)
  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    this.paymentForm.patchValue({ card_number: value }, { emitEvent: false });
  }

  // Format expiry date as MM/YY
  formatExpiry(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    this.paymentForm.patchValue({ expiry: value }, { emitEvent: false });
  }

  // Format CVV (3 digits only)
  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    value = value.substring(0, 3); // Max 3 digits
    this.paymentForm.patchValue({ cvv: value }, { emitEvent: false });
  }
}
