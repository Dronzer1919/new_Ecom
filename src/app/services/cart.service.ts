import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { normalizeImagePath } from './image.service';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  images: string[];
  category: string;
  description?: string;
  weight?: string;
  size?: string;
  color?: string;
  discount?: number;
  inStock: boolean;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  private cartSummary = new BehaviorSubject<CartSummary>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  });

  cartItems$ = this.cartItems.asObservable();
  cartSummary$ = this.cartSummary.asObservable();

  private userId: string | null = null;
  private apiBase = 'http://localhost:3000/api/cart';

  constructor(private http: HttpClient) {
  // API-only cart: load guest cart on startup (will fetch guest cookie-based cart when no userId)
  this.loadCartFromServer();
  }

  // Set the current user id so cart operations can be persisted server-side
  setUserId(id: string | null) {
    this.userId = id;
    if (this.userId) {
  this.loadCartFromServer();
    }
  }

  // No localStorage load/save. Cart is stored exclusively on server via API.

  addToCart(product: any, quantity: number = 1): void {
  // Support anonymous users: if no userId, call guest endpoints which rely on HttpOnly cookie

    // Normalize images to ensure proper URLs
    let normalizedImages: string[] = [];
    if (product.images && Array.isArray(product.images)) {
      normalizedImages = product.images.map((img: any) => {
        if (typeof img === 'object' && img.url) {
          return normalizeImagePath(img.url);
        }
        return normalizeImagePath(img);
      });
    } else if (product.image) {
      normalizedImages = [normalizeImagePath(product.image)];
    } else if (product.primaryImage) {
      normalizedImages = [normalizeImagePath(product.primaryImage)];
    }

    const payload = {
      productId: product._id || product.id,
      productName: product.productName || product.title || product.name,
      price: product.productPrice || product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      images: normalizedImages,
      category: product.category || '',
      description: product.description || '',
      weight: product.weight || '500gm',
      size: product.size || '',
      color: product.color || '',
      discount: product.discount || 0,
      inStock: product.inStock !== undefined ? product.inStock : true
    };

  const url = this.userId ? `${this.apiBase}/${this.userId}/items` : `${this.apiBase}/items`;
  const opts = this.userId ? {} : { withCredentials: true };

  this.http.post<any>(url, payload, opts).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          const items = (res.data.items || []).map((it: any) => ({
            ...it,
            id: it.productId
          }));
          this.cartItems.next(items);
          this.updateCartSummary();
        }
      },
      error: (err: any) => console.error('Failed to add to cart API', err)
    });
  }

  removeFromCart(itemId: string): void {
    const removed = this.cartItems.value.find(i => i.id === itemId);
    if (!removed) return;
  const url = this.userId ? `${this.apiBase}/${this.userId}/items/${removed.productId}` : `${this.apiBase}/items/${removed.productId}`;
  const opts = this.userId ? {} : { withCredentials: true };
  this.http.delete<any>(url, opts).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          const items = (res.data.items || []).map((it: any) => ({ ...it, id: it.productId }));
          this.cartItems.next(items);
          this.updateCartSummary();
        }
      },
      error: (err: any) => console.error('Failed to remove cart item', err)
    });
  }

  updateQuantity(itemId: string, quantity: number): void {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.id === itemId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        // update on server by re-posting the item payload
  const payload = {
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity,
          images: item.images,
          category: item.category,
          description: item.description,
          weight: item.weight,
          size: item.size,
          color: item.color,
          discount: item.discount,
          inStock: item.inStock
        };
  const url = this.userId ? `${this.apiBase}/${this.userId}/items` : `${this.apiBase}/items`;
  const opts = this.userId ? {} : { withCredentials: true };
  this.http.post<any>(url, payload, opts).subscribe({
          next: (res: any) => {
            if (res && res.success) {
              const items = (res.data.items || []).map((it: any) => ({ ...it, id: it.productId }));
              this.cartItems.next(items);
              this.updateCartSummary();
            }
          },
          error: (err: any) => console.error('Failed to update cart item', err)
        });
      }
    }
  }

  clearCart(): void {
  const url = this.userId ? `${this.apiBase}/${this.userId}` : `${this.apiBase}`;
  const opts = this.userId ? {} : { withCredentials: true };
  this.http.delete<any>(url, opts).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.cartItems.next([]);
          this.updateCartSummary();
        }
      },
      error: (err: any) => console.error('Failed to clear cart', err)
    });
  }

  // Server API integration
  private loadCartFromServer() {
    // Load cart for current context: authenticated userId takes priority, otherwise load guest cart via cookie
  const url = this.userId ? `${this.apiBase}/${this.userId}` : `${this.apiBase}`;
  const opts = this.userId ? {} : { withCredentials: true };
  this.http.get<{ success: boolean; data: any }>(url, opts).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          const items = (res.data.items || []).map((it: any) => ({
            ...it,
            id: it.productId,
            images: (it.images || [])
          }));
          this.cartItems.next(items);
          this.updateCartSummary();
        }
      },
      error: (err: any) => console.error('Failed to load cart from server', err)
    });
  }

  private addToServerCart(userId: string, items: CartItem[]): Observable<any> {
    // For simplicity, send last item to POST endpoint
    const last = items[items.length - 1];
    if (!last) return of(null);
    const payload = {
      productId: last.productId,
      productName: last.productName,
      price: last.price,
      originalPrice: last.originalPrice,
      quantity: last.quantity,
      images: last.images,
      category: last.category,
      description: last.description,
      weight: last.weight,
      size: last.size,
      color: last.color,
      discount: last.discount,
      inStock: last.inStock
    };
    return this.http.post(`${this.apiBase}/${userId}/items`, payload);
  }

  // Bulk replace server cart (replace entire cart items array)
  replaceServerCart(userId: string, items: CartItem[]): Observable<any> {
    const payload = items.map(it => ({
      productId: it.productId,
      productName: it.productName,
      price: it.price,
      originalPrice: it.originalPrice,
      quantity: it.quantity,
      images: it.images,
      category: it.category,
      description: it.description,
      weight: it.weight,
      size: it.size,
      color: it.color,
      discount: it.discount,
      inStock: it.inStock
    }));
    return this.http.post(`${this.apiBase}/${userId}`, payload);
  }

  // Load guest cart (cookie-based) and replace target user's cart with those items.
  // Returns an observable that resolves when replace completes (or when there are no guest items).
  loadGuestCartAndMerge(userId: string): Observable<any> {
    // Fetch guest cart items via cookie
    const url = `${this.apiBase}`; // GET /api/cart (guest reads cookie)
    const opts = { withCredentials: true } as any;
    return new Observable(observer => {
      this.http.get<{ success: boolean; data: any }>(url, opts).subscribe({
        next: (res: any) => {
          if (res && res.success && res.data && Array.isArray(res.data.items) && res.data.items.length > 0) {
            const items: CartItem[] = res.data.items.map((it: any) => ({
              id: it.productId,
              productId: it.productId,
              productName: it.productName,
              price: it.price,
              originalPrice: it.originalPrice,
              quantity: it.quantity || 1,
              images: it.images || [],
              category: it.category,
              description: it.description,
              weight: it.weight,
              size: it.size,
              color: it.color,
              discount: it.discount,
              inStock: it.inStock !== undefined ? it.inStock : true
            }));
            // Replace user's cart with guest items
            this.replaceServerCart(userId, items).subscribe({
              next: (r: any) => { observer.next(r); observer.complete(); },
              error: (e: any) => { observer.error(e); }
            });
          } else {
            observer.next({ success: true, message: 'No guest items' });
            observer.complete();
          }
        },
        error: (e: any) => observer.error(e)
      });
    });
  }

  // Local migration helper removed. Cart operations are API-only and require setUserId(userId).

  private removeFromServerCart(userId: string, productId: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/${userId}/items/${productId}`);
  }

  private clearServerCart(userId: string): Observable<any> {
    return this.http.delete(`${this.apiBase}/${userId}`);
  }

  getCartItemCount(): number {
    return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
  }

  isInCart(productId: string): boolean {
    return this.cartItems.value.some(item => item.productId === productId);
  }

  private updateCartSummary(): void {
    const items = this.cartItems.value;
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = items.reduce((total, item) => total + ((item.discount || 0) * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const total = subtotal - discount + tax + shipping;
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    this.cartSummary.next({
      subtotal,
      discount,
      tax,
      shipping,
      total,
      itemCount
    });
  }

  // Apply coupon
  applyCoupon(couponCode: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const coupons: { [key: string]: { discount: number; type: 'percentage' | 'fixed' } } = {
          'SAVE10': { discount: 10, type: 'percentage' },
          'FLAT50': { discount: 50, type: 'fixed' },
          'WELCOME20': { discount: 20, type: 'percentage' },
          'FIRST100': { discount: 100, type: 'fixed' }
        };

        if (coupons[couponCode.toUpperCase()]) {
          const coupon = coupons[couponCode.toUpperCase()];
          const currentSummary = this.cartSummary.value;
          let additionalDiscount = 0;

          if (coupon.type === 'percentage') {
            additionalDiscount = (currentSummary.subtotal * coupon.discount) / 100;
          } else {
            additionalDiscount = coupon.discount;
          }

          const newSummary = {
            ...currentSummary,
            discount: currentSummary.discount + additionalDiscount,
            total: currentSummary.total - additionalDiscount
          };

          this.cartSummary.next(newSummary);
          observer.next({ success: true, message: 'Coupon applied successfully!', discount: additionalDiscount });
        } else {
          observer.next({ success: false, message: 'Invalid coupon code' });
        }
        observer.complete();
      }, 1000);
    });
  }
}
