import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="review-management">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Review Management</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" (click)="showStats = !showStats">
            <i class="bi bi-graph-up me-2"></i>
            {{ showStats ? 'Hide' : 'Show' }} Statistics
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4" *ngIf="showStats">
        <div class="col-md-2">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-primary">{{ stats.totalReviews }}</h5>
              <p class="card-text small">Total Reviews</p>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-success">{{ stats.approvedReviews }}</h5>
              <p class="card-text small">Approved</p>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-warning">{{ stats.pendingReviews }}</h5>
              <p class="card-text small">Pending</p>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-danger">{{ stats.rejectedReviews }}</h5>
              <p class="card-text small">Rejected</p>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-info">{{ stats.averageRating.toFixed(1) }}</h5>
              <p class="card-text small">Avg Rating</p>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-secondary">{{ stats.thisWeekReviews }}</h5>
              <p class="card-text small">This Week</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Customer Reviews</h5>
          <div class="d-flex gap-2">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="searchTerm"
                   placeholder="Search reviews..." style="width: 200px;">
            <select class="form-select form-select-sm" [(ngModel)]="filterStatus" style="width: 130px;">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select class="form-select form-select-sm" [(ngModel)]="filterRating" style="width: 120px;">
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && reviews.length === 0" class="text-center py-4">
            <i class="bi bi-star fs-1 text-muted"></i>
            <p class="text-muted mt-2">No reviews found</p>
          </div>

          <div *ngIf="!isLoading && reviews.length > 0">
            <div class="row">
              <div class="col-12" *ngFor="let review of filteredReviews">
                <div class="card mb-3" [ngClass]="getReviewCardClass(review.status)">
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-8">
                        <!-- Review Header -->
                        <div class="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 class="mb-1">{{ review.customerName || review.user?.name || 'Anonymous' }}</h6>
                            <div class="d-flex align-items-center">
                              <div class="me-2">
                                <span *ngFor="let star of getStarArray(review.rating)"
                                      class="text-warning">★</span>
                                <span *ngFor="let star of getStarArray(5 - review.rating)"
                                      class="text-muted">☆</span>
                              </div>
                              <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                            </div>
                          </div>
                          <span class="badge" [ngClass]="getStatusClass(review.status)">
                            {{ review.status }}
                          </span>
                        </div>

                        <!-- Product Info -->
                        <div class="mb-2" *ngIf="review.product">
                          <small class="text-muted">
                            Product: <strong>{{ review.product.title || review.productName }}</strong>
                          </small>
                        </div>

                        <!-- Review Content -->
                        <p class="mb-2">{{ review.comment }}</p>

                        <!-- Additional Info -->
                        <div class="small text-muted">
                          <span *ngIf="review.isVerifiedPurchase" class="badge bg-success me-2">Verified Purchase</span>
                          <span *ngIf="review.helpful > 0">{{ review.helpful }} people found this helpful</span>
                        </div>
                      </div>

                      <div class="col-md-4">
                        <!-- Admin Actions -->
                        <div class="d-flex flex-column gap-2">
                          <div class="btn-group" role="group" *ngIf="review.status === 'pending'">
                            <button class="btn btn-sm btn-success" (click)="updateReviewStatus(review, 'approved')">
                              <i class="bi bi-check-circle me-1"></i>Approve
                            </button>
                            <button class="btn btn-sm btn-danger" (click)="updateReviewStatus(review, 'rejected')">
                              <i class="bi bi-x-circle me-1"></i>Reject
                            </button>
                          </div>

                          <div class="btn-group" role="group" *ngIf="review.status !== 'pending'">
                            <button class="btn btn-sm btn-outline-warning"
                                    (click)="updateReviewStatus(review, 'pending')"
                                    *ngIf="review.status !== 'pending'">
                              <i class="bi bi-clock me-1"></i>Mark Pending
                            </button>
                            <button class="btn btn-sm btn-outline-success"
                                    (click)="updateReviewStatus(review, 'approved')"
                                    *ngIf="review.status !== 'approved'">
                              <i class="bi bi-check-circle me-1"></i>Approve
                            </button>
                            <button class="btn btn-sm btn-outline-danger"
                                    (click)="updateReviewStatus(review, 'rejected')"
                                    *ngIf="review.status !== 'rejected'">
                              <i class="bi bi-x-circle me-1"></i>Reject
                            </button>
                          </div>

                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" (click)="viewProduct(review.product?._id)">
                              <i class="bi bi-box me-1"></i>View Product
                            </button>
                            <button class="btn btn-sm btn-outline-info" (click)="editReview(review)">
                              <i class="bi bi-pencil me-1"></i>Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" (click)="deleteReview(review._id!)">
                              <i class="bi bi-trash me-1"></i>Delete
                            </button>
                          </div>

                          <!-- Admin Notes -->
                          <div class="mt-2" *ngIf="review.adminNotes">
                            <small class="text-muted">
                              <strong>Admin Notes:</strong><br>
                              {{ review.adminNotes }}
                            </small>
                          </div>

                          <!-- Add Admin Note -->
                          <div class="mt-2" *ngIf="editingReview === review._id">
                            <textarea class="form-control form-control-sm"
                                      [(ngModel)]="adminNote"
                                      placeholder="Add admin note..." rows="2"></textarea>
                            <div class="d-flex gap-1 mt-1">
                              <button class="btn btn-sm btn-primary" (click)="saveAdminNote(review)">Save</button>
                              <button class="btn btn-sm btn-secondary" (click)="cancelEditNote()">Cancel</button>
                            </div>
                          </div>
                          <button class="btn btn-sm btn-outline-secondary"
                                  (click)="startEditNote(review)"
                                  *ngIf="editingReview !== review._id">
                            <i class="bi bi-note me-1"></i>Add Note
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .review-management {
      padding: 20px;
    }

    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }

    .card.border-warning {
      border-left: 4px solid #ffc107 !important;
    }

    .card.border-success {
      border-left: 4px solid #198754 !important;
    }

    .card.border-danger {
      border-left: 4px solid #dc3545 !important;
    }

    .btn-group .btn {
      padding: 0.25rem 0.5rem;
    }

    .star-rating {
      color: #ffc107;
    }
  `]
})
export class ReviewManagementComponent implements OnInit {
  isLoading = false;
  showStats = true;
  editingReview: string | null = null;
  adminNote = '';

  reviews: any[] = [];
  searchTerm = '';
  filterStatus = '';
  filterRating = '';

  stats = {
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    rejectedReviews: 0,
    averageRating: 0,
    thisWeekReviews: 0
  };

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  get filteredReviews() {
    return this.reviews.filter(review => {
      const matchesSearch = !this.searchTerm ||
        review.comment.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        review.customerName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        review.productName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || review.status === this.filterStatus;
      const matchesRating = !this.filterRating || review.rating.toString() === this.filterRating;

      return matchesSearch && matchesStatus && matchesRating;
    });
  }

  loadReviews(): void {
    this.isLoading = true;
    this.adminApiService.getAllReviews().subscribe({
      next: (response: any) => {
        this.reviews = response.data || [];
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.totalReviews = this.reviews.length;
    this.stats.approvedReviews = this.reviews.filter(r => r.status === 'approved').length;
    this.stats.pendingReviews = this.reviews.filter(r => r.status === 'pending').length;
    this.stats.rejectedReviews = this.reviews.filter(r => r.status === 'rejected').length;

    const totalRatings = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.stats.averageRating = this.reviews.length > 0 ? totalRatings / this.reviews.length : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    this.stats.thisWeekReviews = this.reviews.filter(r =>
      new Date(r.createdAt) > oneWeekAgo
    ).length;
  }

  updateReviewStatus(review: any, status: string): void {
    this.adminApiService.updateReview(review._id, { ...review, status }).subscribe({
      next: () => {
        review.status = status;
        this.calculateStats();
      },
      error: (error: any) => {
        console.error('Error updating review status:', error);
      }
    });
  }

  deleteReview(id: string): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.adminApiService.deleteReview(id).subscribe({
        next: () => {
          this.loadReviews();
        },
        error: (error: any) => {
          console.error('Error deleting review:', error);
        }
      });
    }
  }

  editReview(review: any): void {
    // This could open a modal or navigate to edit page
    console.log('Edit review:', review);
  }

  viewProduct(productId: string): void {
    if (productId) {
      // Navigate to product management with product ID
      console.log('View product:', productId);
    }
  }

  startEditNote(review: any): void {
    this.editingReview = review._id;
    this.adminNote = review.adminNotes || '';
  }

  saveAdminNote(review: any): void {
    this.adminApiService.updateReview(review._id, { ...review, adminNotes: this.adminNote }).subscribe({
      next: () => {
        review.adminNotes = this.adminNote;
        this.cancelEditNote();
      },
      error: (error: any) => {
        console.error('Error saving admin note:', error);
      }
    });
  }

  cancelEditNote(): void {
    this.editingReview = null;
    this.adminNote = '';
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-warning',
      'approved': 'bg-success',
      'rejected': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getReviewCardClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'border-warning',
      'approved': 'border-success',
      'rejected': 'border-danger'
    };
    return classes[status] || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
