import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { EcommerceApiService, Product as ApiProduct, BlogPost, PromoCard, HomepageData } from '../../../../services/ecommerce-api.service';
import { CartService } from '../../../../services/cart.service';
import { WishlistService } from '../../../../services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare var bootstrap: any;

type Product = {
  id: number;
  title: string;
  subtitle?: string;
  price: number;
  image: string;
  rating?: number; // 0-5
  badge?: 'new' | 'sale' | 'hot';
};

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  navLinks = ['Home', 'Products', 'Accessories', 'Contact Us'];

  // API-driven data
  heroData: any = null;
  promoCards: PromoCard[] = [];
  featuredProducts: ApiProduct[] = [];
  topRatedProducts: ApiProduct[] = [];
  blogCards: BlogPost[] = [];

  // Loading state
  isLoading = false;

  // Wishlist count for floating button
  wishlistCount = 0;

  // Fallback local data (kept for offline/development use)
  localPromoCards = [
    { id: 1, title: '2016 New Collection', price: 520.00, image: 'assets/furniture/promo-1.jpg' },
    { id: 2, title: 'Modern Home Decor', price: 86.00, image: 'assets/furniture/promo-2.jpg' },
    { id: 3, title: 'Concept Floor Lamp', price: 119.90, image: 'assets/furniture/promo-3.jpg' }
  ];

  localFeaturedProducts: Product[] = [
    { id: 1, title: 'The Signature Chair', price: 499.00, image: 'assets/furniture/chair-1.jpg', rating: 5 },
    { id: 2, title: 'Normal Classic Chair', price: 259.00, image: 'assets/furniture/chair-2.jpg', rating: 4 },
    { id: 3, title: 'Blue Wing Chair', price: 319.00, image: 'assets/furniture/chair-3.jpg', rating: 4, badge: 'new' },
    { id: 4, title: 'Modern Red Chair', price: 289.00, image: 'assets/furniture/chair-4.jpg', rating: 5, badge: 'sale' },
    { id: 5, title: 'Black Wood Chair', price: 199.00, image: 'assets/furniture/chair-5.jpg', rating: 3 }
  ];

  localTopRated: Product[] = [
    { id: 6, title: 'The Signature Chair', price: 499.00, image: 'assets/furniture/chair-6.jpg', rating: 5 },
    { id: 7, title: 'Normal Classic Chair', price: 259.00, image: 'assets/furniture/chair-7.jpg', rating: 5 },
    { id: 8, title: 'Wooden Frame Chair', price: 279.00, image: 'assets/furniture/chair-8.jpg', rating: 4 },
    { id: 9, title: 'Black Wood Chair', price: 219.00, image: 'assets/furniture/chair-9.jpg', rating: 4 }
  ];

  localBlogCards = [
    {
      id: 1,
      title: 'Underground Apartment in Barcelona',
      excerpt: 'Minimal aesthetics with natural wood tones and soft textiles.',
      image: 'assets/furniture/blog-1.jpg',
      date: 'Jul 12, 2025',
      author: 'Design Team'
    },
    {
      id: 2,
      title: 'Nordic Living Room Essentials',
      excerpt: 'Muted palette, functional forms and cozy lighting.',
      image: 'assets/furniture/blog-2.jpg',
      date: 'Aug 01, 2025',
      author: 'Interior Experts'
    }
  ];

  // Countdown (Deals This Week)
  dealEndsAt = new Date();
  private timer?: any;
  countdown = { d: '00', h: '00', m: '00', s: '00' };

  constructor(
    private apiService: EcommerceApiService,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    console.log('🏠 Home component initialized - with cart functionality');
    this.loadHomepageData();
    this.loadWishlistCount();
    // this.initializeCountdown();
  }

  ngAfterViewInit(): void {
    // Initialize carousels with proper auto-slide functionality
    this.initializeCarousels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timer) clearInterval(this.timer);
  }

  private initializeCarousels(): void {
    console.log('🎠 Initializing carousels...');
    // Ensure Bootstrap carousels auto-slide with proper intervals
    setTimeout(() => {
      if (typeof bootstrap !== 'undefined') {
        console.log('🅱️ Bootstrap found, initializing carousels');
        const heroCarousel = document.getElementById('heroCarousel');
  // promoCarousel removed from template; skip querying it
  const featuredCarousel = document.getElementById('featuredProductCarousel');
        const topRatedCarousel = document.getElementById('topRatedProductCarousel');

        if (heroCarousel) {
          console.log('🎯 Initializing hero carousel with banners:', this.heroData?.banners?.length || 0);
          new bootstrap.Carousel(heroCarousel, {
            interval: 3000,
            ride: 'carousel'
          });
        } else {
          console.log('❌ Hero carousel element not found');
        }

  // Promo carousel removed — no initialization needed

        if (featuredCarousel) {
          console.log('⭐ Initializing featured products carousel');
          new bootstrap.Carousel(featuredCarousel, {
            interval: 5000,
            ride: 'carousel'
          });
        }

        if (topRatedCarousel) {
          console.log('🏆 Initializing top rated products carousel');
          new bootstrap.Carousel(topRatedCarousel, {
            interval: 6000,
            ride: 'carousel'
          });
        }
      } else {
        console.log('❌ Bootstrap not found');
      }
    }, 1000);
  }

  // Public method to refresh data (can be called from template)
  refreshData(): void {
    this.loadHomepageData();
  }

  private loadHomepageData(): void {
    this.isLoading = true;
    console.log('🔄 Loading homepage data...');

    // Try to load from API first
    this.apiService.getHomepageData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: HomepageData) => {
          console.log('✅ Homepage data loaded from API:', data);
          console.log('🏷️ Raw hero data received:', data.hero);

          // Process hero data to ensure proper URLs and banners array
          this.heroData = data.hero;
          if (this.heroData) {
            console.log('🎯 Processing hero data...');
            console.log('🔍 Original heroData:', this.heroData);

            // If backend returns banners array, use it
            if (Array.isArray(this.heroData.banners)) {
              console.log('📊 Found banners array:', this.heroData.banners);
              this.heroData.banners = this.heroData.banners.map((url: string) => url.startsWith('http') ? url : `http://localhost:3000${url}`);
              console.log('🌐 Processed banners with full URLs:', this.heroData.banners);
            } else if (this.heroData.banner) {
              console.log('📷 Found single banner:', this.heroData.banner);
              // If only a single banner, convert to array
              const bannerUrl = this.heroData.banner.startsWith('http') ? this.heroData.banner : `http://localhost:3000${this.heroData.banner}`;
              this.heroData.banners = [bannerUrl];
              console.log('🔄 Converted single banner to array:', this.heroData.banners);
            } else {
              console.log('❌ No banners found in hero data');
              this.heroData.banners = [];
            }

            console.log('✨ Final processed heroData:', this.heroData);
            console.log('📸 Final banners array length:', this.heroData.banners.length);
          } else {
            console.log('⚠️ No hero data received from API');
          }

          this.promoCards = data.promoCards || [];
          this.featuredProducts = data.featuredProducts || [];
          this.topRatedProducts = data.topRatedProducts || [];
          this.blogCards = data.blogCards || [];
          this.navLinks = data.navLinks || this.navLinks;

          console.log('📦 Promo cards count:', this.promoCards.length);
          console.log('⭐ Featured products count:', this.featuredProducts.length);
          console.log('🏆 Top rated products count:', this.topRatedProducts.length);
          console.log('📝 Blog cards count:', this.blogCards.length);

          this.isLoading = false;
        },
        error: (error) => {
          console.warn('⚠️ API failed, using local data:', error);
          this.loadLocalData();
          this.isLoading = false;
        }
      });
  }

  private loadLocalData(): void {
    console.log('🔄 Loading fallback local data...');
    // Fallback to local data
    this.heroData = {
      banner: '/assets/hero-furniture.jpg',
      title: 'Modern Furniture for Your Home',
      subtitle: 'Contemporary Design',
      description: 'Discover our collection of contemporary furniture designed to transform your living space.',
      ctaButtons: [
        { text: 'Shop Now', link: '/products', type: 'primary' },
        { text: 'Learn More', link: '/about', type: 'secondary' }
      ]
    };

    console.log('🏠 Local hero data set:', this.heroData);

    this.promoCards = this.localPromoCards.map(item => ({
      id: item.id.toString(),
      title: item.title,
      price: item.price,
      image: item.image,
      link: '#'
    }));

    this.featuredProducts = this.localFeaturedProducts.map(item => ({
      id: item.id.toString(),
      title: item.title,
      price: item.price,
      image: item.image,
      rating: item.rating,
      badge: item.badge
    }));

    this.topRatedProducts = this.localTopRated.map(item => ({
      id: item.id.toString(),
      title: item.title,
      price: item.price,
      image: item.image,
      rating: item.rating
    }));

    this.blogCards = this.localBlogCards.map(item => ({
      id: item.id.toString(),
      title: item.title,
      excerpt: item.excerpt,
      image: item.image,
      date: item.date,
      author: item.author
    }));

    console.log('📊 Local data loaded successfully');
    console.log('🎯 Local promo cards:', this.promoCards.length);
    console.log('⭐ Local featured products:', this.featuredProducts.length);
    console.log('🏆 Local top rated products:', this.topRatedProducts.length);
    console.log('📝 Local blog cards:', this.blogCards.length);
  }

  private initializeCountdown(): void {
    // Set deal to end in 6 days at 23:59:59
    const ends = new Date();
    ends.setDate(ends.getDate() + 6);
    ends.setHours(23, 59, 59, 0);
    this.dealEndsAt = ends;
    this.updateCountdown();
    this.timer = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown(): void {
    const now = new Date().getTime();
    const t = this.dealEndsAt.getTime() - now;
    if (t <= 0) {
      this.countdown = { d: '00', h: '00', m: '00', s: '00' };
      return;
    }
    const d = Math.floor(t / (1000 * 60 * 60 * 24));
    const h = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((t % (1000 * 60)) / 1000);
    this.countdown = {
      d: String(d).padStart(2, '0'),
      h: String(h).padStart(2, '0'),
      m: String(m).padStart(2, '0'),
      s: String(s).padStart(2, '0')
    };
  }

  asCurrency(n: number): string {
    return '£' + n.toFixed(2);
  }

  // Helper methods for template
  getProductImage(product: any): string {
    if (product.images && product.images.length > 0) {
      return `http://localhost:3000/uploads/${product.images[0]}`;
    }
    return product.image || '/assets/placeholder.jpg';
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to chunk arrays for carousel slides
  getProductChunks(products: any[], chunkSize: number): any[][] {
    const chunks: any[][] = [];
    for (let i = 0; i < products.length; i += chunkSize) {
      chunks.push(products.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Helper method to get blog image URL
  getBlogImage(blog: any): string {
    if (blog.image) {
      if (typeof blog.image === 'string') {
        // If it's already a full URL, return as is
        if (blog.image.startsWith('http')) {
          return blog.image;
        }
        // If it's a relative path, construct full URL
        return `http://localhost:3000${blog.image}`;
      } else if (blog.image.url) {
        // If it's an object with url property
        if (blog.image.url.startsWith('http')) {
          return blog.image.url;
        }
        return `http://localhost:3000${blog.image.url}`;
      }
    }

    // Fallback to placeholder or default image
    return blog.image || 'assets/placeholder-blog.jpg';
  }

  // Navigate to product details
  viewProductDetails(product: any): void {
    console.log('🔍 Clicked product:', product);
    const productId = product.id || product._id;
    console.log('🆔 Product ID for navigation:', productId);
    if (productId) {
      console.log('🚀 Navigating to product details:', `/productDetails/${productId}`);
      // Store product data for compatibility
      localStorage.setItem('details', JSON.stringify(product));
      this.router.navigate(['/productDetails', productId]);
    } else {
      console.error('❌ No product ID found for navigation');
    }
  }

  // Simple test method to verify clicks work
  testClick(): void {
    console.log('🧪 TEST CLICK WORKS!');
    alert('Click is working!');
  }

  // Navigate to product list
  viewAllProducts(): void {
    this.router.navigate(['/products']);
  }

  // Add product to cart
  addToCart(product: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // Convert API product to cart format
    const cartProduct = {
      id: product.id || product._id,
      productName: product.title || product.productName,
      price: product.price,
      images: product.images ? [`http://localhost:3000/uploads/${product.images[0]}`] : [product.image],
      category: product.category,
      stock: product.stock || 10,
      weight: product.weight || '500gm'
    };

    this.cartService.addToCart(cartProduct, 1);
    this.toastr.success(`${cartProduct.productName} added to cart!`);
  }

  // Add product to wishlist
  addToWishlist(product: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const wishlistProduct = {
      id: product.id || product._id,
      productName: product.title || product.productName,
      price: product.price,
      images: product.images ? [`http://localhost:3000/uploads/${product.images[0]}`] : [product.image],
      category: product.category
    };

    this.wishlistService.addToWishlist(wishlistProduct).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.message);
          this.loadWishlistCount(); // Update count after adding
        } else {
          this.toastr.info(response.message);
        }
      }
    });
  }

  // Check if product is in wishlist
  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  // Load wishlist count for floating button
  private loadWishlistCount(): void {
    this.wishlistService.wishlistItems$.subscribe(items => {
      this.wishlistCount = items.length;
    });
  }

  // Navigate to wishlist page
  viewWishlist(): void {
    this.router.navigate(['/wishlist']);
  }
}
