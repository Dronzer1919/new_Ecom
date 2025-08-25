import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService, AdminPromo } from '../../services/admin-api.service';

@Component({
  selector: 'app-promo-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="promo-management">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Promo Management</h2>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          <i class="bi bi-plus-circle me-2"></i>
          {{ showCreateForm ? 'Cancel' : 'Add Promo' }}
        </button>
      </div>

      <!-- Create/Edit Form -->
      <div class="card mb-4" *ngIf="showCreateForm">
        <div class="card-header">
          <h5 class="mb-0">{{ editingPromo ? 'Edit Promo' : 'Create New Promo' }}</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="promoForm" (ngSubmit)="onSubmit()" enctype="multipart/form-data">
            <div class="row">
              <!-- Basic Information -->
              <div class="col-md-8">
                <div class="mb-3">
                  <label class="form-label">Title *</label>
                  <input type="text" class="form-control" formControlName="title"
                         placeholder="Enter promo title">
                  <div *ngIf="promoForm.get('title')?.invalid && promoForm.get('title')?.touched"
                       class="text-danger small">Title is required</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Subtitle</label>
                  <input type="text" class="form-control" formControlName="subtitle"
                         placeholder="Enter subtitle">
                </div>

                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" formControlName="description" rows="4"
                            placeholder="Enter promo description"></textarea>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Discount Type *</label>
                      <select class="form-select" formControlName="discountType">
                        <option value="">Select Type</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (£)</option>
                        <option value="free_shipping">Free Shipping</option>
                        <option value="buy_one_get_one">Buy One Get One</option>
                      </select>
                      <div *ngIf="promoForm.get('discountType')?.invalid && promoForm.get('discountType')?.touched"
                           class="text-danger small">Discount type is required</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3" *ngIf="promoForm.get('discountType')?.value === 'percentage' || promoForm.get('discountType')?.value === 'fixed'">
                      <label class="form-label">Discount Value *</label>
                      <div class="input-group">
                        <span class="input-group-text" *ngIf="promoForm.get('discountType')?.value === 'percentage'">%</span>
                        <span class="input-group-text" *ngIf="promoForm.get('discountType')?.value === 'fixed'">£</span>
                        <input type="number" class="form-control" formControlName="discountValue"
                               placeholder="0" step="0.01" min="0">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Promo Code</label>
                      <input type="text" class="form-control" formControlName="code"
                             placeholder="PROMO2024" style="text-transform: uppercase;">
                      <div class="small text-muted">Leave empty for automatic code generation</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Minimum Order Value</label>
                      <div class="input-group">
                        <span class="input-group-text">£</span>
                        <input type="number" class="form-control" formControlName="minOrderValue"
                               placeholder="0.00" step="0.01" min="0">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Start Date *</label>
                      <input type="datetime-local" class="form-control" formControlName="startDate">
                      <div *ngIf="promoForm.get('startDate')?.invalid && promoForm.get('startDate')?.touched"
                           class="text-danger small">Start date is required</div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">End Date *</label>
                      <input type="datetime-local" class="form-control" formControlName="endDate">
                      <div *ngIf="promoForm.get('endDate')?.invalid && promoForm.get('endDate')?.touched"
                           class="text-danger small">End date is required</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Promo Settings -->
              <div class="col-md-4">
                <h6 class="text-primary mb-3">Promo Settings</h6>

                <!-- Promo Image -->
                <div class="mb-3">
                  <label class="form-label">Promo Image</label>
                  <input type="file" class="form-control" (change)="onImageSelect($event)"
                         accept="image/*">
                  <div class="small text-muted">Upload promo banner (JPG, PNG, WEBP)</div>

                  <!-- Image Preview -->
                  <div class="mt-2" *ngIf="selectedImage">
                    <div class="position-relative">
                      <img [src]="selectedImage.preview" class="img-fluid rounded"
                           style="max-height: 200px; width: 100%; object-fit: cover;">
                      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0"
                              (click)="removeImage()">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Usage Limit</label>
                  <input type="number" class="form-control" formControlName="usageLimit"
                         placeholder="0" min="0">
                  <div class="small text-muted">0 = unlimited usage</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Per User Limit</label>
                  <input type="number" class="form-control" formControlName="perUserLimit"
                         placeholder="1" min="1">
                  <div class="small text-muted">Maximum uses per customer</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" formControlName="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Target Audience</label>
                  <select class="form-select" formControlName="targetAudience">
                    <option value="all">All Customers</option>
                    <option value="new">New Customers Only</option>
                    <option value="returning">Returning Customers</option>
                    <option value="vip">VIP Customers</option>
                  </select>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="featured">
                    <label class="form-check-label">Featured Promo</label>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="combinable">
                    <label class="form-check-label">Combinable with other offers</label>
                  </div>
                </div>

                <!-- Button/Link Settings -->
                <hr>
                <h6 class="text-secondary mb-3">Call to Action</h6>

                <div class="mb-3">
                  <label class="form-label">Button Text</label>
                  <input type="text" class="form-control" formControlName="buttonText"
                         placeholder="Shop Now">
                </div>

                <div class="mb-3">
                  <label class="form-label">Button Link</label>
                  <input type="url" class="form-control" formControlName="buttonLink"
                         placeholder="https://example.com/products">
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
                  <button type="submit" class="btn btn-primary" [disabled]="promoForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ editingPromo ? 'Update Promo' : 'Create Promo' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Promos List -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Promotions List</h5>
          <div class="d-flex gap-2">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="searchTerm"
                   placeholder="Search promos..." style="width: 200px;">
            <select class="form-select form-select-sm" [(ngModel)]="filterStatus" style="width: 120px;">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && promos.length === 0" class="text-center py-4">
            <i class="bi bi-percent fs-1 text-muted"></i>
            <p class="text-muted mt-2">No promotions found</p>
          </div>

          <div *ngIf="!isLoading && promos.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Promo</th>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Duration</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let promo of filteredPromos">
                  <td>
                    <img [src]="getPromoImage(promo)" class="rounded"
                         style="width: 60px; height: 40px; object-fit: cover;"
                         [alt]="promo.title">
                  </td>
                  <td>
                    <div>
                      <h6 class="mb-1">{{ promo.title }}</h6>
                      <small class="text-muted">{{ promo.subtitle }}</small>
                      <div class="mt-1" *ngIf="promo.featured">
                        <span class="badge bg-primary">Featured</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code *ngIf="promo.code">{{ promo.code }}</code>
                    <span *ngIf="!promo.code" class="text-muted">Auto-apply</span>
                  </td>
                  <td>
                    <span [ngClass]="getDiscountClass(promo.discountType)">
                      {{ formatDiscount(promo) }}
                    </span>
                    <div class="small text-muted" *ngIf="promo.minOrderValue">
                      Min: £{{ promo.minOrderValue }}
                    </div>
                  </td>
                  <td>
                    <div class="small">
                      <div>{{ formatDate(promo.startDate) }}</div>
                      <div class="text-muted">to {{ formatDate(promo.endDate) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="small">
                      {{ promo.usedCount || 0 }}
                      <span *ngIf="promo.usageLimit"> / {{ promo.usageLimit }}</span>
                      <span *ngIf="!promo.usageLimit"> / ∞</span>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(promo.status)">
                      {{ promo.status }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-primary" (click)="editPromo(promo)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" (click)="togglePromoStatus(promo)"
                              [title]="promo.status === 'active' ? 'Deactivate' : 'Activate'">
                        <i class="bi" [ngClass]="promo.status === 'active' ? 'bi-pause' : 'bi-play'"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deletePromo(promo._id!)">
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
    .promo-management {
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

    code {
      font-size: 0.875em;
      background-color: #f8f9fa;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
    }
  `]
})
export class PromoManagementComponent implements OnInit {
  promoForm: FormGroup;
  showCreateForm = false;
  editingPromo: any = null;
  isLoading = false;

  promos: any[] = [];
  selectedImage: { file: File; preview: string } | null = null;

  searchTerm = '';
  filterStatus = '';

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {
    this.promoForm = this.createPromoForm();
  }

  ngOnInit(): void {
    this.loadPromos();
  }

  createPromoForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      description: [''],
      discountType: ['', Validators.required],
      discountValue: [0],
      code: [''],
      minOrderValue: [0],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      usageLimit: [0],
      perUserLimit: [1],
      status: ['active'],
      targetAudience: ['all'],
      featured: [false],
      combinable: [false],
      buttonText: ['Shop Now'],
      buttonLink: ['']
    });
  }

  get filteredPromos() {
    return this.promos.filter(promo => {
      const matchesSearch = !this.searchTerm ||
        promo.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        promo.code?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || promo.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  loadPromos(): void {
    this.isLoading = true;
    this.adminApiService.getAllPromos().subscribe({
      next: (response) => {
        this.promos = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading promos:', error);
        this.isLoading = false;
      }
    });
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = {
          file,
          preview: e.target?.result as string
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
  }

  onSubmit(): void {
    if (this.promoForm.valid) {
      const formData = this.promoForm.value;

      const promoData: AdminPromo = {
        ...formData,
        image: this.selectedImage?.file
      };

      this.isLoading = true;

      const apiCall = this.editingPromo
        ? this.adminApiService.updatePromo(this.editingPromo._id, promoData)
        : this.adminApiService.createPromo(promoData);

      apiCall.subscribe({
        next: (response) => {
          console.log('Promo saved successfully:', response);
          this.isLoading = false;
          this.cancelForm();
          this.loadPromos();
        },
        error: (error) => {
          console.error('Error saving promo:', error);
          this.isLoading = false;
        }
      });
    }
  }

  editPromo(promo: any): void {
    this.editingPromo = promo;
    this.showCreateForm = true;

    // Populate form with promo data
    this.promoForm.patchValue({
      title: promo.title,
      subtitle: promo.subtitle,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      code: promo.code,
      minOrderValue: promo.minOrderValue,
      startDate: this.formatDateForInput(promo.startDate),
      endDate: this.formatDateForInput(promo.endDate),
      usageLimit: promo.usageLimit,
      perUserLimit: promo.perUserLimit,
      status: promo.status,
      targetAudience: promo.targetAudience,
      featured: promo.featured,
      combinable: promo.combinable,
      buttonText: promo.buttonText,
      buttonLink: promo.buttonLink
    });

    // Set existing image if available
    if (promo.image) {
      this.selectedImage = {
        file: null as any,
        preview: promo.image
      };
    }
  }

  deletePromo(id: string): void {
    if (confirm('Are you sure you want to delete this promotion?')) {
      this.adminApiService.deletePromo(id).subscribe({
        next: () => {
          this.loadPromos();
        },
        error: (error) => {
          console.error('Error deleting promo:', error);
        }
      });
    }
  }

  togglePromoStatus(promo: any): void {
    const newStatus = promo.status === 'active' ? 'inactive' : 'active';
    const updateData = { ...promo, status: newStatus };

    this.adminApiService.updatePromo(promo._id, updateData).subscribe({
      next: () => {
        this.loadPromos();
      },
      error: (error) => {
        console.error('Error updating promo status:', error);
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingPromo = null;
    this.promoForm.reset();
    this.selectedImage = null;
  }

  getPromoImage(promo: any): string {
    return promo.image || 'assets/placeholder-promo.jpg';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'bg-success',
      'inactive': 'bg-warning',
      'expired': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getDiscountClass(discountType: string): string {
    const classes: { [key: string]: string } = {
      'percentage': 'text-success',
      'fixed': 'text-primary',
      'free_shipping': 'text-info',
      'buy_one_get_one': 'text-warning'
    };
    return classes[discountType] || 'text-dark';
  }

  formatDiscount(promo: any): string {
    switch (promo.discountType) {
      case 'percentage':
        return `${promo.discountValue}% OFF`;
      case 'fixed':
        return `£${promo.discountValue} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      case 'buy_one_get_one':
        return 'BOGO';
      default:
        return 'DISCOUNT';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }
}
