import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./components/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./components/products/product-management.component').then(m => m.ProductManagementComponent)
      },
      {
        path: 'products/create',
        loadComponent: () => import('./components/products/product-create.component').then(m => m.ProductCreateComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/categories/category-management.component').then(m => m.CategoryManagementComponent)
      },
      {
        path: 'blogs',
        loadComponent: () => import('./components/blogs/blog-management.component').then(m => m.BlogManagementComponent)
      },
      {
        path: 'promos',
        loadComponent: () => import('./components/promos/promo-management.component').then(m => m.PromoManagementComponent)
      },
      {
        path: 'banners',
        loadComponent: () => import('./components/banners/banner-management-simple.component').then(m => m.BannerManagementSimpleComponent)
      },
      {
        path: 'newsletters',
        loadComponent: () => import('./components/newsletters/newsletter-management.component').then(m => m.NewsletterManagementComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./components/reviews/review-management.component').then(m => m.ReviewManagementComponent)
      }
    ]
  }
];
