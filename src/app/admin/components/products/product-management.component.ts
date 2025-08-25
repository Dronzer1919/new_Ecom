import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService, AdminProduct, ProductCategory } from '../../services/admin-api.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="product-management">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <div class="btn-group">
          <button class="btn btn-primary" routerLink="/admin/products/create">
            <i class="bi bi-plus-circle me-2"></i>
            Add Product
          </button>
          <button class="btn btn-outline-primary" (click)="showCreateForm = !showCreateForm">
            <i class="bi bi-pencil me-2"></i>
            {{ showCreateForm ? 'Cancel' : 'Quick Add' }}
          </button>
        </div>
      </div>

      <!-- Create/Edit Form -->
      <div class="card mb-4" *ngIf="showCreateForm">
        <div class="card-header">
          <h5 class="mb-0">{{ editingProduct ? 'Edit Product' : 'Create New Product' }}</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" enctype="multipart/form-data">
            <div class="row">
              <!-- Basic Information -->
              <div class="col-md-6">
                <h6 class="text-primary mb-3">Basic Information</h6>

                <div class="mb-3">
                  <label class="form-label">Product Title *</label>
                  <input type="text" class="form-control" formControlName="title"
                         placeholder="Enter product title">
                  <div *ngIf="productForm.get('title')?.invalid && productForm.get('title')?.touched"
                       class="text-danger small">Title is required</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Subtitle</label>
                  <input type="text" class="form-control" formControlName="subtitle"
                         placeholder="Enter subtitle">
                </div>

                <div class="mb-3">
                  <label class="form-label">Description *</label>
                  <textarea class="form-control" formControlName="description" rows="4"
                            placeholder="Enter product description"></textarea>
                  <div *ngIf="productForm.get('description')?.invalid && productForm.get('description')?.touched"
                       class="text-danger small">Description is required</div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Price *</label>
                      <input type="number" class="form-control" formControlName="price"
                             placeholder="0.00" step="0.01" min="0">
                      <div *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched"
                           class="text-danger small">Price is required</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Original Price</label>
                      <input type="number" class="form-control" formControlName="originalPrice"
                             placeholder="0.00" step="0.01" min="0">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Category *</label>
                      <select class="form-select" formControlName="category">
                        <option value="">Select Category</option>
                        <option *ngFor="let cat of categories" [value]="cat._id">
                          {{ cat.categoryName }}
                        </option>
                      </select>
                      <div *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched"
                           class="text-danger small">Category is required</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Subcategory</label>
                      <input type="text" class="form-control" formControlName="subcategory"
                             placeholder="Enter subcategory">
                    </div>
                  </div>
                </div>

                <!-- Images Upload -->
                <div class="mb-3">
                  <label class="form-label">Product Images</label>
                  <input type="file" class="form-control" (change)="onImageSelect($event)"
                         multiple accept="image/*">
                  <div class="small text-muted">Upload up to 5 images (JPG, PNG, WEBP)</div>

                  <!-- Image Preview -->
                  <div class="row mt-2" *ngIf="selectedImages.length > 0">
                    <div class="col-3" *ngFor="let img of selectedImages; let i = index">
                      <div class="position-relative">
                        <img [src]="img.preview" class="img-fluid rounded" style="height: 80px; object-fit: cover;">
                        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0"
                                (click)="removeImage(i)">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Product Details -->
              <div class="col-md-6">
                <h6 class="text-primary mb-3">Product Details</h6>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Badge</label>
                      <select class="form-select" formControlName="badge">
                        <option value="">No Badge</option>
                        <option value="new">New</option>
                        <option value="sale">Sale</option>
                        <option value="hot">Hot</option>
                        <option value="featured">Featured</option>
                        <option value="limited">Limited</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Status</label>
                      <select class="form-select" formControlName="status">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Inventory -->
                <div formGroupName="inventory">
                  <h6 class="text-secondary mb-3">Inventory</h6>

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Quantity *</label>
                        <input type="number" class="form-control" formControlName="quantity"
                               placeholder="0" min="0">
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">SKU</label>
                        <input type="text" class="form-control" formControlName="sku"
                               placeholder="Product SKU">
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Weight (kg)</label>
                    <input type="number" class="form-control" formControlName="weight"
                           placeholder="0.00" step="0.01" min="0">
                  </div>
                </div>

                <!-- Features -->
                <div class="mb-3">
                  <label class="form-label">Tags</label>
                  <input type="text" class="form-control" formControlName="tagsInput"
                         placeholder="Enter tags separated by commas">
                  <div class="small text-muted">e.g., chair, furniture, modern</div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="form-check mb-3">
                      <input class="form-check-input" type="checkbox" formControlName="featured">
                      <label class="form-check-label">Featured Product</label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-check mb-3">
                      <input class="form-check-input" type="checkbox" formControlName="topRated">
                      <label class="form-check-label">Top Rated</label>
                    </div>
                  </div>
                </div>

                <!-- SEO -->
                <div formGroupName="seo">
                  <h6 class="text-secondary mb-3">SEO</h6>

                  <div class="mb-3">
                    <label class="form-label">Meta Title</label>
                    <input type="text" class="form-control" formControlName="metaTitle"
                           placeholder="SEO title">
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Meta Description</label>
                    <textarea class="form-control" formControlName="metaDescription" rows="2"
                              placeholder="SEO description"></textarea>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">URL Slug</label>
                    <input type="text" class="form-control" formControlName="slug"
                           placeholder="product-url-slug">
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="row">
              <div class="col-12">
                <hr>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" (click)="cancelForm()">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ editingProduct ? 'Update Product' : 'Create Product' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Products List -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Products List</h5>
          <div class="d-flex gap-2">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="searchTerm"
                   placeholder="Search products..." style="width: 200px;">
            <select class="form-select form-select-sm" [(ngModel)]="filterCategory" style="width: 150px;">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.categoryName }}</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && products.length === 0" class="text-center py-4">
            <i class="bi bi-box-seam fs-1 text-muted"></i>
            <p class="text-muted mt-2">No products found</p>
          </div>

          <div *ngIf="!isLoading && products.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of filteredProducts">
                  <td>
                    <img [src]="getProductImage(product)" class="rounded"
                         style="width: 50px; height: 50px; object-fit: cover;"
                         [alt]="product.title">
                  </td>
                  <td>
                    <div>
                      <h6 class="mb-1">{{ product.title }}</h6>
                      <small class="text-muted">{{ product.subtitle }}</small>
                      <div *ngIf="product.badge" class="mt-1">
                        <span class="badge" [ngClass]="getBadgeClass(product.badge)">{{ product.badge }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span *ngIf="product.category">{{ getCategoryName(product.category) }}</span>
                    <small class="d-block text-muted" *ngIf="product.subcategory">{{ product.subcategory }}</small>
                  </td>
                  <td>
                    <strong>£{{ product.price }}</strong>
                    <small class="d-block text-muted text-decoration-line-through" *ngIf="product.originalPrice">
                      £{{ product.originalPrice }}
                    </small>
                  </td>
                  <td>
                    <span [ngClass]="getStockClass(product.inventory?.quantity || 0)">
                      {{ product.inventory?.quantity || 0 }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(product.status)">
                      {{ product.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-primary" (click)="editProduct(product)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteProduct(product._id!)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-management {
      padding: 20px;
    }

    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .table th {
      border-top: none;
      font-weight: 600;
      color: #495057;
    }

    .btn-group .btn {
      padding: 0.25rem 0.5rem;
    }

    .form-label {
      font-weight: 500;
      color: #495057;
    }

    .text-primary {
      color: #0d6efd !important;
    }

    .text-secondary {
      color: #6c757d !important;
    }
  `]
})
export class ProductManagementComponent implements OnInit {
  productForm: FormGroup;
  showCreateForm = false;
  editingProduct: any = null;
  isLoading = false;

  products: any[] = [];
  categories: ProductCategory[] = [];
  selectedImages: { file: File; preview: string }[] = [];

  searchTerm = '';
  filterCategory = '';

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      originalPrice: [0],
      category: ['', Validators.required],
      subcategory: [''],
      badge: [''],
      status: ['active'],
      inventory: this.fb.group({
        quantity: [0, [Validators.required, Validators.min(0)]],
        sku: [''],
        weight: [0]
      }),
      tagsInput: [''],
      featured: [false],
      topRated: [false],
      seo: this.fb.group({
        metaTitle: [''],
        metaDescription: [''],
        slug: ['']
      })
    });
  }

  get filteredProducts() {
    return this.products.filter(product => {
      const matchesSearch = !this.searchTerm ||
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.filterCategory || product.category === this.filterCategory;

      return matchesSearch && matchesCategory;
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.adminApiService.getAllProducts().subscribe({
      next: (response) => {
        this.products = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.adminApiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Add temporary categories if API fails
        this.addTemporaryCategories();
      }
    });

    // Add temporary categories for testing
    this.addTemporaryCategories();
  }

  addTemporaryCategories(): void {
    const tempCategories: ProductCategory[] = [
      {
        _id: 'temp-1',
        categoryName: 'Furniture',
        description: 'Home and office furniture',
        image: []
      },
      {
        _id: 'temp-2',
        categoryName: 'Electronics',
        description: 'Electronic devices and gadgets',
        image: []
      },
      {
        _id: 'temp-3',
        categoryName: 'Clothing',
        description: 'Fashion and apparel',
        image: []
      },
      {
        _id: 'temp-4',
        categoryName: 'Home & Garden',
        description: 'Home improvement and garden supplies',
        image: []
      },
      {
        _id: 'temp-5',
        categoryName: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear',
        image: []
      },
      {
        _id: 'temp-6',
        categoryName: 'Books & Media',
        description: 'Books, movies, and music',
        image: []
      },
      {
        _id: 'temp-7',
        categoryName: 'Health & Beauty',
        description: 'Health and beauty products',
        image: []
      },
      {
        _id: 'temp-8',
        categoryName: 'Toys & Games',
        description: 'Toys and gaming products',
        image: []
      }
    ];

    // Merge with existing categories, avoiding duplicates
    this.categories = [...this.categories, ...tempCategories.filter(temp =>
      !this.categories.some(cat => cat.categoryName === temp.categoryName)
    )];
  }

  onImageSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];
    this.selectedImages = [];

    files.slice(0, 5).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImages.push({
          file,
          preview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = this.productForm.value;

      // Process tags
      const tags = formData.tagsInput ? formData.tagsInput.split(',').map((tag: string) => tag.trim()) : [];

      const productData: AdminProduct = {
        ...formData,
        tags,
        images: this.selectedImages.map(img => img.file)
      };

      this.isLoading = true;

      const apiCall = this.editingProduct
        ? this.adminApiService.updateProduct(this.editingProduct._id, productData)
        : this.adminApiService.createProduct(productData);

      apiCall.subscribe({
        next: (response) => {
          console.log('Product saved successfully:', response);
          this.isLoading = false;
          this.cancelForm();
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error saving product:', error);
          this.isLoading = false;
        }
      });
    }
  }

  editProduct(product: any): void {
    this.editingProduct = product;
    this.showCreateForm = true;

    // Populate form with product data
    this.productForm.patchValue({
      title: product.title,
      subtitle: product.subtitle,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      subcategory: product.subcategory,
      badge: product.badge,
      status: product.status,
      inventory: {
        quantity: product.inventory?.quantity || 0,
        sku: product.inventory?.sku || '',
        weight: product.inventory?.weight || 0
      },
      tagsInput: product.tags ? product.tags.join(', ') : '',
      featured: product.featured,
      topRated: product.topRated,
      seo: {
        metaTitle: product.seo?.metaTitle || '',
        metaDescription: product.seo?.metaDescription || '',
        slug: product.seo?.slug || ''
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminApiService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingProduct = null;
    this.productForm.reset();
    this.selectedImages = [];
  }

  getProductImage(product: any): string {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img: any) => img.isPrimary);
      return primaryImage ? primaryImage.url : product.images[0].url;
    }
    return 'assets/placeholder-image.jpg';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat._id === categoryId);
    return category ? category.categoryName : 'Unknown';
  }

  getBadgeClass(badge: string): string {
    const classes: { [key: string]: string } = {
      'new': 'bg-success',
      'sale': 'bg-danger',
      'hot': 'bg-warning',
      'featured': 'bg-primary',
      'limited': 'bg-info'
    };
    return classes[badge] || 'bg-secondary';
  }

  getStockClass(quantity: number): string {
    if (quantity === 0) return 'text-danger';
    if (quantity < 10) return 'text-warning';
    return 'text-success';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'bg-success',
      'inactive': 'bg-warning',
      'discontinued': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }
}
