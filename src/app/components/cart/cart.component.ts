import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';
import { normalizeImagePath } from '../../services/image.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  cartSummary$: Observable<CartSummary>;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  };

  couponCode: string = '';
  appliedCoupon: string = '';
  couponLoading: boolean = false;
  loading: boolean = true;

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.cartSummary$ = this.cartService.cartSummary$;
  }

  ngOnInit() {
    this.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.loading = false;
    });

    this.cartSummary$.subscribe(summary => {
      this.cartSummary = summary;
    });
  }

  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  onQuantityChange(itemId: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const quantity = +target.value;
    this.updateQuantity(itemId, quantity);
  }

  updateQuantity(itemId: string, quantity: number) {
    if (quantity < 1) {
      this.removeItem(itemId);
      return;
    }
    this.cartService.updateQuantity(itemId, quantity);
  }

  removeItem(itemId: string) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item) {
      this.cartService.removeFromCart(itemId);
      this.toastr.success(`${item.productName} removed from cart`);
    }
  }

  moveToWishlist(item: CartItem) {
    this.wishlistService.addToWishlist(item).subscribe({
      next: (response) => {
        if (response.success) {
          this.removeItem(item.id);
          this.toastr.success('Item moved to wishlist');
        }
      }
    });
  }

  clearCart() {
    if (this.cartItems.length === 0) return;

    if (confirm('Are you sure you want to remove all items from cart?')) {
      this.cartService.clearCart();
      this.toastr.success('Cart cleared successfully');
    }
  }

  applyCoupon() {
    if (!this.couponCode.trim()) {
      this.toastr.error('Please enter a coupon code');
      return;
    }

    this.couponLoading = true;
    this.cartService.applyCoupon(this.couponCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.appliedCoupon = this.couponCode;
          this.toastr.success(response.message);
          this.couponCode = '';
        } else {
          this.toastr.error(response.message);
        }
        this.couponLoading = false;
      },
      error: () => {
        this.toastr.error('Error applying coupon');
        this.couponLoading = false;
      }
    });
  }

  removeCoupon() {
    this.appliedCoupon = '';
    // Recalculate cart without coupon - you might need to implement this in service
    this.toastr.info('Coupon removed');
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  proceedToCheckout() {
    if (this.cartItems.length === 0) {
      this.toastr.warning('Your cart is empty');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  // Helper methods
  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  getDiscountAmount(item: CartItem): number {
    return (item.discount || 0) * item.quantity;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  getImageUrl(item: CartItem): string {
  const img = item.images && item.images.length > 0 ? item.images[0] : undefined;
  return normalizeImagePath(img);
  }

  // Quick actions
  incrementQuantity(itemId: string) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item && item.quantity < 10) {
      this.updateQuantity(itemId, item.quantity + 1);
    }
  }

  decrementQuantity(itemId: string) {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      this.updateQuantity(itemId, item.quantity - 1);
    }
  }

  // Estimated delivery date
  getEstimatedDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (this.cartSummary.total > 500 ? 3 : 5));
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // Savings calculation
  getTotalSavings(): number {
    return this.cartItems.reduce((total, item) => {
      const originalPrice = item.originalPrice || item.price;
      const savings = (originalPrice - item.price) * item.quantity;
      return total + savings;
    }, 0) + this.cartSummary.discount;
  }
}
