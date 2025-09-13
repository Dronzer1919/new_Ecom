import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../services/category.service';
import { ProductManagementService } from '../../../users/admin/productManagement/product-management.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Category Management</h2>
        <div>
          <button class="btn btn-success me-2" (click)="showParentCategoryModal = true">
            <i class="fas fa-plus"></i> Add Category
          </button>
          <button class="btn btn-primary" (click)="showAddProductModal = true" [disabled]="categories.length === 0">
            <i class="fas fa-plus"></i> Add Product to Category
          </button>
        </div>
      </div>

      <!-- Category Tree -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Categories</h5>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && categories.length === 0" class="text-center py-4">
            <p class="text-muted">No categories found. Create your first category!</p>
          </div>

          <!-- Category List -->
          <div *ngIf="!isLoading && categories.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Products Count</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let category of categories">
                  <td>
                    <strong>{{ category.name }}</strong>
                    <div *ngIf="category.image" class="mt-1">
                      <img [src]="getCategoryImageUrl(category)" alt="{{ category.name }}" class="img-thumbnail" style="width: 30px; height: 30px;">
                    </div>
                  </td>
                  <td>{{ category.description || '-' }}</td>
                  <td>
                    <span class="badge bg-info">{{ category.productsCount || 0 }} products</span>
                  </td>
                  <td>
                    <span class="badge" [class]="category.isActive ? 'bg-success' : 'bg-secondary'">
                      {{ category.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary me-2" (click)="editCategory(category)">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-info me-2" (click)="viewCategoryProducts(category)">
                      <i class="fas fa-eye"></i> View Products
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteCategory(category._id)">
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add Product to Category Modal -->
      <div class="modal" [class.show]="showAddProductModal" [style.display]="showAddProductModal ? 'block' : 'none'">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add Product to Category</h5>
              <button type="button" class="btn-close" (click)="closeProductModal()"></button>
            </div>
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Product Name *</label>
                      <input type="text" class="form-control" formControlName="productName" placeholder="Enter product name">
                      <div *ngIf="productForm.get('productName')?.invalid && productForm.get('productName')?.touched" class="text-danger">
                        Product name is required
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Category *</label>
                      <select class="form-select" formControlName="category" required>
                        <option value="">Select Category</option>
                        <option *ngFor="let category of categories" [value]="category._id">
                          {{ category.name }}
                        </option>
                      </select>
                      <div *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched" class="text-danger">
                        Category is required
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Product Price *</label>
                      <input type="number" class="form-control" formControlName="productPrice" placeholder="Enter price" min="0" step="0.01">
                      <div *ngIf="productForm.get('productPrice')?.invalid && productForm.get('productPrice')?.touched" class="text-danger">
                        Product price is required
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Original Price</label>
                      <input type="number" class="form-control" formControlName="originalPrice" placeholder="Enter original price" min="0" step="0.01">
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Product Description</label>
                  <textarea class="form-control" formControlName="productDescription" rows="3" placeholder="Enter product description"></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Product Images *</label>
                      <input type="file" class="form-control" (change)="onProductImagesSelected($event)" accept="image/*" multiple>
                      <small class="form-text text-muted">Upload product images (required)</small>
                      <div *ngIf="selectedProductImages && selectedProductImages.length > 0" class="mt-2">
                        <small class="text-success">Selected: {{ selectedProductImages.length }} file(s)</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Stock Quantity *</label>
                      <input type="number" class="form-control" formControlName="stock" placeholder="Enter stock quantity" min="1" required>
                      <div *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched" class="text-danger">
                        Stock quantity is required and must be at least 1
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Weight</label>
                      <input type="text" class="form-control" formControlName="weight" placeholder="e.g., 500gm, 1kg">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Brand</label>
                      <input type="text" class="form-control" formControlName="brand" placeholder="Enter brand name">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" formControlName="featured" id="featured">
                      <label class="form-check-label" for="featured">Featured Product</label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" formControlName="inStock" id="inStock">
                      <label class="form-check-label" for="inStock">In Stock</label>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3 form-check">
                      <input type="checkbox" class="form-check-input" formControlName="isActive" id="productActive">
                      <label class="form-check-label" for="productActive">Active</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeProductModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || isSavingProduct">
                  <span *ngIf="isSavingProduct" class="spinner-border spinner-border-sm me-2"></span>
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Product Modal Backdrop -->
      <div *ngIf="showAddProductModal" class="modal-backdrop fade show"></div>

      <!-- Parent Category Modal -->
      <div class="modal" [class.show]="showParentCategoryModal" [style.display]="showParentCategoryModal ? 'block' : 'none'">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h5>
              <button type="button" class="btn-close" (click)="closeParentCategoryModal()"></button>
            </div>
            <form [formGroup]="parentCategoryForm" (ngSubmit)="saveParentCategory()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Category Name *</label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Enter category name">
                  <div *ngIf="parentCategoryForm.get('name')?.invalid && parentCategoryForm.get('name')?.touched" class="text-danger">
                    Category name is required
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" formControlName="description" rows="3" placeholder="Enter category description"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Category Image</label>
                  <input type="file" class="form-control" (change)="onParentFileSelected($event)" accept="image/*">
                  <small class="form-text text-muted">Upload category image (optional)</small>
                  <div *ngIf="selectedParentFile" class="mt-2">
                    <small class="text-success">Selected: {{ selectedParentFile.name }}</small>
                  </div>
                  <div *ngIf="editingCategory?.image" class="mt-2">
                    <small class="text-info">Current image: {{ editingCategory?.image }}</small>
                    <img *ngIf="editingCategory" [src]="getCategoryImageUrl(editingCategory)" alt="Category Image" class="img-thumbnail ms-2" style="width: 50px; height: 50px;">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Sort Order</label>
                  <input type="number" class="form-control" formControlName="sortOrder" min="1">
                </div>

                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" formControlName="isActive" id="parentIsActive">
                  <label class="form-check-label" for="parentIsActive">Active</label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeParentCategoryModal()">Cancel</button>
                <button type="submit" class="btn btn-success" [disabled]="parentCategoryForm.invalid || isSavingParent">
                  <span *ngIf="isSavingParent" class="spinner-border spinner-border-sm me-2"></span>
                  {{ editingCategory ? 'Update' : 'Create' }} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Parent Category Modal Backdrop -->
      <div *ngIf="showParentCategoryModal" class="modal-backdrop fade show"></div>
    </div>
  `,
  styles: [`
    .modal {
      background: rgba(0,0,0,0.5);
    }
    .table th {
      background-color: #f8f9fa;
    }
    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  parentCategoryForm: FormGroup;
  productForm: FormGroup;
  showAddModal = false;
  showEditModal = false;
  showParentCategoryModal = false;
  showAddProductModal = false;
  editingCategory: Category | null = null;
  isLoading = false;
  isSaving = false;
  isSavingParent = false;
  isSavingProduct = false;
  selectedFile: File | null = null;
  selectedParentFile: File | null = null;
  selectedProductImages: FileList | null = null;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductManagementService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });

    this.parentCategoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });

    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      productPrice: ['', [Validators.required, Validators.min(0)]],
      originalPrice: [''],
      productDescription: [''],
      stock: [1, [Validators.required, Validators.min(1)]], // Ensure minimum 1 for inventory.quantity
      weight: [''],
      brand: [''],
      featured: [false],
      inStock: [true],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  // Helper methods for type checking
  getCategoryImageUrl(category: Category): string {
    if (!category.image) return '';
    return category.image.startsWith('http') ? category.image : `http://localhost:3000${category.image}`;
  }

  onProductImagesSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedProductImages = files;
    }
  }

  onParentFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedParentFile = file;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveParentCategory() {
    if (this.parentCategoryForm.invalid) return;

    this.isSavingParent = true;
    const formValues = this.parentCategoryForm.value;

    // Create FormData for parent category (always level 0)
    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('description', formValues.description || '');
    formData.append('level', '0'); // Parent categories are always level 0
    formData.append('sortOrder', formValues.sortOrder.toString());
    formData.append('isActive', formValues.isActive.toString());

    // Add image file if selected
    if (this.selectedParentFile) {
      formData.append('image', this.selectedParentFile);
    }

    this.categoryService.createCategory(formData).subscribe({
      next: (response: any) => {
        console.log('Parent category saved:', response);
        this.closeParentCategoryModal();
        this.loadCategories(); // Reload categories
        this.isSavingParent = false;
      },
      error: (error: any) => {
        console.error('Error saving parent category:', error);
        this.isSavingParent = false;
      }
    });
  }

  closeParentCategoryModal() {
    this.showParentCategoryModal = false;
    this.selectedParentFile = null;
    this.parentCategoryForm.reset({
      name: '',
      description: '',
      sortOrder: 1,
      isActive: true
    });
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (response: any) => {
        this.categories = response.categories || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
      }
    });
  }


  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      sortOrder: category.sortOrder || 1,
      isActive: category.isActive
    });
    this.showEditModal = true;
  }

  saveCategory() {
    if (this.categoryForm.invalid) return;

    this.isSaving = true;
    const formValues = this.categoryForm.value;

    // Only main categories (no parentCategory)
    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('description', formValues.description || '');
    formData.append('level', '0');
    formData.append('sortOrder', formValues.sortOrder.toString());
    formData.append('isActive', formValues.isActive.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = this.editingCategory
      ? this.categoryService.updateCategory(this.editingCategory._id, formData)
      : this.categoryService.createCategory(formData);

    request.subscribe({
      next: (response: any) => {
        this.closeModal();
        this.loadCategories();
        this.isSaving = false;
      },
      error: (error: any) => {
        this.isSaving = false;
      }
    });
  }

  deleteCategory(categoryId: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: (response: any) => {
          console.log('Category deleted:', response);
          this.loadCategories(); // Reload categories
        },
        error: (error: any) => {
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.editingCategory = null;
    this.selectedFile = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      sortOrder: 1,
      isActive: true
    });
  }
  // Product modal handlers
  closeProductModal() {
    this.showAddProductModal = false;
    this.selectedProductImages = null;
    this.productForm.reset({
      productName: '',
      category: '',
      productPrice: '',
      originalPrice: '',
      productDescription: '',
      stock: 1, // Set default to 1 instead of 0
      weight: '',
      brand: '',
      featured: false,
      inStock: true,
      isActive: true
    });
  }

  saveProduct() {
    if (this.productForm.invalid) {
      console.log('Form is invalid:', this.productForm.errors);
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} is invalid:`, control.errors);
          control.markAsTouched();
        }
      });
      return;
    }

    if (!this.selectedProductImages || this.selectedProductImages.length === 0) {
      console.log('No product images selected');
      return;
    }

    this.isSavingProduct = true;
    const formValues = this.productForm.value;
    const formData = new FormData();

    // Map form fields to backend expected field names (from product.model.js)
    formData.append('title', formValues.productName); // Backend expects 'title'
    formData.append('description', formValues.productDescription || '');
    formData.append('price', formValues.productPrice.toString());
    if (formValues.originalPrice) {
      formData.append('originalPrice', formValues.originalPrice.toString());
    }
    formData.append('category', formValues.category); // Category ID

    // Backend expects nested inventory object with quantity as required field
    const stockValue = parseInt(formValues.stock) || 1;
    formData.append('quantity', stockValue.toString()); // This will be mapped to inventory.quantity in backend
    console.log('Sending stock quantity:', stockValue);

    if (formValues.weight) {
      formData.append('weight', formValues.weight.toString());
    }

    // Optional fields
    if (formValues.brand) {
      formData.append('brand', formValues.brand);
    }

    formData.append('featured', formValues.featured.toString());
    formData.append('topRated', 'false'); // Default value
    formData.append('status', 'active'); // Default status

    // Add product images - backend expects 'images' for req.files
    for (let i = 0; i < this.selectedProductImages.length; i++) {
      formData.append('images', this.selectedProductImages[i]);
    }

    console.log('Submitting product with data:', {
      title: formValues.productName,
      category: formValues.category,
      price: formValues.productPrice,
      quantity: stockValue
    });

    this.productService.addNewProduct(formData).subscribe({
      next: (response: any) => {
        console.log('Product saved successfully:', response);
        this.closeProductModal();
        this.isSavingProduct = false;
        this.loadCategories();
      },
      error: (error: any) => {
        console.error('Error saving product:', error);
        this.isSavingProduct = false;
      }
    });
  }

  viewCategoryProducts(category: Category) {
    // Navigate to product list filtered by category
    this.router.navigate(['/products'], {
      queryParams: {
        category: category._id,
        categoryName: category.name
      }
    });
  }
}
