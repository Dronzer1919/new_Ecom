import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService, AdminBanner } from '../../services/admin-api.service';

@Component({
  selector: 'app-banner-management-simple',
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

      <!-- Create Form -->
      <div class="card mb-4" *ngIf="showCreateForm">
        <div class="card-header">
          <h5 class="mb-0">Upload New Banner</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="bannerForm" (ngSubmit)="onSubmit()" enctype="multipart/form-data">
            <div class="row">
              <div class="col-md-8">
                <!-- Banner Image -->
                <div class="mb-3">
                  <label class="form-label">Banner Image *</label>
                  <input type="file" class="form-control" (change)="onImageSelect($event)"
                         accept="image/*" [class.is-invalid]="!selectedImage && bannerForm.get('imageUrl')?.touched">
                  <div class="small text-muted">Upload banner image (JPG, PNG, WEBP). Recommended size: 1920x600px</div>
                  <div *ngIf="!selectedImage && bannerForm.get('imageUrl')?.touched"
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
              </div>

              <div class="col-md-4">
                <div class="alert alert-info">
                  <h6><i class="bi bi-info-circle me-2"></i>Upload Instructions</h6>
                  <ul class="mb-0 small">
                    <li>Use high-quality images</li>
                    <li>Recommended size: 1920x600px</li>
                    <li>File formats: JPG, PNG, WEBP</li>
                    <li>Max file size: 5MB</li>
                  </ul>
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
                    Upload Banner
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
          <h5 class="mb-0">Uploaded Banners</h5>
          <button class="btn btn-outline-primary btn-sm" (click)="loadBanners()">
            <i class="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && banners.length === 0" class="text-center py-5">
            <i class="bi bi-image fs-1 text-muted"></i>
            <p class="text-muted mt-2">No banners uploaded yet</p>
            <button class="btn btn-primary" (click)="showCreateForm = true">
              <i class="bi bi-plus-circle me-2"></i>
              Upload Your First Banner
            </button>
          </div>

          <div *ngIf="!isLoading && banners.length > 0">
            <div class="row">
              <div class="col-md-6 col-lg-4 mb-4" *ngFor="let banner of banners; let i = index">
                <div class="card h-100">
                  <div class="position-relative">
                    <img [src]="getBannerImage(banner)" class="card-img-top"
                         style="height: 200px; object-fit: cover;" [alt]="'Banner ' + (i + 1)">
                    <div class="position-absolute top-0 end-0 m-2">
                      <div class="btn-group">
                        <button class="btn btn-sm btn-light" (click)="viewBanner(banner)" title="View Full Size">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" (click)="deleteBanner(banner._id)" title="Delete">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-muted">
                        <i class="bi bi-calendar me-1"></i>
                        {{ formatDate(banner.createdAt) }}
                      </small>
                      <span class="badge bg-success">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for viewing banner -->
    <div class="modal fade" id="bannerModal" tabindex="-1" *ngIf="selectedBannerForView">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Banner Preview</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <img [src]="getBannerImage(selectedBannerForView)" class="img-fluid" alt="Banner">
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

    .form-label {
      font-weight: 500;
      color: #495057;
    }

    .btn-group .btn {
      padding: 0.25rem 0.5rem;
    }

    .card-img-top {
      border-radius: 0.375rem 0.375rem 0 0;
    }

    .position-relative .btn-group {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .position-relative:hover .btn-group {
      opacity: 1;
    }
  `]
})
export class BannerManagementSimpleComponent implements OnInit {
  bannerForm: FormGroup;
  showCreateForm = false;
  isLoading = false;

  banners: any[] = [];
  selectedImage: { file: File; preview: string } | null = null;
  selectedBannerForView: any = null;

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
      imageUrl: ['', Validators.required]
    });
  }

  loadBanners(): void {
    this.isLoading = true;
    this.adminApiService.getAllBanners().subscribe({
      next: (response) => {
        console.log('Banners response:', response);
        this.banners = response.data || response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading banners:', error);
        this.isLoading = false;
        alert('Error loading banners: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = {
          file,
          preview: e.target?.result as string
        };
        this.bannerForm.patchValue({ imageUrl: 'selected' });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.bannerForm.patchValue({ imageUrl: '' });
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.bannerForm.valid && this.selectedImage) {
      const bannerData: AdminBanner = {
        imageUrl: this.selectedImage.file
      };

      console.log('Submitting banner:', bannerData);
      this.isLoading = true;

      this.adminApiService.createBanner(bannerData).subscribe({
        next: (response) => {
          console.log('Banner uploaded successfully:', response);
          this.isLoading = false;
          alert('Banner uploaded successfully!');
          this.cancelForm();
          this.loadBanners();
        },
        error: (error) => {
          console.error('Error uploading banner:', error);
          this.isLoading = false;

          let errorMessage = 'Error uploading banner: ';
          if (error.error && error.error.error) {
            errorMessage += error.error.error;
          } else if (error.error && error.error.message) {
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
      console.log('Form is invalid or no image selected');
      alert('Please select an image file.');
    }
  }

  deleteBanner(id: string): void {
    if (confirm('Are you sure you want to delete this banner?')) {
      this.adminApiService.deleteBanner(id).subscribe({
        next: () => {
          alert('Banner deleted successfully!');
          this.loadBanners();
        },
        error: (error) => {
          console.error('Error deleting banner:', error);
          let errorMessage = 'Error deleting banner: ';
          if (error.error && error.error.error) {
            errorMessage += error.error.error;
          } else if (error.error && error.error.message) {
            errorMessage += error.error.message;
          } else if (error.message) {
            errorMessage += error.message;
          } else {
            errorMessage += 'Unknown error occurred';
          }
          alert(errorMessage);
        }
      });
    }
  }

  viewBanner(banner: any): void {
    this.selectedBannerForView = banner;
    // You can use Bootstrap modal here if available
    // For now, just open in new tab
    window.open(this.getBannerImage(banner), '_blank');
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.bannerForm.reset();
    this.selectedImage = null;

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getBannerImage(banner: any): string {
    if (banner.imageUrl) {
      // If imageUrl starts with /, prepend base URL
      if (banner.imageUrl.startsWith('/')) {
        return `http://localhost:3000${banner.imageUrl}`;
      }
      return banner.imageUrl;
    }
    return 'assets/placeholder-banner.jpg';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
