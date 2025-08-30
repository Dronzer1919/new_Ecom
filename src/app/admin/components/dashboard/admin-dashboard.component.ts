import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { EcommerceApiService } from '../../../services/ecommerce-api.service';

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
            <div class="card gradient-blue text-white">
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
            <div class="card gradient-green text-white">
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
            <div class="card gradient-orange text-white">
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
            <div class="card gradient-purple text-white">
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
                    <button class="btn btn-gradient-blue w-100" routerLink="/admin/products/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Product
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-gradient-green w-100" routerLink="/admin/blogs/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Blog Post
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-gradient-orange w-100" routerLink="/admin/promos/create">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Promotion
                    </button>
                  </div>
                  <div class="col-md-3 mb-3">
                    <button class="btn btn-gradient-purple w-100" routerLink="/admin/banners/create">
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
                  <a routerLink="/admin/products" class="list-group-item list-group-item-action list-item-gradient-blue d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-box-seam me-2"></i>Manage Products</span>
                    <span class="badge badge-gradient-blue rounded-pill">{{ stats.totalProducts }}</span>
                  </a>
                  <a routerLink="/admin/blogs" class="list-group-item list-group-item-action list-item-gradient-green d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-journal-text me-2"></i>Manage Blogs</span>
                    <span class="badge badge-gradient-green rounded-pill">{{ stats.totalBlogs }}</span>
                  </a>
                  <a routerLink="/admin/promos" class="list-group-item list-group-item-action list-item-gradient-orange d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-megaphone me-2"></i>Manage Promotions</span>
                    <span class="badge badge-gradient-orange rounded-pill">{{ stats.totalPromos }}</span>
                  </a>
                  <a routerLink="/admin/banners" class="list-group-item list-group-item-action list-item-gradient-purple d-flex justify-content-between align-items-center">
                    <span><i class="bi bi-image me-2"></i>Manage Banners</span>
                    <span class="badge badge-gradient-purple rounded-pill">1</span>
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
                <button class="btn btn-gradient-blue btn-sm" (click)="refreshHomepageData()">
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
                          <img [src]="getProductImage(product)" class="card-img-top" style="height: 60px; object-fit: cover;" [alt]="product.title">
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
                          <img [src]="getBlogImage(blog)" class="me-3" style="width: 50px; height: 50px; object-fit: cover;" [alt]="blog.title">
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
      transition: all 0.3s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    /* Different gradient for each card */
    .gradient-blue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .gradient-green {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
    }

    .gradient-orange {
      background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
    }

    .gradient-purple {
      background: linear-gradient(135deg, #8360c3 0%, #2ebf91 100%);
    }

    /* Button gradients to match cards */
    .btn-gradient-blue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      transition: all 0.3s ease;
    }

    .btn-gradient-blue:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 0.25rem 0.5rem rgba(102, 126, 234, 0.4);
    }

    .btn-gradient-green {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
      color: white;
      border: none;
      transition: all 0.3s ease;
    }

    .btn-gradient-green:hover {
      background: linear-gradient(135deg, #4a9629 0%, #96dab7 100%);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 0.25rem 0.5rem rgba(86, 171, 47, 0.4);
    }

    .btn-gradient-orange {
      background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
      color: white;
      border: none;
      transition: all 0.3s ease;
    }

    .btn-gradient-orange:hover {
      background: linear-gradient(135deg, #e65e00 0%, #d4086b 100%);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 0.25rem 0.5rem rgba(255, 106, 0, 0.4);
    }

    .btn-gradient-purple {
      background: linear-gradient(135deg, #8360c3 0%, #2ebf91 100%);
      color: white;
      border: none;
      transition: all 0.3s ease;
    }

    .btn-gradient-purple:hover {
      background: linear-gradient(135deg, #7554b1 0%, #29ab7f 100%);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 0.25rem 0.5rem rgba(131, 96, 195, 0.4);
    }

    /* Small button variants */
    .btn-sm.btn-gradient-blue:hover,
    .btn-sm.btn-gradient-green:hover,
    .btn-sm.btn-gradient-orange:hover,
    .btn-sm.btn-gradient-purple:hover {
      transform: translateY(-1px);
      box-shadow: 0 0.15rem 0.3rem rgba(0, 0, 0, 0.2);
    }

    /* Badge gradients to match cards */
    .badge-gradient-blue {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .badge-gradient-green {
      background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
      color: white;
    }

    .badge-gradient-orange {
      background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%);
      color: white;
    }

    .badge-gradient-purple {
      background: linear-gradient(135deg, #8360c3 0%, #2ebf91 100%);
      color: white;
    }

    /* List item gradients to match cards */
    .list-item-gradient-blue {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
    }

    .list-item-gradient-blue:hover {
      background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
      border-left-color: #5a6fd8;
      transform: translateX(5px);
    }

    .list-item-gradient-green {
      background: linear-gradient(90deg, rgba(86, 171, 47, 0.1) 0%, rgba(168, 230, 207, 0.1) 100%);
      border-left: 4px solid #56ab2f;
      transition: all 0.3s ease;
    }

    .list-item-gradient-green:hover {
      background: linear-gradient(90deg, rgba(86, 171, 47, 0.2) 0%, rgba(168, 230, 207, 0.2) 100%);
      border-left-color: #4a9629;
      transform: translateX(5px);
    }

    .list-item-gradient-orange {
      background: linear-gradient(90deg, rgba(255, 106, 0, 0.1) 0%, rgba(238, 9, 121, 0.1) 100%);
      border-left: 4px solid #ff6a00;
      transition: all 0.3s ease;
    }

    .list-item-gradient-orange:hover {
      background: linear-gradient(90deg, rgba(255, 106, 0, 0.2) 0%, rgba(238, 9, 121, 0.2) 100%);
      border-left-color: #e65e00;
      transform: translateX(5px);
    }

    .list-item-gradient-purple {
      background: linear-gradient(90deg, rgba(131, 96, 195, 0.1) 0%, rgba(46, 191, 145, 0.1) 100%);
      border-left: 4px solid #8360c3;
      transition: all 0.3s ease;
    }

    .list-item-gradient-purple:hover {
      background: linear-gradient(90deg, rgba(131, 96, 195, 0.2) 0%, rgba(46, 191, 145, 0.2) 100%);
      border-left-color: #7554b1;
      transform: translateX(5px);
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
      margin-bottom: 2px;
      border-radius: 0.375rem;
    }

    .list-group-item:last-child {
      border-bottom: none;
    }

    .list-group-item-action {
      color: #495057;
    }

    .list-group-item-action:hover {
      color: #495057;
      text-decoration: none;
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

  constructor(
    private adminApiService: AdminApiService,
    private ecommerceApiService: EcommerceApiService
  ) {}

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
    console.log('🔄 Loading homepage data for dashboard preview...');
    this.ecommerceApiService.getHomepageData().subscribe({
      next: (data) => {
        console.log('✅ Homepage data loaded:', data);
        this.homepageData = {
          featuredProducts: data.featuredProducts?.slice(0, 3) || [],
          blogCards: data.blogCards?.slice(0, 3) || []
        };
        console.log('📦 Featured products for preview:', this.homepageData.featuredProducts);
        console.log('📝 Blog cards for preview:', this.homepageData.blogCards);
      },
      error: (error) => {
        console.error('❌ Error loading homepage data:', error);
        // Fallback to placeholder data if API fails
        this.homepageData = {
          featuredProducts: [
            {
              id: '1',
              title: 'Sample Product',
              price: 299,
              image: 'http://localhost:3000/uploads/placeholder-product.jpg'
            }
          ],
          blogCards: [
            {
              id: '1',
              title: 'Sample Blog Post',
              date: new Date().toLocaleDateString(),
              image: 'http://localhost:3000/uploads/placeholder-blog.jpg',
              excerpt: 'Sample blog excerpt...'
            }
          ]
        };
      }
    });
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

  getProductImage(product: any): string {
    if (product.images && product.images.length > 0) {
      return `http://localhost:3000/uploads/${product.images[0]}`;
    }
    if (product.image) {
      if (product.image.startsWith('http')) {
        return product.image;
      }
      return `http://localhost:3000${product.image}`;
    }
    return 'http://localhost:3000/uploads/placeholder-product.jpg';
  }

  getBlogImage(blog: any): string {
    if (blog.image) {
      if (typeof blog.image === 'string') {
        if (blog.image.startsWith('http')) {
          return blog.image;
        }
        return `http://localhost:3000${blog.image}`;
      } else if (blog.image.url) {
        if (blog.image.url.startsWith('http')) {
          return blog.image.url;
        }
        return `http://localhost:3000${blog.image.url}`;
      }
    }
    return 'http://localhost:3000/uploads/placeholder-blog.jpg';
  }
}
