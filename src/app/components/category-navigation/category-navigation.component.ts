import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService, CategoryTree } from '../../services/category.service';

@Component({
  selector: 'app-category-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="category-navigation" [class.mobile]="isMobile">
      <div class="category-list" *ngIf="!loading">
        <div class="category-item"
             *ngFor="let category of categories"
             [class.has-children]="category.children && category.children.length > 0"
             (mouseenter)="onCategoryHover(category)"
             (mouseleave)="onCategoryLeave()">

          <a [routerLink]="['/products', 'category', category.slug]"
             class="category-link"
             (click)="onCategoryClick(category)">
            <span class="category-icon" *ngIf="category.icon">
              <i [class]="category.icon"></i>
            </span>
            <span class="category-name">{{ category.name }}</span>
            <span class="children-indicator" *ngIf="category.children && category.children.length > 0">
              <i class="fas fa-chevron-right"></i>
            </span>
          </a>

          <!-- Subcategory dropdown -->
          <div class="subcategory-dropdown"
               *ngIf="category.children && category.children.length > 0 && hoveredCategory?._id === category._id"
               [@slideDown]>
            <div class="subcategory-list">
              <a *ngFor="let subcategory of category.children"
                 [routerLink]="['/products', 'category', category.slug, 'subcategory', subcategory.slug]"
                 class="subcategory-link"
                 (click)="onSubcategoryClick(subcategory, category)">
                <span class="subcategory-name">{{ subcategory.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div class="loading-skeleton" *ngIf="loading">
        <div class="skeleton-item" *ngFor="let item of [1,2,3,4,5]"></div>
      </div>

      <!-- Mobile category menu -->
      <div class="mobile-category-menu" *ngIf="isMobile && showMobileMenu">
        <div class="mobile-category-header">
          <h3>Categories</h3>
          <button class="close-btn" (click)="closeMobileMenu()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="mobile-category-list">
          <div class="mobile-category-item" *ngFor="let category of categories">
            <div class="mobile-category-main"
                 (click)="toggleMobileCategory(category)">
              <span class="category-name">{{ category.name }}</span>
              <span class="toggle-icon" *ngIf="category.children && category.children.length > 0">
                <i [class]="expandedMobileCategory?._id === category._id ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
              </span>
            </div>

            <div class="mobile-subcategories"
                 *ngIf="category.children && expandedMobileCategory?._id === category._id"
                 [@slideDown]>
              <a *ngFor="let subcategory of category.children"
                 [routerLink]="['/products', 'category', category.slug, 'subcategory', subcategory.slug]"
                 class="mobile-subcategory-link"
                 (click)="closeMobileMenu()">
                {{ subcategory.name }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./category-navigation.component.scss'],
  animations: [
    // Add slide down animation
  ]
})
export class CategoryNavigationComponent implements OnInit {
  @Input() isMobile = false;
  @Input() showMobileMenu = false;
  @Output() categorySelected = new EventEmitter<CategoryTree>();
  @Output() subcategorySelected = new EventEmitter<{subcategory: CategoryTree, category: CategoryTree}>();
  @Output() mobileMenuClosed = new EventEmitter<void>();

  categories: CategoryTree[] = [];
  loading = true;
  hoveredCategory: CategoryTree | null = null;
  expandedMobileCategory: CategoryTree | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getCategoriesTree().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.categoriesTree;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.loading = false;
      }
    });
  }

  onCategoryHover(category: CategoryTree) {
    if (!this.isMobile) {
      this.hoveredCategory = category;
    }
  }

  onCategoryLeave() {
    if (!this.isMobile) {
      this.hoveredCategory = null;
    }
  }

  onCategoryClick(category: CategoryTree) {
    this.categorySelected.emit(category);
    if (this.isMobile) {
      this.closeMobileMenu();
    }
  }

  onSubcategoryClick(subcategory: CategoryTree, category: CategoryTree) {
    this.subcategorySelected.emit({ subcategory, category });
    if (this.isMobile) {
      this.closeMobileMenu();
    }
  }

  toggleMobileCategory(category: CategoryTree) {
    if (this.expandedMobileCategory?._id === category._id) {
      this.expandedMobileCategory = null;
    } else {
      this.expandedMobileCategory = category;
    }
  }

  closeMobileMenu() {
    this.expandedMobileCategory = null;
    this.mobileMenuClosed.emit();
  }
}
