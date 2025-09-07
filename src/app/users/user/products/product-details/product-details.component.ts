import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../product.service';
import { CartService } from '../../../../services/cart.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { normalizeImagePath } from '../../../../services/image.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./product-details.component.scss']
})

export class ProductDetailsComponent implements OnInit, OnDestroy {
  timeLeft: number = 300;
  key1: any;
  device: any;
  photos: any[] = [];
  timeLeftString: string | undefined;
  data: any;
  intervalId: any;

  // Enhanced properties for e-commerce functionality
  productId: string | null = null;
  product: any = null;
  productImageUrls: string[] = [];
  relatedProducts: any[] = [];
  selectedImageIndex: number = 0;
  quantity: number = 1;
  selectedWeight: string = '500gm';
  selectedSize: string = '';
  selectedColor: string = '';
  timeLeftObj: any = {};
  private timer: any;
  loading: boolean = true;
  isInCart: boolean = false;
  isInWishlist: boolean = false;
  showFullDescription: boolean = false;

  // Reviews data
  reviews: any[] = [];
  newReview = {
    rating: 5,
    comment: '',
    name: '',
    email: ''
  };
  showReviewForm: boolean = false;

  // Available options
  weightOptions = ['250gm', '500gm', '1kg', '2kg', '5kg'];
  sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  colorOptions = ['Walnut', 'Oak', 'Mahogany', 'Cherry', 'Pine', 'Teak'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer
  ) {}

  // Normalize different image shapes into an array of full URL strings
  private normalizeProductImages(images: any): string[] {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.map(img => {
        if (!img) return '';
        if (typeof img === 'string') return normalizeImagePath(img);
        if (typeof img === 'object') {
          const maybe = img.url || img.filename || img.path || img.file || img.src || img.image;
          return maybe ? normalizeImagePath(maybe) : '';
        }
        return '';
      }).filter(Boolean);
    }

    if (typeof images === 'string') return [normalizeImagePath(images)];
    if (typeof images === 'object') {
      const maybe = images.url || images.filename || images.path || images.file || images.src || images.image;
      return maybe ? [normalizeImagePath(maybe)] : [];
    }
    return [];
  }

  ngOnInit(): void {
    // Check if we're in the browser (avoid SSR issues)
    if (isPlatformBrowser(this.platformId)) {
      // Safely access localStorage only in the browser
      const value = JSON.parse(localStorage.getItem('details') || '{}');
      console.log('📦 Legacy localStorage data:', value);
      this.data = value;

      // Start the countdown timer
      this.startTimer();

      // Enhanced initialization
      this.route.params.subscribe(params => {
        this.productId = params['id'];
        console.log('🆔 Route product ID:', this.productId);
        if (this.productId) {
          this.loadProductDetails();
          this.checkCartStatus();
          this.checkWishlistStatus();
        } else {
          console.error('❌ No product ID in route params');
          // Fallback to localStorage data if available
          if (this.data && (this.data.id || this.data._id)) {
            console.log('🔄 Using fallback localStorage data');
            this.product = this.data;
            this.loading = false;
          }
        }
      });
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startTimer(): void {
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeLeftString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
    }, 1000);
  }

  gotoCart(value: any) {
    this.router.navigate(['/addToCart/', value.im]);
  }

  // Enhanced methods for e-commerce functionality
  private loadProductDetails() {
    if (!this.productId) return;

    console.log('🔍 Loading product details for ID:', this.productId);

    // First, try to use localStorage data (which we know works)
    if (this.data && (this.data.id || this.data._id)) {
      console.log('✅ Using localStorage data directly:', this.data);
      this.product = {
        _id: this.data.id || this.data._id,
        title: this.data.title,
        price: this.data.price,
        images: [{ url: this.data.image }], // Convert single image to array format
        description: this.data.description || 'Product description not available.',
        inventory: { quantity: 10 },
        // Don't set category for localStorage data since we don't have a valid ObjectId
        badge: this.data.badge,
        rating: { average: this.data.rating || 0 }
      };
      this.loading = false;
      // this.loadRelatedProducts(); // Disabled to prevent ObjectId casting error
      this.loadReviews();
      return;
    }

    // Fallback to API call
    this.loading = true;
    this.productService.getProduct(this.productId).subscribe({
      next: (response: any) => {
        console.log('📦 API Response:', response);
        if (response.success) {
          this.product = response.data;
          console.log('✅ Product loaded from API:', this.product);
            // Normalize images into full URL strings
            this.productImageUrls = this.normalizeProductImages(this.product.images || this.product.image);
            console.log('� productImageUrls after API load:', this.productImageUrls);
          console.log('🖼️ Product images from API:', this.product.images);
          this.selectedWeight = this.product.weight || '500gm';
          this.selectedSize = this.product.size || '';
          this.selectedColor = this.product.color || '';
          // this.loadRelatedProducts(); // Disabled to prevent ObjectId casting error
          this.loadReviews();
        } else {
          console.error('❌ Product not found in response');
          this.toastr.error('Product not found');
          this.router.navigate(['/products']);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('💥 Error loading product:', error);
        console.log('🔄 Attempting to use localStorage fallback data');

        // Try to use localStorage data as fallback
        if (this.data && (this.data.id || this.data._id)) {
          console.log('✅ Using localStorage fallback data:', this.data);
          this.product = {
            _id: this.data.id || this.data._id,
            title: this.data.title,
            price: this.data.price,
            images: [{ url: this.data.image }],
            description: this.data.description || 'Product description not available.',
            inventory: { quantity: 10 },
            category: this.data.category || 'General'
          };
          // this.loadRelatedProducts(); // Disabled to prevent ObjectId casting error
          this.loadReviews();
          this.productImageUrls = this.normalizeProductImages(this.product.images || this.product.image || this.data.image);
          console.log('� productImageUrls after localStorage fallback:', this.productImageUrls);
        } else {
          this.toastr.error('Error loading product details');
        }
        this.loading = false;
      }
    });
  }

  private loadRelatedProducts() {
    if (!this.product || !this.product.category || !this.product._id) return;

    // Get the category ID (handle both object and string formats)
    const categoryId = typeof this.product.category === 'object'
      ? this.product.category._id
      : this.product.category;

    console.log('� Loading related products for category:', categoryId, 'excluding:', this.product._id);

    this.productService.getRelatedProducts(categoryId, this.product._id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.relatedProducts = response.data;
          console.log('✅ Related products loaded:', this.relatedProducts.length);
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading related products:', error);
        this.relatedProducts = [];
      }
    });
  }

  private loadReviews() {
    // Mock reviews data - in real app, this would come from API
    this.reviews = [
      {
        id: 1,
        name: 'Rajesh Kumar',
        rating: 5,
        comment: 'Excellent quality furniture! Sturdy and delivered on time.',
        date: new Date('2024-01-15'),
        verified: true
      },
      {
        id: 2,
        name: 'Priya Sharma',
        rating: 4,
        comment: 'Good quality sofa, assembly instructions could be clearer.',
        date: new Date('2024-01-10'),
        verified: true
      },
      {
        id: 3,
        name: 'Amit Singh',
        rating: 5,
        comment: 'Best quality furniture. Highly recommended for modern homes!',
        date: new Date('2024-01-08'),
        verified: false
      }
    ];
  }

  private checkCartStatus() {
    if (this.productId) {
      this.isInCart = this.cartService.isInCart(this.productId);
    }
  }

  private checkWishlistStatus() {
    if (this.productId) {
      this.isInWishlist = this.wishlistService.isInWishlist(this.productId);
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  updateQuantity(change: number) {
    const newQuantity = this.quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      this.quantity = newQuantity;
    }
  }

  addToCart() {
    if (!this.product) return;

    const productWithOptions = {
      ...this.product,
      selectedWeight: this.selectedWeight,
      selectedSize: this.selectedSize,
      selectedColor: this.selectedColor
    };

    this.cartService.addToCart(productWithOptions, this.quantity);
    this.isInCart = true;
    this.toastr.success(`${this.product.title} added to cart!`);
  }

  addToWishlist() {
    if (!this.product) return;

    this.wishlistService.addToWishlist(this.product).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.isInWishlist = true;
          this.toastr.success(response.message);
        } else {
          this.toastr.info(response.message);
        }
      }
    });
  }

  removeFromWishlist() {
    if (!this.productId) return;

    this.wishlistService.removeByProductId(this.productId).subscribe({
      next: (response: any) => {
        this.isInWishlist = false;
        this.toastr.success(response.message);
      }
    });
  }

  buyNow() {
    if (!this.product) return;

    const productWithOptions = {
      ...this.product,
      selectedWeight: this.selectedWeight,
      selectedSize: this.selectedSize,
      selectedColor: this.selectedColor
    };

    this.cartService.addToCart(productWithOptions, this.quantity);
    this.router.navigate(['/checkout']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  submitReview() {
    if (!this.newReview.name || !this.newReview.comment) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const review = {
      id: this.reviews.length + 1,
      name: this.newReview.name,
      rating: this.newReview.rating,
      comment: this.newReview.comment,
      date: new Date(),
      verified: false
    };

    this.reviews.unshift(review);
    this.newReview = { rating: 5, comment: '', name: '', email: '' };
    this.showReviewForm = false;
    this.toastr.success('Review submitted successfully!');
  }

  getStarArray(rating: number): any[] {
    return new Array(5).fill(0).map((_, index) => ({
      filled: index < rating
    }));
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  getRatingDistribution(): any[] {
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    this.reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });

    const total = this.reviews.length;
    return distribution.map((count, index) => ({
      stars: index + 1,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).reverse();
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Return the best available product description (handles different backend shapes)
  getProductDescription(): string {
    if (this.product) {
      // prefer common keys
      const desc = this.product.description || this.product.desc || this.product.details || this.product.shortDescription || this.product.content || this.product.subtitle || this.product.metaDescription;
      if (desc) {
        if (typeof desc === 'string') {
          if (desc.trim().length > 0) {
            console.debug('Product description (string) resolved from product:', desc);
            return desc;
          }
        } else if (typeof desc === 'object') {
          // Common structured formats: { html: '...' } or Quill delta { ops: [...] }
          if ((desc as any).html && typeof (desc as any).html === 'string') return (desc as any).html;
          if ((desc as any).content && typeof (desc as any).content === 'string') return (desc as any).content;
          if ((desc as any).value && typeof (desc as any).value === 'string') return (desc as any).value;
          if (Array.isArray(desc)) return desc.join(' ');
          if ((desc as any).ops && Array.isArray((desc as any).ops)) {
            // Convert Quill delta to plain text as a fallback
            try {
              return (desc as any).ops.map((op: any) => op.insert || '').join('');
            } catch (e) {
              return JSON.stringify(desc);
            }
          }
          return JSON.stringify(desc);
        }
      }
    }
    // fallback to legacy localStorage data
    if (this.data) {
      const legacy = this.data.description || this.data.desc || this.data.about || this.data.subtitle || this.data.productDescription || this.data.title;
      if (legacy && typeof legacy === 'string' && legacy.trim().length > 0) return legacy;
    }
  const fallback = 'No description available.';
  console.debug('Product description resolved to fallback:', fallback, 'product object:', this.product, 'localStorage data:', this.data);
  return fallback;
  }

  private startCountdown() {
    // Set target date (24 hours from now)
    const targetDate = new Date().getTime() + (24 * 60 * 60 * 1000);

    this.timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      this.timeLeftObj = {
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };

      if (distance < 0) {
        clearInterval(this.timer);
        this.timeLeftObj = { hours: 0, minutes: 0, seconds: 0 };
      }
    }, 1000);
  }

  // Helper method to get properly formatted image URLs
  getProductImage(imageData: any): string {
    console.log('🖼️ Processing image data:', imageData);

    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

    if (!imageData) {
      console.log('❌ No image data, using placeholder');
      return placeholder;
    }

    const base = 'http://localhost:3000';

    // If imageData is an object with common properties (backend format)
    if (typeof imageData === 'object') {
      // prefer `url` but support common alternate keys from different backends
      const maybeUrl = imageData.url || imageData.filename || imageData.path || imageData.file || imageData.src || imageData.image;
      if (maybeUrl) {
        const url = maybeUrl;
      // If already a full URL
      if (url.startsWith('http')) {
        console.log('✅ Found full image URL (object):', url);
        return url;
      }
      // If starts with slash (/uploads/...), prefix host
      if (url.startsWith('/')) {
        const full = `${base}${url}`;
        console.log('🔗 Created full image URL from object (leading slash):', full);
        return full;
      }
      // If contains uploads segment, assume it's a relative path under root
      if (url.includes('uploads')) {
        const full = `${base}/${url}`;
        console.log('🔗 Created full image URL from object (contains uploads):', full);
        return full;
      }
      // Otherwise assume it's a filename stored in uploads
      const assumed = `${base}/uploads/${url}`;
      console.log('🔗 Assumed uploads URL from object:', assumed);
      return assumed;
    }
    }

    // If imageData is a string
    if (typeof imageData === 'string') {
      // If it's already a full URL, return as is
      if (imageData.startsWith('http')) {
        console.log('✅ Full URL found (string):', imageData);
        return imageData;
      }
      // If starts with slash, prefix base
      if (imageData.startsWith('/')) {
        const full = `${base}${imageData}`;
        console.log('🔗 Created full image URL from string (leading slash):', full);
        return full;
      }
      // If contains uploads segment, prefix base
      if (imageData.includes('uploads')) {
        const full = `${base}/${imageData}`;
        console.log('🔗 Created full image URL from string (contains uploads):', full);
        return full;
      }
      // Otherwise assume it's a filename stored in uploads
      const fullAssumed = `${base}/uploads/${imageData}`;
      console.log('🔗 Assumed uploads URL from string:', fullAssumed);
      return fullAssumed;
    }

    console.log('❌ Unknown image format, using placeholder');
    return placeholder;
  }

  // Helper method to get the main product image
  getMainProductImage(): string {
    // Use normalized productImageUrls
    if (this.productImageUrls && this.productImageUrls[this.selectedImageIndex]) {
      return this.productImageUrls[this.selectedImageIndex];
    }

    if (this.productImageUrls && this.productImageUrls.length > 0) {
      return this.productImageUrls[0];
    }

    if (this.data?.image) {
  // Ensure any legacy/local data image is normalized to a full URL
  return this.getProductImage(this.data.image);
    }

    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  // ...temporary debug methods removed

  // Helper method to get product images array with proper URLs
  getProductImages(): string[] {
  if (this.productImageUrls && this.productImageUrls.length > 0) return this.productImageUrls;
  if (this.product?.images) return this.normalizeProductImages(this.product.images);
  return ['/assets/images/placeholder.jpg'];
  }
}
