import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../product.service';
import { ProductSideBarComponent } from '../product-side-bar/product-side-bar.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  imports: [ProductSideBarComponent, CommonModule, FormsModule, ReactiveFormsModule],
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

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
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
    this.productService.getAllProduct().subscribe((data: any) => {
      this.allProductList = data;
      if (this.allProductList.length) {
        this.getProductId();
      }
    })
  }

  public getProductId() {
    this.activatedRoute.params.subscribe(params => {
      this.productId = params['id'];
      this.originalProductList = this.allProductList.filter((i: { _id: string; }) => i._id === this.productId)[0].productTypes;
      this.displayedProducts = [...this.originalProductList];
      this.filterList = [...this.originalProductList];
    });
  }

  public gotoDetails(value: any) {
    this.router.navigate(['/productDetails/', value.categoryName]);
    localStorage.setItem('details', JSON.stringify(value));
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
        product.productName.toLowerCase().includes(this.searchTerm.toLowerCase())
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

  // Get product rating display
  getProductRating(product: any): number {
    return product.rating || product.productRating || 0;
  }

  // Get star array for rating display
  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  // Check if product has badge
  hasBadge(product: any, badge: string): boolean {
    return product.badge === badge;
  }

  // Get badge display class
  getBadgeClass(badge: string): string {
    const badgeClasses: { [key: string]: string } = {
      'new': 'badge bg-success',
      'sale': 'badge bg-danger',
      'hot': 'badge bg-warning text-dark',
      'featured': 'badge bg-primary',
      'limited': 'badge bg-info text-dark'
    };
    return badgeClasses[badge] || 'badge bg-secondary';
  }
}
