import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  title: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  duration?: string;
  instructor?: string;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'learnify_cart';
  
  private cartStateSubject = new BehaviorSubject<CartState>({
    items: [],
    total: 0,
    itemCount: 0
  });

  cartState$ = this.cartStateSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    try {
      const storedCart = localStorage.getItem(this.CART_KEY);
      if (storedCart) {
        const cartData = JSON.parse(storedCart);
        this.cartStateSubject.next(cartData);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.clearCart();
    }
  }

  private saveCartToStorage(state: CartState): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private updateCartState(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    const itemCount = items.length;
    
    const newState: CartState = {
      items,
      total,
      itemCount
    };
    
    this.cartStateSubject.next(newState);
    this.saveCartToStorage(newState);
  }

  addToCart(course: CartItem): void {
    const currentState = this.cartStateSubject.value;
    
    // Check if course already exists in cart
    const existingItemIndex = currentState.items.findIndex(item => item.id === course.id);
    
    if (existingItemIndex === -1) {
      const updatedItems = [...currentState.items, { ...course, addedAt: new Date() }];
      this.updateCartState(updatedItems);
    } else {
      console.log('Course already in cart:', course.title);
    }
  }

  removeFromCart(courseId: number): void {
    const currentState = this.cartStateSubject.value;
    const updatedItems = currentState.items.filter(item => item.id !== courseId);
    this.updateCartState(updatedItems);
  }

  clearCart(): void {
    this.updateCartState([]);
  }

  getCartState(): CartState {
    return this.cartStateSubject.value;
  }

  isInCart(courseId: number): boolean {
    const currentState = this.cartStateSubject.value;
    return currentState.items.some(item => item.id === courseId);
  }

  getCartTotal(): number {
    return this.cartStateSubject.value.total;
  }

  getCartItemCount(): number {
    return this.cartStateSubject.value.itemCount;
  }

  getCartItems(): CartItem[] {
    return this.cartStateSubject.value.items;
  }
}
