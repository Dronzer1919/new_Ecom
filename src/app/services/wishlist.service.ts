import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { normalizeImagePath } from './image.service';

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  description?: string;
  discount?: number;
  inStock: boolean;
  addedDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private wishlistItems = new BehaviorSubject<WishlistItem[]>([]);

  wishlistItems$ = this.wishlistItems.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadWishlistFromStorage();
  }

  private loadWishlistFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist);
        // Convert date strings back to Date objects and normalize images
        const normalized = (items || []).map((item: any) => {
          item.addedDate = new Date(item.addedDate);
          try {
            if (item.images && Array.isArray(item.images)) {
              // Normalize each entry and ensure we store string URLs
              item.images = item.images.map((img: any) => normalizeImagePath(img));
            } else if (item.images) {
              item.images = [normalizeImagePath(item.images)];
            } else {
              item.images = [];
            }
          } catch (e) {
            item.images = [];
          }
          return item;
        });
        this.wishlistItems.next(normalized);
      }
    }
  }

  private saveWishlistToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems.value));
    }
  }

  addToWishlist(product: any): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const currentItems = this.wishlistItems.value;
      const existingItem = currentItems.find(item => item.productId === (product._id || product.id));

      if (existingItem) {
        observer.next({ success: false, message: 'Product already in wishlist!' });
      } else {
  const rawImages = product.images || (product.image ? [product.image] : []);
  const normalizedImages = (rawImages || []).map((img: any) => normalizeImagePath(img));

        const newItem: WishlistItem = {
          id: Date.now().toString(),
          productId: product._id || product.id,
          productName: product.productName || product.name,
          price: product.productPrice || product.price,
          originalPrice: product.originalPrice,
          images: normalizedImages,
          category: product.category || '',
          description: product.description || '',
          discount: product.discount || 0,
          inStock: true,
          addedDate: new Date()
        };

        currentItems.push(newItem);
        this.wishlistItems.next(currentItems);
  this.saveWishlistToStorage();
        observer.next({ success: true, message: 'Added to wishlist!' });
      }
      observer.complete();
    });
  }

  removeFromWishlist(itemId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const currentItems = this.wishlistItems.value.filter(item => item.id !== itemId);
      this.wishlistItems.next(currentItems);
      this.saveWishlistToStorage();
      observer.next({ success: true, message: 'Removed from wishlist!' });
      observer.complete();
    });
  }

  removeByProductId(productId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      const currentItems = this.wishlistItems.value.filter(item => item.productId !== productId);
      this.wishlistItems.next(currentItems);
      this.saveWishlistToStorage();
      observer.next({ success: true, message: 'Removed from wishlist!' });
      observer.complete();
    });
  }

  clearWishlist(): void {
    this.wishlistItems.next([]);
    localStorage.removeItem('wishlist');
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems.value.some(item => item.productId === productId);
  }

  getWishlistCount(): number {
    return this.wishlistItems.value.length;
  }

  moveToCart(itemId: string): Observable<{ success: boolean; message: string }> {
    return new Observable(observer => {
      // This would typically inject CartService, but to avoid circular dependency,
      // we'll emit an event that components can listen to
      observer.next({ success: true, message: 'Item will be moved to cart' });
      observer.complete();
    });
  }

  // Get wishlist items sorted by date (newest first)
  getWishlistItemsSorted(): WishlistItem[] {
    return this.wishlistItems.value.sort((a, b) =>
      new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
    );
  }

  // Search wishlist items
  searchWishlist(query: string): WishlistItem[] {
    const searchTerm = query.toLowerCase();
    return this.wishlistItems.value.filter(item =>
      item.productName.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      (item.description && item.description.toLowerCase().includes(searchTerm))
    );
  }

  // Filter by category
  filterByCategory(category: string): WishlistItem[] {
    if (!category || category === 'all') {
      return this.wishlistItems.value;
    }
    return this.wishlistItems.value.filter(item =>
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get unique categories in wishlist
  getWishlistCategories(): string[] {
    const categories = this.wishlistItems.value.map(item => item.category);
    return [...new Set(categories)].filter(category => category);
  }
}
