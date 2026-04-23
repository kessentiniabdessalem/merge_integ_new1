import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem, CartState } from '../../services/cart.service';
import { PaymentService } from '../../core/services/payment.service';
import { Payment } from '../../core/models/payment.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  standalone: false
})
export class CartComponent implements OnInit {
  cartState: CartState = {
    items: [],
    total: 0,
    itemCount: 0
  };
  isLoading = false;
  paymentSuccess = false;

  constructor(
    private cartService: CartService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartState$.subscribe(state => {
      this.cartState = state;
    });
  }

  removeFromCart(courseId: number): void {
    this.cartService.removeFromCart(courseId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  proceedToCheckout(): void {
    if (this.cartState.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Navigate to payment page with cart items
    this.router.navigate(['/payment'], { 
      queryParams: { 
        fromCart: 'true',
        courses: JSON.stringify(this.cartState.items.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price
        })))
      } 
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getTotalItems(): number {
    return this.cartState.itemCount;
  }

  getTotalPrice(): number {
    return this.cartState.total;
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }
}
