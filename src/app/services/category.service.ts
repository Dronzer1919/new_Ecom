import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  slug: string;
  parentCategory?: string | Category;
  level: number;
  sortOrder: number;
  isActive: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  children?: Category[];
  productsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTree {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  children?: CategoryTree[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private categoryTreeSubject = new BehaviorSubject<CategoryTree[]>([]);

  public categories$ = this.categoriesSubject.asObservable();
  public categoryTree$ = this.categoryTreeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCategories();
    this.loadCategoryTree();
  }

  // Create new category
  createCategory(categoryData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, categoryData);
  }

  // Get all categories
  getAllCategories(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}`, { params: httpParams });
  }

  // Get categories tree structure
  getCategoriesTree(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tree`);
  }

  // Get category by ID
  getCategoryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Get category by slug
  getCategoryBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/slug/${slug}`);
  }

  // Update category
  updateCategory(id: string, categoryData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoryData);
  }

  // Delete category
  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Get subcategories by parent ID
  getSubcategories(parentId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${parentId}/subcategories`);
  }

  // Reorder categories
  reorderCategories(categoryIds: string[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reorder`, { categoryIds });
  }

  // Load categories and update subject
  loadCategories(): void {
    this.getAllCategories().subscribe({
      next: (response) => {
        if (response.success) {
          this.categoriesSubject.next(response.categories);
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  // Load category tree and update subject
  loadCategoryTree(): void {
    this.getCategoriesTree().subscribe({
      next: (response) => {
        if (response.success) {
          this.categoryTreeSubject.next(response.categoriesTree);
        }
      },
      error: (error) => {
        console.error('Error loading category tree:', error);
      }
    });
  }

  // Helper methods
  getMainCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.apiUrl}?level=0`).pipe(
      map((response: any) => response.success ? response.categories : [])
    );
  }

  getCategoryPath(categoryId: string): Observable<Category[]> {
    // This would build the breadcrumb path for a category
    return this.getCategoryById(categoryId).pipe(
      map((response: any) => {
        if (!response.success) return [];

        const path: Category[] = [];
        let current = response.category;

        while (current) {
          path.unshift(current);
          current = current.parentCategory;
        }

        return path;
      })
    );
  }

  // Format category for display
  formatCategoryBreadcrumb(categories: Category[]): string {
    return categories.map(cat => cat.name).join(' > ');
  }
}
