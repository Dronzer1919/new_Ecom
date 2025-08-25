import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminApiService, AdminProduct, ProductCategory } from '../../services/admin-api.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="product-create">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Create New Product</h2>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/admin/dashboard">Dashboard</a>
              </li>
              <li class="breadcrumb-item">
                <a routerLink="/admin/products">Products</a>
              </li>
              <li class="breadcrumb-item active">Create Product</li>
            </ol>
          </nav>
        </div>
        <button class="btn btn-secondary" routerLink="/admin/products">
          <i class="bi bi-arrow-left me-2"></i>
          Back to Products
        </button>
      </div>

      <!-- Create Form -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">Product Information</h5>
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
                  <button type="button" class="btn btn-secondary" routerLink="/admin/products">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    Create Product
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-create {
      padding: 20px;
    }

    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
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

    .breadcrumb {
      background: none;
      padding: 0;
      margin: 0;
    }

    .breadcrumb-item + .breadcrumb-item::before {
      content: ">";
      color: #6c757d;
    }

    .breadcrumb-item a {
      color: #0d6efd;
      text-decoration: none;
    }

    .breadcrumb-item a:hover {
      text-decoration: underline;
    }
  `]
})
export class ProductCreateComponent implements OnInit {
  productForm: FormGroup;
  isLoading = false;
  categories: ProductCategory[] = [];
  selectedImages: { file: File; preview: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService,
    private router: Router
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
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

  loadCategories(): void {
    this.adminApiService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories = categories || [];
        if (this.categories.length === 0) {
          console.warn('No categories found, adding temporary ones');
          this.addTemporaryCategories();
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Add temporary categories if API fails
        this.addTemporaryCategories();
      }
    });
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

    this.categories = tempCategories;
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

      console.log('Submitting product data:', productData);
      this.isLoading = true;

      this.adminApiService.createProduct(productData).subscribe({
        next: (response) => {
          console.log('Product created successfully:', response);
          this.isLoading = false;
          alert('Product created successfully!');
          // Navigate back to products list
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.isLoading = false;

          // Show detailed error message
          let errorMessage = 'Error creating product: ';
          if (error.error && error.error.message) {
            errorMessage += error.error.message;
          } else if (error.message) {
            errorMessage += error.message;
          } else {
            errorMessage += 'Unknown error occurred';
          }

          alert(errorMessage);
        }
      });
    } else {
      console.log('Form is invalid:', this.productForm.errors);
      alert('Please fill in all required fields correctly.');
    }
  }
}
