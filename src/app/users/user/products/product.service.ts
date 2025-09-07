import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EndPoints } from '../../../shared/endpoints/apiEndpoints';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private http: HttpClient
  ) { }

  public addNewProduct(payload: any) {
    const url = EndPoints.APIURL.addProduct.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.post<any>(url, payload);
  }

  public getAllProduct() {
    const url = EndPoints.APIURL.getAllProduct.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.get<any>(url);
  }

  // Enhanced methods for e-commerce functionality
  public getProducts(): Observable<any> {
    return this.getAllProduct();
  }

  public getProduct(productId: string): Observable<any> {
    const url = EndPoints.APIURL.getProductById
      .replace('{0}', environment.serviceBaseUrls.DOMAIN01)
      .replace('{1}', productId);
    return this.http.get<any>(url);
  }

  public getRelatedProducts(categoryId: string, excludeProductId: string): Observable<any> {
    const url = EndPoints.APIURL.getRelatedProducts
      .replace('{0}', environment.serviceBaseUrls.DOMAIN01)
      .replace('{1}', categoryId)
      .replace('{2}', excludeProductId);
    return this.http.get<any>(url);
  }

  public getFeaturedProducts(): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockProducts = {
          success: true,
          products: [
            {
              _id: '1',
              productName: 'Modern Sectional Sofa',
              productPrice: 45999,
              originalPrice: 59999,
              category: 'Living Room',
              images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
              featured: true,
              inStock: true,
              rating: 4.5
            },
            {
              _id: '2',
              productName: 'Oak Wood Dining Table',
              productPrice: 32999,
              originalPrice: 39999,
              category: 'Dining Room',
              images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
              featured: true,
              inStock: true,
              rating: 4.3
            },
            {
              _id: '3',
              productName: 'Executive Office Chair',
              productPrice: 15999,
              originalPrice: 19999,
              category: 'Office',
              images: ['https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400'],
              featured: true,
              inStock: true,
              rating: 4.7
            }
          ]
        };
        observer.next(mockProducts);
        observer.complete();
      }, 300);
    });
  }

  public searchProducts(query: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockResults = {
          success: true,
          products: [
            {
              _id: '1',
              productName: 'Designer Coffee Table',
              productPrice: 18999,
              originalPrice: 24999,
              category: 'Living Room',
              images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
              inStock: true,
              rating: 4.5
            }
          ]
        };
        observer.next(mockResults);
        observer.complete();
      }, 500);
    });
  }

  public getProductsByCategory(category: string): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const mockProducts = {
          success: true,
          products: [
            {
              _id: '1',
              productName: 'Premium Storage Cabinet',
              productPrice: 22999,
              originalPrice: 28999,
              category: category,
              images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
              inStock: true,
              rating: 4.5
            }
          ]
        };
        observer.next(mockProducts);
        observer.complete();
      }, 400);
    });
  }
}
