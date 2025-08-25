import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService, AdminBanner } from '../../services/admin-api.service';

@Component({
  selector: 'app-banner-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="banner-management">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Banner Management</h2>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          <i class="bi bi-plus-circle me-2"></i>
          {{ showCreateForm ? 'Cancel' : 'Add Banner' }}
        </button>
      </div>

      <!-- Create/Edit Form -->
      <div class="card mb-4" *ngIf="showCreateForm">
        <div class="card-header">
          <h5 class="mb-0">{{ editingBanner ? 'Edit Banner' : 'Create New Banner' }}</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="bannerForm" (ngSubmit)="onSubmit()" enctype="multipart/form-data">
            <div class="row">
              <!-- Banner Content -->
              <div class="col-md-8">
                <div class="mb-3">
                  <label class="form-label">Banner Title *</label>
                  <input type="text" class="form-control" formControlName="title"
                         placeholder="Enter banner title">
                  <div *ngIf="bannerForm.get('title')?.invalid && bannerForm.get('title')?.touched"
                       class="text-danger small">Title is required</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Subtitle</label>
                  <input type="text" class="form-control" formControlName="subtitle"
                         placeholder="Enter subtitle">
                </div>

                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" formControlName="description" rows="3"
                            placeholder="Enter banner description"></textarea>
                </div>

                <!-- Banner Image -->
                <div class="mb-3">
                  <label class="form-label">Banner Image *</label>
                  <input type="file" class="form-control" (change)="onImageSelect($event)"
                         accept="image/*" [class.is-invalid]="!selectedImage && bannerForm.get('image')?.touched">
                  <div class="small text-muted">Upload banner image (JPG, PNG, WEBP). Recommended size: 1920x600px</div>
                  <div *ngIf="!selectedImage && bannerForm.get('image')?.touched"
                       class="text-danger small">Banner image is required</div>

                  <!-- Image Preview -->
                  <div class="mt-3" *ngIf="selectedImage">
                    <div class="position-relative">
                      <img [src]="selectedImage.preview" class="img-fluid rounded"
                           style="max-height: 300px; width: 100%; object-fit: cover;">
                      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                              (click)="removeImage()">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Call to Action -->
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Button Text</label>
                      <input type="text" class="form-control" formControlName="buttonText"
                             placeholder="Shop Now">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Button Link</label>
                      <input type="url" class="form-control" formControlName="buttonLink"
                             placeholder="https://example.com/products">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Banner Settings -->
              <div class="col-md-4">
                <h6 class="text-primary mb-3">Banner Settings</h6>

                <div class="mb-3">
                  <label class="form-label">Banner Type *</label>
                  <select class="form-select" formControlName="type">
                    <option value="">Select Type</option>
                    <option value="hero">Hero Banner</option>
                    <option value="promotion">Promotional Banner</option>
                    <option value="category">Category Banner</option>
                    <option value="seasonal">Seasonal Banner</option>
                    <option value="announcement">Announcement</option>
                  </select>
                  <div *ngIf="bannerForm.get('type')?.invalid && bannerForm.get('type')?.touched"
                       class="text-danger small">Banner type is required</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Position *</label>
                  <select class="form-select" formControlName="position">
                    <option value="">Select Position</option>
                    <option value="main">Main Slider</option>
                    <option value="secondary">Secondary Banner</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="popup">Popup</option>
                  </select>
                  <div *ngIf="bannerForm.get('position')?.invalid && bannerForm.get('position')?.touched"
                       class="text-danger small">Position is required</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Display Order</label>
                  <input type="number" class="form-control" formControlName="order"
                         placeholder="1" min="0">
                  <div class="small text-muted">Lower numbers appear first</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" formControlName="status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                <!-- Scheduling -->
                <div class="mb-3" *ngIf="bannerForm.get('status')?.value === 'scheduled'">
                  <label class="form-label">Start Date</label>
                  <input type="datetime-local" class="form-control" formControlName="startDate">
                </div>

                <div class="mb-3" *ngIf="bannerForm.get('status')?.value === 'scheduled'">
                  <label class="form-label">End Date</label>
                  <input type="datetime-local" class="form-control" formControlName="endDate">
                </div>

                <!-- Targeting -->
                <hr>
                <h6 class="text-secondary mb-3">Targeting</h6>

                <div class="mb-3">
                  <label class="form-label">Target Audience</label>
                  <select class="form-select" formControlName="targetAudience">
                    <option value="all">All Visitors</option>
                    <option value="new">New Visitors</option>
                    <option value="returning">Returning Visitors</option>
                    <option value="mobile">Mobile Users</option>
                    <option value="desktop">Desktop Users</option>
                  </select>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="isClickable">
                    <label class="form-check-label">Clickable Banner</label>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="openInNewTab">
                    <label class="form-check-label">Open in New Tab</label>
                  </div>
                </div>

                <!-- Analytics -->
                <hr>
                <h6 class="text-secondary mb-3">Analytics</h6>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="trackClicks">
                    <label class="form-check-label">Track Clicks</label>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="trackImpressions">
                    <label class="form-check-label">Track Impressions</label>
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
                  <button type="submit" class="btn btn-primary" [disabled]="bannerForm.invalid || !selectedImage || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ editingBanner ? 'Update Banner' : 'Create Banner' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Banners List -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Banners List</h5>
          <div class="d-flex gap-2">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="searchTerm"
                   placeholder="Search banners..." style="width: 200px;">
            <select class="form-select form-select-sm" [(ngModel)]="filterPosition" style="width: 150px;">
              <option value="">All Positions</option>
              <option value="main">Main Slider</option>
              <option value="secondary">Secondary</option>
              <option value="sidebar">Sidebar</option>
              <option value="footer">Footer</option>
              <option value="popup">Popup</option>
            </select>
            <select class="form-select form-select-sm" [(ngModel)]="filterStatus" style="width: 120px;">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && banners.length === 0" class="text-center py-4">
            <i class="bi bi-image fs-1 text-muted"></i>
            <p class="text-muted mt-2">No banners found</p>
          </div>

          <div *ngIf="!isLoading && banners.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Banner</th>
                  <th>Type</th>
                  <th>Position</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Stats</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let banner of filteredBanners">
                  <td>
                    <img [src]="getBannerImage(banner)" class="rounded"
                         style="width: 80px; height: 50px; object-fit: cover;"
                         [alt]="banner.title">
                  </td>
                  <td>
                    <div>
                      <h6 class="mb-1">{{ banner.title }}</h6>
                      <small class="text-muted">{{ banner.subtitle }}</small>
                      <div class="mt-1" *ngIf="banner.isClickable">
                        <span class="badge bg-info">Clickable</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-light text-dark">{{ banner.type }}</span>
                  </td>
                  <td>{{ banner.position }}</td>
                  <td>
                    <span class="badge bg-secondary">{{ banner.order }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(banner.status)">
                      {{ banner.status }}
                    </span>
                  </td>
                  <td>
                    <div class="small">
                      <div *ngIf="banner.trackClicks">
                        <i class="bi bi-cursor-fill text-primary"></i>
                        {{ banner.clickCount || 0 }} clicks
                      </div>
                      <div *ngIf="banner.trackImpressions">
                        <i class="bi bi-eye-fill text-success"></i>
                        {{ banner.impressionCount || 0 }} views
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-primary" (click)="editBanner(banner)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" (click)="toggleBannerStatus(banner)"
                              [title]="banner.status === 'active' ? 'Deactivate' : 'Activate'">
                        <i class="bi" [ngClass]="banner.status === 'active' ? 'bi-pause' : 'bi-play'"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-info" (click)="duplicateBanner(banner)" title="Duplicate">
                        <i class="bi bi-files"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteBanner(banner._id!)">
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
    .banner-management {
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

    .badge {
      font-size: 0.75em;
    }
  `]
})
export class BannerManagementComponent implements OnInit {
  bannerForm: FormGroup;
  showCreateForm = false;
  editingBanner: any = null;
  isLoading = false;

  banners: any[] = [];
  selectedImage: { file: File; preview: string } | null = null;

  searchTerm = '';
  filterPosition = '';
  filterStatus = '';

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {
    this.bannerForm = this.createBannerForm();
  }

  ngOnInit(): void {
    this.loadBanners();
  }

  createBannerForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      subtitle: [''],
      description: [''],
      type: ['', Validators.required],
      position: ['', Validators.required],
      order: [1, [Validators.min(0)]],
      status: ['active'],
      startDate: [''],
      endDate: [''],
      targetAudience: ['all'],
      buttonText: ['Shop Now'],
      buttonLink: [''],
      isClickable: [true],
      openInNewTab: [false],
      trackClicks: [true],
      trackImpressions: [true],
      image: ['', Validators.required]
    });
  }

  get filteredBanners() {
    return this.banners.filter(banner => {
      const matchesSearch = !this.searchTerm ||
        banner.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        banner.subtitle?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesPosition = !this.filterPosition || banner.position === this.filterPosition;
      const matchesStatus = !this.filterStatus || banner.status === this.filterStatus;

      return matchesSearch && matchesPosition && matchesStatus;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  loadBanners(): void {
    this.isLoading = true;
    this.adminApiService.getAllBanners().subscribe({
      next: (response) => {
        this.banners = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading banners:', error);
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
        this.bannerForm.patchValue({ image: 'selected' });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.bannerForm.patchValue({ image: '' });
  }

  onSubmit(): void {
    if (this.bannerForm.valid && this.selectedImage) {
      const formData = this.bannerForm.value;

      const bannerData: AdminBanner = {
        ...formData,
        image: this.selectedImage.file
      };

      this.isLoading = true;

      const apiCall = this.editingBanner
        ? this.adminApiService.updateBanner(this.editingBanner._id, bannerData)
        : this.adminApiService.createBanner(bannerData);

      apiCall.subscribe({
        next: (response: any) => {
          console.log('Banner saved successfully:', response);
          this.isLoading = false;
          this.cancelForm();
          this.loadBanners();
        },
        error: (error: any) => {
          console.error('Error saving banner:', error);
          this.isLoading = false;
        }
      });
    }
  }

  editBanner(banner: any): void {
    this.editingBanner = banner;
    this.showCreateForm = true;

    // Populate form with banner data
    this.bannerForm.patchValue({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      type: banner.type,
      position: banner.position,
      order: banner.order,
      status: banner.status,
      startDate: banner.startDate ? this.formatDateForInput(banner.startDate) : '',
      endDate: banner.endDate ? this.formatDateForInput(banner.endDate) : '',
      targetAudience: banner.targetAudience,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      isClickable: banner.isClickable,
      openInNewTab: banner.openInNewTab,
      trackClicks: banner.trackClicks,
      trackImpressions: banner.trackImpressions,
      image: 'existing'
    });

    // Set existing image if available
    if (banner.image) {
      this.selectedImage = {
        file: null as any,
        preview: banner.image
      };
    }
  }

  deleteBanner(id: string): void {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.adminApiService.deleteBanner(id).subscribe({
        next: () => {
          this.loadBanners();
        },
        error: (error: any) => {
          console.error('Error deleting banner:', error);
        }
      });
    }
  }

  toggleBannerStatus(banner: any): void {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active';
    const updateData = { ...banner, status: newStatus };

    this.adminApiService.updateBanner(banner._id, updateData).subscribe({
      next: () => {
        this.loadBanners();
      },
      error: (error: any) => {
        console.error('Error updating banner status:', error);
      }
    });
  }

  duplicateBanner(banner: any): void {
    const duplicateData = {
      ...banner,
      title: banner.title + ' (Copy)',
      status: 'inactive'
    };
    delete duplicateData._id;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;

    this.adminApiService.createBanner(duplicateData).subscribe({
      next: () => {
        this.loadBanners();
      },
      error: (error) => {
        console.error('Error duplicating banner:', error);
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingBanner = null;
    this.bannerForm.reset();
    this.selectedImage = null;
  }

  getBannerImage(banner: any): string {
    return banner.image || 'assets/placeholder-banner.jpg';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'bg-success',
      'inactive': 'bg-warning',
      'scheduled': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }
}
