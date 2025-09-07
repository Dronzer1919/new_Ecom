import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  cartItemCount$: Observable<number>;
  wishlistItemCount$: Observable<number>;
  searchTerm: string = '';
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  userName: string = '';

  // Categories for navigation
  categories = [
    { name: 'Living Room', icon: 'bi-house', route: '/products/living-room' },
    { name: 'Bedroom', icon: 'bi-moon', route: '/products/bedroom' },
    { name: 'Dining Room', icon: 'bi-table', route: '/products/dining-room' },
    { name: 'Office Furniture', icon: 'bi-briefcase', route: '/products/office' },
    { name: 'Storage & Organization', icon: 'bi-box', route: '/products/storage' },
    { name: 'Decor & Accessories', icon: 'bi-star', route: '/products/decor' }
  ];

  constructor(
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router
    ,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cartItemCount$ = this.cartService.cartItems$.pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );

    this.wishlistItemCount$ = this.wishlistService.wishlistItems$.pipe(
      map(items => items.length)
    );
  }

  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    // Only access localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          this.isLoggedIn = true;
          this.userName = userData.name || userData.username || userData.email || 'User';
        } catch (error) {
          this.isLoggedIn = false;
          this.userName = '';
        }
      } else {
        this.isLoggedIn = false;
        this.userName = '';
      }
    } else {
      this.isLoggedIn = false;
      this.userName = '';
    }
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/products'], {
        queryParams: { search: this.searchTerm.trim() }
      });
      this.searchTerm = '';
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
    this.closeMenu();
  }

  navigateToWishlist() {
    this.router.navigate(['/wishlist']);
    this.closeMenu();
  }

  navigateToCategory(route: string) {
    this.router.navigate([route]);
    this.closeMenu();
  }

  navigateToHome() {
    this.router.navigate(['/']);
    this.closeMenu();
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
    this.closeMenu();
  }

  navigateToOffers() {
    this.router.navigate(['/offers']);
    this.closeMenu();
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.closeMenu();
  }

  navigateToOrders() {
    this.router.navigate(['/orders']);
    this.closeMenu();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
    this.closeMenu();
  }

  logout() {
    // Implement logout logic here
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
    }
    this.isLoggedIn = false;
    this.userName = '';
    this.router.navigate(['/login']);
    this.closeMenu();
  }
}
