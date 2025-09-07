import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../product.service';
import { CartService } from '../../../../services/cart.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { ProductSideBarComponent } from '../product-side-bar/product-side-bar.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-list',
  imports: [ProductSideBarComponent, CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  standalone: true,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  public productList!: any;
  public productId!: string;
  filterList: any;
  allProductList: any;
  originalProductList: any; // Keep original unfiltered list
  searchTerm: string = '';
  private searchTermChanged: Subject<string> = new Subject<string>();
  private searchTermSubscription: Subscription;
  displayedProducts: any;
  currentFilters: any = {
    minPrice: '',
    maxPrice: '',
    featured: false,
    topRated: false,
    badge: '',
    sortBy: 'default'
  };

  // Enhanced properties for e-commerce
  loading: boolean = true;
  viewMode: 'grid' | 'list' = 'grid';
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  paginatedProducts: any[] = [];

  // Quick action states
  addingToCart: Set<string> = new Set();
  addingToWishlist: Set<string> = new Set();

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {
    this.getallProducts();
    this.searchTermSubscription = this.searchTermChanged.pipe(
      debounceTime(1000), // Wait for 1 second after user stops typing
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(() => {
      this.applyAllFilters();
    });
  }

  ngOnInit(): void {
  }

  public getallProducts() {
    this.loading = true;
    this.productService.getAllProduct().subscribe((data: any) => {
      this.allProductList = data;
      if (this.allProductList.length) {
        this.getProductId();
      }
      this.loading = false;
    }, error => {
      console.error('Error fetching products:', error);
      this.loading = false;
    });
  }

  public getProductId() {
    this.activatedRoute.params.subscribe(params => {
      this.productId = params['id'];
      this.originalProductList = this.allProductList.filter((i: { _id: string; }) => i._id === this.productId)[0].productTypes;
      this.displayedProducts = [...this.originalProductList];
      this.filterList = [...this.originalProductList];
      this.totalItems = this.filterList.length;
      this.updatePagination();
    });
  }

  public gotoDetails(value: any) {
    this.router.navigate(['/productDetails/', value.categoryName]);
    localStorage.setItem('details', JSON.stringify(value));
  }

  // Enhanced navigation to product details
  goToProductDetails(product: any) {
    this.router.navigate(['/product', product._id || product.id]);
  }

  onSearchTermChange(): void {
    this.searchTermChanged.next(this.searchTerm);
    // If search term is empty, apply filters immediately
    if (!this.searchTerm) {
      this.applyAllFilters();
    }
  }

  // Apply all filters including search, price, features, badges, and sorting
  applyAllFilters(): void {
    let filteredProducts = [...this.originalProductList];

    // Apply search filter
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      filteredProducts = filteredProducts.filter((product: any) =>
        product.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Apply price filter
    if (this.currentFilters.minPrice && this.currentFilters.minPrice !== '') {
      filteredProducts = filteredProducts.filter((product: any) =>
        parseInt(product.productPrice) >= parseInt(this.currentFilters.minPrice)
      );
    }

    if (this.currentFilters.maxPrice && this.currentFilters.maxPrice !== '') {
      filteredProducts = filteredProducts.filter((product: any) =>
        parseInt(product.productPrice) <= parseInt(this.currentFilters.maxPrice)
      );
    }

    // Apply featured filter
    if (this.currentFilters.featured) {
      filteredProducts = filteredProducts.filter((product: any) =>
        product.featured === true
      );
    }

    // Apply top rated filter (assuming rating > 4)
    if (this.currentFilters.topRated) {
      filteredProducts = filteredProducts.filter((product: any) =>
        (product.rating && product.rating >= 4) || (product.productRating && product.productRating >= 4)
      );
    }

    // Apply badge filter
    if (this.currentFilters.badge && this.currentFilters.badge !== '') {
      filteredProducts = filteredProducts.filter((product: any) =>
        product.badge === this.currentFilters.badge
      );
    }

    // Apply sorting
    filteredProducts = this.sortProducts(filteredProducts, this.currentFilters.sortBy);

    this.filterList = filteredProducts;
    this.totalItems = this.filterList.length;
    this.currentPage = 1; // Reset to first page
    this.updatePagination();
  }

  // Sort products based on selected criteria
  sortProducts(products: any[], sortBy: string): any[] {
    switch (sortBy) {
      case 'price-low':
        return products.sort((a, b) => parseInt(a.productPrice) - parseInt(b.productPrice));
      case 'price-high':
        return products.sort((a, b) => parseInt(b.productPrice) - parseInt(a.productPrice));
      case 'name-asc':
        return products.sort((a, b) => a.productName.localeCompare(b.productName));
      case 'name-desc':
        return products.sort((a, b) => b.productName.localeCompare(a.productName));
      case 'rating':
        return products.sort((a, b) => {
          const ratingA = a.rating || a.productRating || 0;
          const ratingB = b.rating || b.productRating || 0;
          return ratingB - ratingA;
        });
      case 'newest':
        return products.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_on || 0);
          const dateB = new Date(b.createdAt || b.created_on || 0);
          return dateB.getTime() - dateA.getTime();
        });
      default:
        return products;
    }
  }

  // Handle filter changes from sidebar
  filterValuesChange(filterValues: {
    minPrice: string,
    maxPrice: string,
    featured: boolean,
    topRated: boolean,
    badge: string,
    sortBy: string
  }) {
    console.log('Filter values received:', filterValues);
    this.currentFilters = { ...filterValues };
    this.applyAllFilters();
  }

  // Enhanced e-commerce methods
  addToCart(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const productId = product._id || product.id;
    this.addingToCart.add(productId);

    this.cartService.addToCart(product, 1);
    this.toastr.success(`${product.productName} added to cart!`);

    setTimeout(() => {
      this.addingToCart.delete(productId);
    }, 1000);
  }

  addToWishlist(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const productId = product._id || product.id;
    this.addingToWishlist.add(productId);

    this.wishlistService.addToWishlist(product).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.message);
        } else {
          this.toastr.info(response.message);
        }
        this.addingToWishlist.delete(productId);
      },
      error: () => {
        this.addingToWishlist.delete(productId);
      }
    });
  }

  buyNow(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.cartService.addToCart(product, 1);
    this.router.navigate(['/checkout']);
  }

  isInCart(product: any): boolean {
    const productId = product._id || product.id;
    return this.cartService.isInCart(productId);
  }

  isInWishlist(product: any): boolean {
    const productId = product._id || product.id;
    return this.wishlistService.isInWishlist(productId);
  }

  // View mode toggle
  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // Pagination methods
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filterList.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Get product rating display
  getProductRating(product: any): number {
    return product.rating || product.productRating || 0;
  }

  // Get star array for rating display
  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < Math.floor(rating));
  }

  // Check if product has badge
  hasBadge(product: any, badge: string): boolean {
    return product.badge === badge;
  }

  // Get badge display class
  getBadgeClass(badge: string): string {
    const badgeClasses: { [key: string]: string } = {
      'new': 'badge bg-wood',
      'sale': 'badge bg-danger',
      'hot': 'badge bg-warning text-dark',
      'featured': 'badge bg-primary',
      'limited': 'badge bg-info text-dark'
    };
    return badgeClasses[badge] || 'badge bg-secondary';
  }

  // Get discount percentage
  getDiscountPercentage(product: any): number {
    if (product.originalPrice && product.productPrice) {
      const discount = ((product.originalPrice - product.productPrice) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return product.discount || 0;
  }

  // Check if product is on sale
  isOnSale(product: any): boolean {
    return product.originalPrice > product.productPrice || product.discount > 0;
  }

  // Get product availability status
  getAvailabilityStatus(product: any): string {
    if (product.inStock === false || product.stock === 0) {
      return 'Out of Stock';
    } else if (product.stock && product.stock < 5) {
      return 'Limited Stock';
    } else {
      return 'In Stock';
    }
  }

  // Get availability class
  getAvailabilityClass(product: any): string {
    const status = this.getAvailabilityStatus(product);
    switch (status) {
      case 'Out of Stock':
        return 'text-danger';
      case 'Limited Stock':
        return 'text-warning';
      default:
        return 'text-wood';
    }
  }

  // Filter methods for quick access
  clearAllFilters() {
    this.currentFilters = {
      minPrice: '',
      maxPrice: '',
      featured: false,
      topRated: false,
      badge: '',
      sortBy: 'default'
    };
    this.searchTerm = '';
    this.applyAllFilters();
  }

  // Quick sort options
  quickSort(sortBy: string) {
    this.currentFilters.sortBy = sortBy;
    this.applyAllFilters();
  }

  ngOnDestroy() {
    if (this.searchTermSubscription) {
      this.searchTermSubscription.unsubscribe();
    }
  }
}
