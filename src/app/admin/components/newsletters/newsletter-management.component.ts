import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-newsletter-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="newsletter-management">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Newsletter Management</h2>
        <button class="btn btn-primary" (click)="exportSubscribers()">
          <i class="bi bi-download me-2"></i>
          Export Subscribers
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-primary">{{ stats.totalSubscribers }}</h5>
              <p class="card-text">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-success">{{ stats.activeSubscribers }}</h5>
              <p class="card-text">Active Subscribers</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-warning">{{ stats.pendingSubscribers }}</h5>
              <p class="card-text">Pending Verification</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-info">{{ stats.thisWeekSubscribers }}</h5>
              <p class="card-text">This Week</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscribers List -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Newsletter Subscribers</h5>
          <div class="d-flex gap-2">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="searchTerm"
                   placeholder="Search subscribers..." style="width: 200px;">
            <select class="form-select form-select-sm" [(ngModel)]="filterStatus" style="width: 150px;">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
            <button class="btn btn-sm btn-success" (click)="showAddForm = !showAddForm">
              <i class="bi bi-plus"></i> Add Subscriber
            </button>
          </div>
        </div>
        <div class="card-body">
          <!-- Add Subscriber Form -->
          <div class="alert alert-light" *ngIf="showAddForm">
            <form [formGroup]="subscriberForm" (ngSubmit)="addSubscriber()">
              <div class="row">
                <div class="col-md-4">
                  <input type="email" class="form-control" formControlName="email"
                         placeholder="Enter email address" required>
                </div>
                <div class="col-md-3">
                  <input type="text" class="form-control" formControlName="name"
                         placeholder="Subscriber name (optional)">
                </div>
                <div class="col-md-3">
                  <select class="form-select" formControlName="status">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div class="col-md-2">
                  <button type="submit" class="btn btn-primary w-100" [disabled]="subscriberForm.invalid">
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && subscribers.length === 0" class="text-center py-4">
            <i class="bi bi-envelope fs-1 text-muted"></i>
            <p class="text-muted mt-2">No subscribers found</p>
          </div>

          <div *ngIf="!isLoading && subscribers.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" class="form-check-input"
                           (change)="toggleSelectAll($event)"
                           [checked]="selectedSubscribers.length === filteredSubscribers.length">
                  </th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Subscribed Date</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let subscriber of filteredSubscribers">
                  <td>
                    <input type="checkbox" class="form-check-input"
                           [checked]="selectedSubscribers.includes(subscriber._id)"
                           (change)="toggleSubscriberSelection(subscriber._id, $event)">
                  </td>
                  <td>
                    <div>
                      <strong>{{ subscriber.email }}</strong>
                      <div class="small text-muted" *ngIf="subscriber.verifiedAt">
                        Verified: {{ formatDate(subscriber.verifiedAt) }}
                      </div>
                    </div>
                  </td>
                  <td>{{ subscriber.name || '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(subscriber.status)">
                      {{ subscriber.status }}
                    </span>
                  </td>
                  <td>{{ formatDate(subscriber.subscribedAt || subscriber.createdAt) }}</td>
                  <td>
                    <span class="badge bg-light text-dark">{{ subscriber.source || 'Website' }}</span>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-primary"
                              (click)="updateSubscriberStatus(subscriber, 'active')"
                              *ngIf="subscriber.status !== 'active'" title="Activate">
                        <i class="bi bi-check-circle"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-warning"
                              (click)="updateSubscriberStatus(subscriber, 'pending')"
                              *ngIf="subscriber.status !== 'pending'" title="Set Pending">
                        <i class="bi bi-clock"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-secondary"
                              (click)="updateSubscriberStatus(subscriber, 'unsubscribed')"
                              *ngIf="subscriber.status !== 'unsubscribed'" title="Unsubscribe">
                        <i class="bi bi-x-circle"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger"
                              (click)="deleteSubscriber(subscriber._id!)" title="Delete">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bulk Actions -->
          <div class="d-flex justify-content-between align-items-center mt-3" *ngIf="selectedSubscribers.length > 0">
            <span class="text-muted">{{ selectedSubscribers.length }} selected</span>
            <div class="btn-group">
              <button class="btn btn-sm btn-success" (click)="bulkUpdateStatus('active')">
                Activate Selected
              </button>
              <button class="btn btn-sm btn-warning" (click)="bulkUpdateStatus('unsubscribed')">
                Unsubscribe Selected
              </button>
              <button class="btn btn-sm btn-danger" (click)="bulkDelete()">
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .newsletter-management {
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
  `]
})
export class NewsletterManagementComponent implements OnInit {
  subscriberForm: FormGroup;
  showAddForm = false;
  isLoading = false;

  subscribers: any[] = [];
  selectedSubscribers: string[] = [];
  searchTerm = '';
  filterStatus = '';

  stats = {
    totalSubscribers: 0,
    activeSubscribers: 0,
    pendingSubscribers: 0,
    thisWeekSubscribers: 0
  };

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {
    this.subscriberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: [''],
      status: ['active']
    });
  }

  ngOnInit(): void {
    this.loadSubscribers();
    this.loadStats();
  }

  get filteredSubscribers() {
    return this.subscribers.filter(subscriber => {
      const matchesSearch = !this.searchTerm ||
        subscriber.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        subscriber.name?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.filterStatus || subscriber.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  loadSubscribers(): void {
    this.isLoading = true;
    this.adminApiService.getAllSubscribers().subscribe({
      next: (response) => {
        this.subscribers = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subscribers:', error);
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    // Calculate stats from subscribers data
    this.stats.totalSubscribers = this.subscribers.length;
    this.stats.activeSubscribers = this.subscribers.filter(s => s.status === 'active').length;
    this.stats.pendingSubscribers = this.subscribers.filter(s => s.status === 'pending').length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    this.stats.thisWeekSubscribers = this.subscribers.filter(s =>
      new Date(s.subscribedAt || s.createdAt) > oneWeekAgo
    ).length;
  }

  addSubscriber(): void {
    if (this.subscriberForm.valid) {
      this.adminApiService.addSubscriber(this.subscriberForm.value).subscribe({
        next: () => {
          this.subscriberForm.reset({ status: 'active' });
          this.showAddForm = false;
          this.loadSubscribers();
        },
        error: (error: any) => {
          console.error('Error adding subscriber:', error);
        }
      });
    }
  }

  updateSubscriberStatus(subscriber: any, status: string): void {
    this.adminApiService.updateSubscriber(subscriber._id, { ...subscriber, status }).subscribe({
      next: () => {
        this.loadSubscribers();
      },
      error: (error: any) => {
        console.error('Error updating subscriber:', error);
      }
    });
  }

  deleteSubscriber(id: string): void {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      this.adminApiService.deleteSubscriber(id).subscribe({
        next: () => {
          this.loadSubscribers();
        },
        error: (error: any) => {
          console.error('Error deleting subscriber:', error);
        }
      });
    }
  }

  toggleSubscriberSelection(id: string, event: any): void {
    if (event.target.checked) {
      this.selectedSubscribers.push(id);
    } else {
      this.selectedSubscribers = this.selectedSubscribers.filter(sid => sid !== id);
    }
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedSubscribers = this.filteredSubscribers.map(s => s._id);
    } else {
      this.selectedSubscribers = [];
    }
  }

  bulkUpdateStatus(status: string): void {
    if (this.selectedSubscribers.length === 0) return;

    const updates = this.selectedSubscribers.map(id =>
      this.adminApiService.updateSubscriber(id, { status })
    );

    Promise.all(updates).then(() => {
      this.selectedSubscribers = [];
      this.loadSubscribers();
    });
  }

  bulkDelete(): void {
    if (this.selectedSubscribers.length === 0) return;

    if (confirm(`Are you sure you want to delete ${this.selectedSubscribers.length} subscribers?`)) {
      const deletions = this.selectedSubscribers.map(id =>
        this.adminApiService.deleteSubscriber(id)
      );

      Promise.all(deletions).then(() => {
        this.selectedSubscribers = [];
        this.loadSubscribers();
      });
    }
  }

  exportSubscribers(): void {
    const csvData = this.subscribers.map(sub => ({
      email: sub.email,
      name: sub.name || '',
      status: sub.status,
      subscribedDate: this.formatDate(sub.subscribedAt || sub.createdAt),
      source: sub.source || 'Website'
    }));

    // Convert to CSV and download
    const csv = this.convertToCSV(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'bg-success',
      'pending': 'bg-warning',
      'unsubscribed': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
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
