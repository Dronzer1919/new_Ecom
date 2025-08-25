import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { EcommerceApiService, Product as ApiProduct, BlogPost, PromoCard, HomepageData } from '../../../../services/ecommerce-api.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  navLinks = ['Home', 'Products', 'Accessories', 'Lighting', 'Blog', 'Contact'];

  // API-driven data
  heroData: any = null;
  promoCards: PromoCard[] = [];
  featuredProducts: ApiProduct[] = [];
  topRatedProducts: ApiProduct[] = [];
  blogCards: BlogPost[] = [];

  // Loading state
  isLoading = false;

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
    { id: 8, title: 'Green Cover Chair', price: 279.00, image: 'assets/furniture/chair-8.jpg', rating: 4 },
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

  constructor(private apiService: EcommerceApiService) {}

  ngOnInit(): void {
    console.log('🏠 Home component initialized');
    this.loadHomepageData();
    // this.initializeCountdown();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timer) clearInterval(this.timer);
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

          // Process hero data to ensure proper URLs and banners array
          this.heroData = data.hero;
          if (this.heroData) {
            // If backend returns banners array, use it
            if (Array.isArray(this.heroData.banners)) {
              this.heroData.banners = this.heroData.banners.map((url: string) => url.startsWith('http') ? url : `http://localhost:3000${url}`);
            } else if (this.heroData.banner) {
              // If only a single banner, convert to array
              const bannerUrl = this.heroData.banner.startsWith('http') ? this.heroData.banner : `http://localhost:3000${this.heroData.banner}`;
              this.heroData.banners = [bannerUrl];
            } else {
              this.heroData.banners = [];
            }
          }

          this.promoCards = data.promoCards || [];
          this.featuredProducts = data.featuredProducts || [];
          this.topRatedProducts = data.topRatedProducts || [];
          this.blogCards = data.blogCards || [];
          this.navLinks = data.navLinks || this.navLinks;
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
}
