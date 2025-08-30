import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AdminProduct {
  _id?: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: File[] | string[];
  badge?: 'new' | 'sale' | 'hot' | 'featured' | 'limited';
  rating?: { average: number; count: number };
  inventory: {
    quantity: number;
    sku?: string;
    weight?: number;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
    };
  };
  tags: string[];
  featured: boolean;
  topRated: boolean;
  status: 'active' | 'inactive' | 'discontinued';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
}

export interface AdminBlog {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  author?: {
    name: string;
    email: string;
    avatar?: string;
  };
  image?: File | string;
  tags: string[];
  category: 'design' | 'tips' | 'trends' | 'reviews' | 'lifestyle';
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
  };
}

export interface AdminPromo {
  _id?: string;
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: File | string;
  link: string;
  type: 'collection' | 'category' | 'product' | 'deal';
  displayOrder: number;
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
}

export interface AdminBanner {
  _id?: string;
  imageUrl: File | string;
  title?: string;
  description?: string;
  link?: string;
  isActive?: boolean;
}

export interface ProductCategory {
  _id?: string;
  categoryName: string;
  description: string;
  discount?: number;
  image: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private baseUrl = 'http://localhost:3000';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  private setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }

  private handleError = (error: any): Observable<any> => {
    console.error('Admin API Error:', error);
    this.setLoading(false);
    throw error;
  };

  // Product Management
  createProduct(productData: AdminProduct): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    // Append text fields
    formData.append('title', productData.title);
    if (productData.subtitle) formData.append('subtitle', productData.subtitle);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    if (productData.originalPrice) {
      formData.append('originalPrice', productData.originalPrice.toString());
    }
    formData.append('category', productData.category);
    if (productData.subcategory) formData.append('subcategory', productData.subcategory);
    if (productData.badge) formData.append('badge', productData.badge);
    formData.append('status', productData.status);

    // Inventory fields
    formData.append('quantity', productData.inventory.quantity.toString());
    if (productData.inventory.sku) formData.append('sku', productData.inventory.sku);
    if (productData.inventory.weight) formData.append('weight', productData.inventory.weight.toString());

    // Boolean fields
    formData.append('featured', productData.featured.toString());
    formData.append('topRated', productData.topRated.toString());

    // Tags
    if (productData.tags && productData.tags.length > 0) {
      formData.append('tags', productData.tags.join(','));
    }

    // SEO fields
    if (productData.seo.metaTitle) formData.append('metaTitle', productData.seo.metaTitle);
    if (productData.seo.metaDescription) formData.append('metaDescription', productData.seo.metaDescription);
    if (productData.seo.slug) formData.append('slug', productData.seo.slug);

    // Append images
    if (productData.images && Array.isArray(productData.images)) {
      (productData.images as File[]).forEach((file) => {
        if (file instanceof File) {
          formData.append('images', file);
        }
      });
    }

    return this.http.post(`${this.baseUrl}/api/products/create`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateProduct(id: string, productData: AdminProduct): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    // Append all fields similar to createProduct
    Object.keys(productData).forEach(key => {
      const value = (productData as any)[key];
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file: File) => {
          if (file instanceof File) {
            formData.append('images', file);
          }
        });
      } else if (key === 'tags' && Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else if (key === 'inventory' && typeof value === 'object') {
        formData.append('quantity', value.quantity.toString());
        formData.append('sku', value.sku || '');
        formData.append('weight', value.weight?.toString() || '');
      } else if (key === 'seo' && typeof value === 'object') {
        formData.append('metaTitle', value.metaTitle || '');
        formData.append('metaDescription', value.metaDescription || '');
        formData.append('slug', value.slug || '');
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    return this.http.put(`${this.baseUrl}/api/products/${id}`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/products/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAllProducts(params: any = {}): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });

    return this.http.get(`${this.baseUrl}/api/products/all`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // Category Management
  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${this.baseUrl}/products/getAllProduct`)
      .pipe(
        map((response: any) => response || []),
        catchError(this.handleError)
      );
  }

  createCategory(categoryData: any): Observable<any> {
    const formData = new FormData();
    formData.append('categoryName', categoryData.categoryName);
    formData.append('description', categoryData.description);
    formData.append('discount', categoryData.discount?.toString() || '0');

    if (categoryData.image instanceof File) {
      formData.append('image', categoryData.image);
    }

    return this.http.post(`${this.baseUrl}/products/create-products`, formData)
      .pipe(catchError(this.handleError));
  }

  // Blog Management
  createBlog(blogData: AdminBlog): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    formData.append('title', blogData.title);
    formData.append('excerpt', blogData.excerpt);
    formData.append('content', blogData.content);
    formData.append('authorName', blogData.author?.name || 'Admin');
    formData.append('authorEmail', blogData.author?.email || 'admin@example.com');
    formData.append('category', blogData.category);
    formData.append('status', blogData.status);
    formData.append('featured', blogData.featured.toString());
    formData.append('tags', blogData.tags.join(','));
    formData.append('metaTitle', blogData.seo?.metaTitle || '');
    formData.append('metaDescription', blogData.seo?.metaDescription || '');
    formData.append('slug', blogData.seo?.slug || '');

    if (blogData.image instanceof File) {
      formData.append('image', blogData.image);
    }

    return this.http.post(`${this.baseUrl}/api/blogs/create`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateBlog(id: string, blogData: AdminBlog): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    // Similar to createBlog but for updates
    Object.keys(blogData).forEach(key => {
      const value = (blogData as any)[key];
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'tags' && Array.isArray(value)) {
        formData.append(key, value.join(','));
      } else if (key === 'author' && typeof value === 'object') {
        formData.append('authorName', value.name);
        formData.append('authorEmail', value.email);
      } else if (key === 'seo' && typeof value === 'object') {
        formData.append('metaTitle', value.metaTitle || '');
        formData.append('metaDescription', value.metaDescription || '');
        formData.append('slug', value.slug || '');
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    return this.http.put(`${this.baseUrl}/api/blogs/${id}`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteBlog(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/blogs/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAllBlogs(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/blogs/all`)
      .pipe(catchError(this.handleError));
  }

  // Promo Management
  createPromo(promoData: AdminPromo): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    formData.append('title', promoData.title);
    formData.append('description', promoData.description || '');
    formData.append('price', promoData.price.toString());
    if (promoData.originalPrice) {
      formData.append('originalPrice', promoData.originalPrice.toString());
    }
    formData.append('link', promoData.link);
    formData.append('type', promoData.type);
    formData.append('displayOrder', promoData.displayOrder.toString());
    formData.append('isActive', promoData.isActive.toString());

    if (promoData.validFrom) {
      formData.append('validFrom', promoData.validFrom.toISOString());
    }
    if (promoData.validUntil) {
      formData.append('validUntil', promoData.validUntil.toISOString());
    }

    if (promoData.image instanceof File) {
      formData.append('image', promoData.image);
    }

    return this.http.post(`${this.baseUrl}/api/promos/create`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updatePromo(id: string, promoData: AdminPromo): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    // Similar to createPromo
    Object.keys(promoData).forEach(key => {
      const value = (promoData as any)[key];
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
      } else if (key === 'validFrom' || key === 'validUntil') {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    return this.http.put(`${this.baseUrl}/api/promos/${id}`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deletePromo(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/promos/${id}`)
      .pipe(catchError(this.handleError));
  }

  getAllPromos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/promos/all`)
      .pipe(catchError(this.handleError));
  }

  // Banner Management
  createBanner(bannerData: AdminBanner): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    // The backend expects only a 'banner' field with the image file
    if (bannerData.imageUrl instanceof File) {
      formData.append('banner', bannerData.imageUrl);
    }

    return this.http.post(`${this.baseUrl}/create-banner`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getAllBanners(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getAllBanners`)
      .pipe(
        map((response: any) => {
          // Wrap response in data property to match expected structure
          return { data: response || [] };
        }),
        catchError(this.handleError)
      );
  }

  getLatestBanner(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getLatestBanner`)
      .pipe(catchError(this.handleError));
  }

  updateBanner(id: string, bannerData: AdminBanner): Observable<any> {
    this.setLoading(true);
    const formData = new FormData();

    if (bannerData.imageUrl instanceof File) {
      formData.append('banner', bannerData.imageUrl);
    }

    return this.http.put(`${this.baseUrl}/update-banner/${id}`, formData)
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteBanner(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-banner/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Newsletter Management
  getAllSubscribers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/newsletter/subscribers`)
      .pipe(catchError(this.handleError));
  }

  getNewsletterStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/newsletter/stats`)
      .pipe(catchError(this.handleError));
  }

  addSubscriber(subscriberData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/newsletter/subscribe`, subscriberData)
      .pipe(catchError(this.handleError));
  }

  updateSubscriber(id: string, subscriberData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/newsletter/subscribers/${id}`, subscriberData)
      .pipe(catchError(this.handleError));
  }

  deleteSubscriber(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/newsletter/subscribers/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Review Management
  getAllReviews(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/reviews/all`)
      .pipe(catchError(this.handleError));
  }

  updateReview(id: string, reviewData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/reviews/${id}`, reviewData)
      .pipe(catchError(this.handleError));
  }

  deleteReview(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/reviews/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Dashboard Analytics
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/home/data`)
      .pipe(
        map((response: any) => {
          // Extract stats from homepage data
          const data = response.data;
          return {
            totalProducts: data.featuredProducts?.length + data.topRatedProducts?.length || 0,
            totalBlogs: data.blogCards?.length || 0,
            totalPromos: data.promoCards?.length || 0,
            featuredProducts: data.featuredProducts?.length || 0,
            topRatedProducts: data.topRatedProducts?.length || 0
          };
        }),
        catchError(this.handleError)
      );
  }
}
