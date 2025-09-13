import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Product {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    _id: string;
    name: string;
    slug: string;
  };
  brand?: string;
  images: {
    url: string;
    alt: string;
    isPrimary: boolean;
  }[];
  specifications?: {
    name: string;
    value: string;
    unit?: string;
    category?: string;
  }[];
  features?: string[];
  technicalSpecs?: {
    category: string;
    specs: {
      name: string;
      value: string;
      unit?: string;
    }[];
  }[];
  badge?: 'new' | 'sale' | 'hot' | 'featured' | 'limited' | 'bestseller';
  rating?: {
    average: number;
    count: number;
  };
  inventory: {
    quantity: number;
    sku?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    lowStockAlert: number;
  };
  variants?: any[];
  hasVariants: boolean;
  tags: string[];
  relatedProducts?: Product[];
  crossSellProducts?: Product[];
  featured: boolean;
  topRated: boolean;
  status: 'active' | 'inactive' | 'discontinued' | 'draft';
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    slug: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  slug?: string;
}

export interface PromoCard {
  id: string;
  title: string;
  price: number;
  image: string;
  link: string;
}

export interface HomepageData {
  hero: {
    banner: string | null;
    title: string;
    subtitle: string;
    description: string;
    ctaButtons: Array<{text: string, link: string, type: string}>;
  };
  promoCards: PromoCard[];
  featuredProducts: Product[];
  topRatedProducts: Product[];
  blogCards: BlogPost[];
  testimonial: {
    text: string;
    link: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  navLinks: string[];
}

@Injectable({
  providedIn: 'root'
})
export class EcommerceApiService {
  private baseUrl = 'http://localhost:3000/api';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  private handleError = (error: any): Observable<any> => {
    console.error('API Error:', error);
    this.setLoading(false);
    throw error;
  };

  // Homepage APIs
  getHomepageData(): Observable<HomepageData> {
    this.setLoading(true);
    return this.http.get<{success: boolean, data: HomepageData}>(`${this.baseUrl}/home/data`)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  // Enhanced Product APIs
  getAllProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    topRated?: boolean;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Observable<{products: Product[], pagination: any}> {
    this.setLoading(true);
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<{success: boolean, products: Product[], pagination: any}>(`${this.baseUrl}/products`, { params: httpParams })
      .pipe(
        map(response => {
          this.setLoading(false);
          return {
            products: response.products,
            pagination: response.pagination
          };
        }),
        catchError(this.handleError)
      );
  }

  getFeaturedProducts(limit: number = 5): Observable<Product[]> {
    return this.http.get<{success: boolean, products: Product[]}>(`${this.baseUrl}/products/featured?limit=${limit}`)
      .pipe(
        map(response => response.products),
        catchError(this.handleError)
      );
  }

  getTopRatedProducts(limit: number = 4): Observable<Product[]> {
    return this.http.get<{success: boolean, products: Product[]}>(`${this.baseUrl}/products/top-rated?limit=${limit}`)
      .pipe(
        map(response => response.products),
        catchError(this.handleError)
      );
  }

  getProductById(id: string): Observable<Product> {
    this.setLoading(true);
    return this.http.get<{success: boolean, product: Product}>(`${this.baseUrl}/products/${id}`)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response.product;
        }),
        catchError(this.handleError)
      );
  }

  getProductBySlug(slug: string): Observable<Product> {
    this.setLoading(true);
    return this.http.get<{success: boolean, product: Product}>(`${this.baseUrl}/products/slug/${slug}`)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response.product;
        }),
        catchError(this.handleError)
      );
  }

  searchProducts(params: {
    q: string;
    page?: number;
    limit?: number;
  }): Observable<{products: Product[], pagination: any, searchQuery: string}> {
    this.setLoading(true);
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<{success: boolean, products: Product[], pagination: any, searchQuery: string}>(`${this.baseUrl}/products/search`, { params: httpParams })
      .pipe(
        map(response => {
          this.setLoading(false);
          return {
            products: response.products,
            pagination: response.pagination,
            searchQuery: response.searchQuery
          };
        }),
        catchError(this.handleError)
      );
  }

  getProductsByCategory(categoryId: string, params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Observable<{products: Product[], pagination: any, totalProducts: number}> {
    this.setLoading(true);
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<{success: boolean, products: Product[], pagination: any, totalProducts: number}>(`${this.baseUrl}/products/category/${categoryId}`, { params: httpParams })
      .pipe(
        map(response => {
          this.setLoading(false);
          return {
            products: response.products,
            pagination: response.pagination,
            totalProducts: response.totalProducts
          };
        }),
        catchError(this.handleError)
      );
  }

  getDealProducts(page: number = 1, limit: number = 20): Observable<{products: Product[], pagination: any}> {
    this.setLoading(true);
    return this.http.get<{success: boolean, data: Product[], pagination: any}>(`${this.baseUrl}/home/deals?page=${page}&limit=${limit}`)
      .pipe(
        map(response => {
          this.setLoading(false);
          return {
            products: response.data,
            pagination: response.pagination
          };
        }),
        catchError(this.handleError)
      );
  }

  // Blog APIs
  getAllBlogs(params: {
    page?: number;
    limit?: number;
    status?: string;
    featured?: boolean;
    category?: string;
  } = {}): Observable<{blogs: BlogPost[], pagination: any}> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get<{success: boolean, data: BlogPost[], pagination: any}>(`${this.baseUrl}/blogs/all`, { params: httpParams })
      .pipe(
        map(response => ({
          blogs: response.data,
          pagination: response.pagination
        })),
        catchError(this.handleError)
      );
  }

  getFeaturedBlogs(limit: number = 2): Observable<BlogPost[]> {
    return this.http.get<{success: boolean, data: BlogPost[]}>(`${this.baseUrl}/blogs/featured?limit=${limit}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getLatestBlogs(limit: number = 2): Observable<BlogPost[]> {
    return this.http.get<{success: boolean, data: BlogPost[]}>(`${this.baseUrl}/blogs/latest?limit=${limit}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  getBlogById(id: string): Observable<BlogPost> {
    return this.http.get<{success: boolean, data: BlogPost}>(`${this.baseUrl}/blogs/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Promo APIs
  getActivePromos(limit: number = 3): Observable<PromoCard[]> {
    return this.http.get<{success: boolean, data: PromoCard[]}>(`${this.baseUrl}/promos/active?limit=${limit}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  // Newsletter APIs
  subscribeNewsletter(email: string, source: string = 'homepage'): Observable<{message: string}> {
    return this.http.post<{success: boolean, message: string}>(`${this.baseUrl}/newsletter/subscribe`, { email, source })
      .pipe(
        map(response => ({ message: response.message })),
        catchError(this.handleError)
      );
  }

  unsubscribeNewsletter(email: string): Observable<{message: string}> {
    return this.http.post<{success: boolean, message: string}>(`${this.baseUrl}/newsletter/unsubscribe`, { email })
      .pipe(
        map(response => ({ message: response.message })),
        catchError(this.handleError)
      );
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = '£'): string {
    return `${currency}${amount.toFixed(2)}`;
  }

  calculateDiscount(originalPrice: number, salePrice: number): number {
    if (!originalPrice || originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  }
}
