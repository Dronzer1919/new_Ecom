import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="admin-layout">
      <!-- Top Navigation Bar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" routerLink="/admin">
            <i class="bi bi-gear-fill me-2"></i>
            Admin Panel
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">
                  <i class="bi bi-speedometer2 me-1"></i>Dashboard
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/products" routerLinkActive="active">
                  <i class="bi bi-box me-1"></i>Products
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/categories" routerLinkActive="active">
                  <i class="bi bi-tags me-1"></i>Categories
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/blogs" routerLinkActive="active">
                  <i class="bi bi-journal-text me-1"></i>Blogs
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/promos" routerLinkActive="active">
                  <i class="bi bi-percent me-1"></i>Promos
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/banners" routerLinkActive="active">
                  <i class="bi bi-image me-1"></i>Banners
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/newsletters" routerLinkActive="active">
                  <i class="bi bi-envelope me-1"></i>Newsletter
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin/reviews" routerLinkActive="active">
                  <i class="bi bi-star me-1"></i>Reviews
                </a>
              </li>
            </ul>

            <ul class="navbar-nav">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                  <i class="bi bi-person-circle me-1"></i>Admin
                </a>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
                  <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" routerLink="/"><i class="bi bi-house me-2"></i>View Website</a></li>
                  <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>

      <!-- Footer -->
      <footer class="admin-footer">
        <div class="container-fluid">
          <div class="row">
            <div class="col-12 text-center">
              <small class="text-muted">
                © 2024 E-Commerce Admin Panel. All rights reserved.
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .admin-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
      z-index: 1000;
    }

    .navbar-brand {
      font-weight: 600;
    }

    .nav-link {
      border-radius: 4px;
      margin: 0 2px;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background-color: rgba(255,255,255,0.1);
    }

    .nav-link.active {
      background-color: rgba(255,255,255,0.2);
      font-weight: 500;
    }

    .main-content {
      flex: 1;
      background-color: #f8f9fa;
      min-height: calc(100vh - 120px);
    }

    .admin-footer {
      background-color: #fff;
      border-top: 1px solid #dee2e6;
      padding: 15px 0;
      margin-top: auto;
    }

    .dropdown-menu {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    @media (max-width: 768px) {
      .navbar-nav {
        text-align: center;
      }

      .nav-link {
        margin: 4px 0;
      }
    }
  `]
})
export class AdminLayoutComponent {}
