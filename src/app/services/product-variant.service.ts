import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductVariant {
  _id: string;
  product: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  inventory: {
    quantity: number;
    lowStockAlert: number;
  };
  attributes: {
    name: string;
    value: string;
  }[];
  specifications: {
    name: string;
    value: string;
    unit?: string;
  }[];
  images: {
    url: string;
    alt: string;
    isPrimary: boolean;
  }[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttribute {
  name: string;
  values: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductVariantService {
  private apiUrl = `${environment.apiUrl}/variants`;

  constructor(private http: HttpClient) { }

  // Create new product variant
  createVariant(variantData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, variantData);
  }

  // Get all variants for a product
  getProductVariants(productId: string, includeInactive = false): Observable<any> {
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    return this.http.get<any>(`${this.apiUrl}/product/${productId}`, { params });
  }

  // Get variant by ID
  getVariantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Update product variant
  updateVariant(id: string, variantData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, variantData);
  }

  // Delete product variant
  deleteVariant(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Get variants filtered by attributes
  getVariantsByAttributes(productId: string, attributes: any): Observable<any> {
    let params = new HttpParams();
    params = params.set('attributes', JSON.stringify(attributes));
    return this.http.get<any>(`${this.apiUrl}/product/${productId}/filter`, { params });
  }

  // Get unique attributes for a product
  getProductAttributes(productId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/product/${productId}/attributes`);
  }

  // Update variant inventory
  updateVariantInventory(id: string, inventory: { quantity: number; lowStockAlert: number }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/inventory`, inventory);
  }

  // Helper methods for variant management
  getDefaultVariant(variants: ProductVariant[]): ProductVariant | null {
    return variants.find(variant => variant.isDefault) || variants[0] || null;
  }

  getVariantPrice(variant: ProductVariant): number {
    return variant.price;
  }

  getVariantOriginalPrice(variant: ProductVariant): number {
    return variant.originalPrice || variant.price;
  }

  hasDiscount(variant: ProductVariant): boolean {
    return variant.originalPrice ? variant.originalPrice > variant.price : false;
  }

  getDiscountPercentage(variant: ProductVariant): number {
    if (!this.hasDiscount(variant)) return 0;
    return Math.round(((variant.originalPrice! - variant.price) / variant.originalPrice!) * 100);
  }

  isInStock(variant: ProductVariant): boolean {
    return variant.inventory.quantity > 0;
  }

  isLowStock(variant: ProductVariant): boolean {
    return variant.inventory.quantity <= variant.inventory.lowStockAlert;
  }

  getVariantAttributes(variant: ProductVariant): { [key: string]: string } {
    const attributes: { [key: string]: string } = {};
    variant.attributes.forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  }

  getVariantsByAttribute(variants: ProductVariant[], attributeName: string, attributeValue: string): ProductVariant[] {
    return variants.filter(variant =>
      variant.attributes.some(attr =>
        attr.name === attributeName && attr.value === attributeValue
      )
    );
  }

  // Format methods for display
  formatVariantName(variant: ProductVariant): string {
    const attributes = variant.attributes
      .map(attr => `${attr.name}: ${attr.value}`)
      .join(', ');
    return `${variant.name}${attributes ? ` (${attributes})` : ''}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  formatWeight(weight: number): string {
    return `${weight} kg`;
  }

  formatDimensions(dimensions: any): string {
    if (!dimensions || !dimensions.length || !dimensions.width || !dimensions.height) {
      return '';
    }
    return `${dimensions.length} x ${dimensions.width} x ${dimensions.height} ${dimensions.unit || 'cm'}`;
  }

  // Variant selection helpers
  getAvailableAttributeValues(variants: ProductVariant[], attributeName: string, selectedAttributes: { [key: string]: string }): string[] {
    // Filter variants that match already selected attributes
    const filteredVariants = variants.filter(variant => {
      return Object.keys(selectedAttributes).every(attrName => {
        if (attrName === attributeName) return true; // Skip the attribute we're getting values for
        return variant.attributes.some(attr =>
          attr.name === attrName && attr.value === selectedAttributes[attrName]
        );
      });
    });

    // Get unique values for the specified attribute
    const values = new Set<string>();
    filteredVariants.forEach(variant => {
      const attr = variant.attributes.find(a => a.name === attributeName);
      if (attr && variant.isActive && variant.inventory.quantity > 0) {
        values.add(attr.value);
      }
    });

    return Array.from(values);
  }

  findVariantByAttributes(variants: ProductVariant[], selectedAttributes: { [key: string]: string }): ProductVariant | null {
    return variants.find(variant => {
      return Object.keys(selectedAttributes).every(attrName => {
        return variant.attributes.some(attr =>
          attr.name === attrName && attr.value === selectedAttributes[attrName]
        );
      });
    }) || null;
  }
}
