import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-home-simple',
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <!-- Simple Test Header -->
      <header class="bg-primary text-white py-3">
        <div class="container">
          <h1>Welcome to FurniShop</h1>
          <p>Home page is working!</p>
        </div>
      </header>

      <!-- Main Content -->
      <div class="container my-5">
        <div class="row">
          <div class="col-12">
            <div class="alert alert-success">
              <h4><i class="bi bi-check-circle me-2"></i>Home Page Loaded Successfully!</h4>
              <p>If you can see this message, the home page routing is working correctly.</p>
            </div>
          </div>
        </div>

        <!-- Sample Content Sections -->
        <div class="row mb-5">
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <i class="bi bi-house-door fs-1 text-primary"></i>
                <h5 class="card-title mt-3">Home Furniture</h5>
                <p class="card-text">Discover our beautiful collection of home furniture.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <i class="bi bi-lightbulb fs-1 text-warning"></i>
                <h5 class="card-title mt-3">Lighting</h5>
                <p class="card-text">Illuminate your space with our lighting solutions.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100">
              <div class="card-body text-center">
                <i class="bi bi-palette fs-1 text-info"></i>
                <h5 class="card-title mt-3">Accessories</h5>
                <p class="card-text">Complete your look with our home accessories.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Test -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5><i class="bi bi-nav-link me-2"></i>Navigation Test</h5>
              </div>
              <div class="card-body">
                <p>Try these navigation links:</p>
                <div class="d-flex gap-2 flex-wrap">
                  <a href="/admin" class="btn btn-outline-primary">Admin Panel</a>
                  <a href="/login" class="btn btn-outline-secondary">Login</a>
                  <a href="/register" class="btn btn-outline-info">Register</a>
                  <a href="/wishlist" class="btn btn-outline-success">Wishlist</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-dark text-white py-4 mt-5">
        <div class="container text-center">
          <p>&copy; 2025 FurniShop. All rights reserved.</p>
          <small>This is a test version of the home page.</small>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .card {
      border: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
    }

    .btn {
      margin: 0.25rem;
    }
  `]
})
export class HomeSimpleComponent implements OnInit {

  ngOnInit(): void {
    console.log('🏠 Simple Home component loaded successfully!');
  }
}
