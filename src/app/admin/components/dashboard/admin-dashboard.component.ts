import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <div class="dashboard-header bg-primary text-white p-4 mb-4">
        <div class="container-fluid">
          <h1 class="h3 mb-0">Admin Dashboard</h1>
          <p class="mb-0">Manage your e-commerce content</p>
        </div>
      </div>

      <div class="container-fluid">
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ stats.totalProducts }}</h4>
                    <p class="card-text">Total Products</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-box-seam fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ stats.totalBlogs }}</h4>
                    <p class="card-text">Blog Posts</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-journal-text fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ stats.totalPromos }}</h4>
                    <p class="card-text">Promotions</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-megaphone fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ newsletterStats.totalSubscribers || 0 }}</h4>
                    <p class="card-text">Subscribers</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-envelope fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-primary w-100" routerLink="/admin/products/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Product
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-success w-100" routerLink="/admin/blogs/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Blog Post
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-warning w-100" routerLink="/admin/promos/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Promotion
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-info w-100" routerLink="/admin/banners/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Banner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Management Sections -->
        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Content Management</h5>
              </div>
              <div class="card-body">
                <div class="list-group list-group-flush">
                  <a routerLink="/admin/products" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-box-seam me-2"></i>Manage Products</span>
                    <span class="badge bg-primary rounded-pill">{{ stats.totalProducts }}</span>
                  </a>
                  <a routerLink="/admin/blogs" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-journal-text me-2"></i>Manage Blogs</span>
                    <span class="badge bg-success rounded-pill">{{ stats.totalBlogs }}</span>
                  </a>
                  <a routerLink="/admin/promos" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-megaphone me-2"></i>Manage Promotions</span>
                    <span class="badge bg-warning rounded-pill">{{ stats.totalPromos }}</span>
                  </a>
                  <a routerLink="/admin/banners" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-image me-2"></i>Manage Banners</span>
                    <span class="badge bg-info rounded-pill">1</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Recent Activity</h5>
              </div>
              <div class="card-body">
                <div class="timeline" *ngIf="recentActivities.length > 0; else noActivity">
                  <div class="timeline-item mb-3" *ngFor="let activity of recentActivities">
                    <div class="d-flex">
                      <div class="activity-icon me-3">
                        <i class="bi" [ngClass]="getActivityIcon(activity.type)"></i>
                      </div>
                      <div>
                        <h6 class="mb-1">{{ activity.title }}</h6>
                        <p class="text-muted small mb-0">{{ activity.time }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <ng-template #noActivity>
                  <p class="text-muted text-center">No recent activity</p>
                </ng-template>
              </div>
            </div>
          </div>
        </div>

        <!-- Homepage Preview -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Homepage Preview</h5>
                <button class="btn btn-outline-primary btn-sm" (click)="refreshHomepageData()">
                  <i class="bi bi-arrow-clockwise me-1"></i>
                  Refresh
                </button>
              </div>
              <div class="card-body">
                <div class="row" *ngIf="homepageData; else loadingHomepage">
                  <!-- Featured Products Preview -->
                  <div class="col-md-6 mb-3">
                    <h6>Featured Products ({{ homepageData.featuredProducts?.length || 0 }})</h6>
                    <div class="row">
                      <div class="col-4" *ngFor="let product of homepageData.featuredProducts?.slice(0, 3)">
                        <div class="card card-sm">
                          <img [src]="product.image" class="card-img-top" style="height: 60px; object-fit: cover;" [alt]="product.title">
                          <div class="card-body p-2">
                            <h6 class="card-title small">{{ product.title }}</h6>
                            <p class="card-text small text-muted">£{{ product.price }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Blog Posts Preview -->
                  <div class="col-md-6 mb-3">
                    <h6>Latest Blogs ({{ homepageData.blogCards?.length || 0 }})</h6>
                    <div class="list-group">
                      <div class="list-group-item" *ngFor="let blog of homepageData.blogCards?.slice(0, 3)">
                        <div class="d-flex">
                          <img [src]="blog.image" class="me-3" style="width: 50px; height: 50px; object-fit: cover;" [alt]="blog.title">
                          <div>
                            <h6 class="mb-1 small">{{ blog.title }}</h6>
                            <p class="mb-0 small text-muted">{{ blog.date }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <ng-template #loadingHomepage>
                  <div class="text-center py-4">
                    <div class="spinner-border" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .card {
      border: none;
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border-radius: 0.5rem;
    }

    .card-sm {
      font-size: 0.875rem;
    }

    .timeline-item {
      border-left: 2px solid #e9ecef;
      padding-left: 1rem;
      margin-left: 1rem;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: -1.6rem;
    }

    .list-group-item {
      border: none;
      border-bottom: 1px solid #e9ecef;
    }

    .list-group-item:last-child {
      border-bottom: none;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    totalBlogs: 0,
    totalPromos: 0,
    featuredProducts: 0,
    topRatedProducts: 0
  };

  newsletterStats = {
    totalSubscribers: 0
  };

  homepageData: any = null;

  recentActivities = [
    {
      type: 'product',
      title: 'New product added to featured list',
      time: '2 hours ago'
    },
    {
      type: 'blog',
      title: 'Blog post published',
      time: '5 hours ago'
    },
    {
      type: 'promo',
      title: 'Promotion updated',
      time: '1 day ago'
    }
  ];

  constructor(private adminApiService: AdminApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Load dashboard stats
    this.adminApiService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = { ...this.stats, ...data };
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Load newsletter stats
    this.adminApiService.getNewsletterStats().subscribe({
      next: (data) => {
        this.newsletterStats = data.data || {};
      },
      error: (error) => {
        console.error('Error loading newsletter stats:', error);
      }
    });

    this.refreshHomepageData();
  }

  refreshHomepageData(): void {
    // This would typically come from the homepage API
    // For now, we'll simulate it
    setTimeout(() => {
      this.homepageData = {
        featuredProducts: [
          { title: 'Signature Chair', price: 499, image: 'assets/furniture/chair-1.jpg' },
          { title: 'Classic Chair', price: 259, image: 'assets/furniture/chair-2.jpg' },
          { title: 'Wing Chair', price: 319, image: 'assets/furniture/chair-3.jpg' }
        ],
        blogCards: [
          { title: 'Underground Apartment Design', date: 'Jul 12, 2025', image: 'assets/furniture/blog-1.jpg' },
          { title: 'Nordic Living Essentials', date: 'Aug 01, 2025', image: 'assets/furniture/blog-2.jpg' }
        ]
      };
    }, 1000);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'product': return 'bi-box-seam';
      case 'blog': return 'bi-journal-text';
      case 'promo': return 'bi-megaphone';
      case 'banner': return 'bi-image';
      default: return 'bi-circle';
    }
  }
}
