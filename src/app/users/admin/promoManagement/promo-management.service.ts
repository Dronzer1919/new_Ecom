import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EndPoints } from '../../../shared/endpoints/apiEndpoints';

export interface PromoCode {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping' | 'buy_one_get_one';
  discountValue: number;
  code?: string;
  minOrderValue: number;
  price?: number; // Legacy field
  originalPrice?: number; // Legacy field
  image?: File | string;
  usageLimit: number;
  usedCount?: number;
  perUserLimit: number;
  startDate: Date;
  endDate: Date;
  targetAudience: 'all' | 'new' | 'returning' | 'vip';
  featured: boolean;
  combinable: boolean;
  status: 'active' | 'inactive' | 'expired';
  buttonText: string;
  buttonLink: string;
  // Legacy fields
  link?: string;
  type?: 'collection' | 'category' | 'product' | 'deal';
  displayOrder?: number;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PromoManagementService {

  constructor(private http: HttpClient) { }

  // Create new promo
  public createPromo(payload: PromoCode): Observable<any> {
    const url = EndPoints.APIURL.createPromo.replace('{0}', environment.serviceBaseUrls.DOMAIN01);

    const formData = new FormData();

    // Basic fields
    formData.append('title', payload.title);
    if (payload.subtitle) formData.append('subtitle', payload.subtitle);
    if (payload.description) formData.append('description', payload.description);

    // Discount configuration
    formData.append('discountType', payload.discountType);
    formData.append('discountValue', payload.discountValue.toString());
    if (payload.code) formData.append('code', payload.code.toUpperCase());
    formData.append('minOrderValue', payload.minOrderValue.toString());

    // Legacy price fields
    if (payload.price) formData.append('price', payload.price.toString());
    if (payload.originalPrice) formData.append('originalPrice', payload.originalPrice.toString());

    // Image
    if (payload.image instanceof File) {
      formData.append('image', payload.image);
    }

    // Usage limits
    formData.append('usageLimit', payload.usageLimit.toString());
    formData.append('perUserLimit', payload.perUserLimit.toString());

    // Timing
    formData.append('startDate', payload.startDate.toISOString());
    formData.append('endDate', payload.endDate.toISOString());

    // Targeting
    formData.append('targetAudience', payload.targetAudience);

    // Settings
    formData.append('featured', payload.featured.toString());
    formData.append('combinable', payload.combinable.toString());
    formData.append('status', payload.status);

    // Call to Action
    formData.append('buttonText', payload.buttonText);
    formData.append('buttonLink', payload.buttonLink);
    
    // Legacy fields
    if (payload.type) formData.append('type', payload.type);
    if (payload.displayOrder !== undefined && payload.displayOrder !== null) {
      formData.append('displayOrder', payload.displayOrder.toString());
    } else {
      formData.append('displayOrder', '0');
    }

    return this.http.post<any>(url, formData);
  }

  // Get all promos
  public getAllPromos(): Observable<any> {
    const url = EndPoints.APIURL.getAllPromos.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.get<any>(url);
  }

  // Get active promos
  public getActivePromos(limit?: number): Observable<any> {
    const url = EndPoints.APIURL.getActivePromos.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    const params = limit ? `?limit=${limit}` : '';
    return this.http.get<any>(url + params);
  }

  // Get promo by ID
  public getPromoById(id: string): Observable<any> {
    const url = EndPoints.APIURL.getPromoById.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', id);
    return this.http.get<any>(url);
  }

  // Update promo
  public updatePromo(id: string, payload: PromoCode): Observable<any> {
    const url = EndPoints.APIURL.updatePromo.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', id);

    const formData = new FormData();

    // Basic fields
    formData.append('title', payload.title);
    if (payload.subtitle) formData.append('subtitle', payload.subtitle);
    if (payload.description) formData.append('description', payload.description);

    // Discount configuration
    formData.append('discountType', payload.discountType);
    formData.append('discountValue', payload.discountValue.toString());
    if (payload.code) formData.append('code', payload.code.toUpperCase());
    formData.append('minOrderValue', payload.minOrderValue.toString());

    // Legacy price fields
    if (payload.price) formData.append('price', payload.price.toString());
    if (payload.originalPrice) formData.append('originalPrice', payload.originalPrice.toString());

    // Image
    if (payload.image instanceof File) {
      formData.append('image', payload.image);
    }

    // Usage limits
    formData.append('usageLimit', payload.usageLimit.toString());
    formData.append('perUserLimit', payload.perUserLimit.toString());

    // Timing
    formData.append('startDate', payload.startDate.toISOString());
    formData.append('endDate', payload.endDate.toISOString());

    // Targeting
    formData.append('targetAudience', payload.targetAudience);

    // Settings
    formData.append('featured', payload.featured.toString());
    formData.append('combinable', payload.combinable.toString());
    formData.append('status', payload.status);

    // Call to Action
    formData.append('buttonText', payload.buttonText);
    formData.append('buttonLink', payload.buttonLink);
    
    // Legacy fields
    if (payload.type) formData.append('type', payload.type);
    if (payload.displayOrder !== undefined && payload.displayOrder !== null) {
      formData.append('displayOrder', payload.displayOrder.toString());
    } else {
      formData.append('displayOrder', '0');
    }

    return this.http.put<any>(url, formData);
  }

  // Delete promo
  public deletePromo(id: string): Observable<any> {
    const url = EndPoints.APIURL.deletePromo.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', id);
    return this.http.delete<any>(url);
  }

  // Validate promo code
  public validatePromoCode(code: string, orderValue?: number): Observable<any> {
    const url = EndPoints.APIURL.validatePromoCode.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    const payload = { code, orderValue };
    return this.http.post<any>(url, payload);
  }

  // Apply promo code
  public applyPromoCode(code: string): Observable<any> {
    const url = EndPoints.APIURL.applyPromoCode.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    const payload = { code };
    return this.http.post<any>(url, payload);
  }

  // Helper method to format currency in rupees
  public formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Helper method to calculate discount amount
  public calculateDiscount(discountType: string, discountValue: number, orderValue: number): number {
    switch (discountType) {
      case 'percentage':
        return (orderValue * discountValue) / 100;
      case 'fixed':
        return discountValue;
      case 'free_shipping':
        return 0; // Free shipping value would be calculated separately
      case 'buy_one_get_one':
        return 0; // BOGO discount would be calculated based on products
      default:
        return 0;
    }
  }
}
