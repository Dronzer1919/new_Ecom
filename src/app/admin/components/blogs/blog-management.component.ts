import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminApiService, AdminBlog } from '../../services/admin-api.service';

@Component({
  selector: 'app-blog-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="blog-management">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Blog Management</h2>
        <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
          <i class="bi bi-plus-circle me-2"></i>
          {{ showCreateForm ? 'Cancel' : 'Add Blog Post' }}
        </button>
      </div>

      <!-- Create/Edit Form -->
      <div class="card mb-4" *ngIf="showCreateForm">
        <div class="card-header">
          <h5 class="mb-0">{{ editingBlog ? 'Edit Blog Post' : 'Create New Blog Post' }}</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="blogForm" (ngSubmit)="onSubmit()" enctype="multipart/form-data">
            <div class="row">
              <!-- Basic Information -->
              <div class="col-md-8">
                <div class="mb-3">
                  <label class="form-label">Title *</label>
                  <input type="text" class="form-control" formControlName="title"
                         placeholder="Enter blog post title"
                         [class.is-invalid]="blogForm.get('title')?.invalid && blogForm.get('title')?.touched">
                  <div *ngIf="blogForm.get('title')?.invalid && blogForm.get('title')?.touched"
                       class="text-danger small">
                    <div *ngIf="blogForm.get('title')?.errors?.['required']">Title is required</div>
                    <div *ngIf="blogForm.get('title')?.errors?.['minlength']">Title must be at least 3 characters</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Excerpt</label>
                  <textarea class="form-control" formControlName="excerpt" rows="3"
                            placeholder="Brief description of the blog post"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Content *</label>
                  <textarea class="form-control" formControlName="content" rows="12"
                            placeholder="Write your blog content here..."
                            [class.is-invalid]="blogForm.get('content')?.invalid && blogForm.get('content')?.touched"></textarea>
                  <div *ngIf="blogForm.get('content')?.invalid && blogForm.get('content')?.touched"
                       class="text-danger small">
                    <div *ngIf="blogForm.get('content')?.errors?.['required']">Content is required</div>
                    <div *ngIf="blogForm.get('content')?.errors?.['minlength']">Content must be at least 10 characters</div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Author</label>
                      <input type="text" class="form-control" formControlName="author"
                             placeholder="Author name">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Tags</label>
                      <input type="text" class="form-control" formControlName="tagsInput"
                             placeholder="Enter tags separated by commas">
                      <div class="small text-muted">e.g., furniture, design, home decor</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sidebar Settings -->
              <div class="col-md-4">
                <h6 class="text-primary mb-3">Post Settings</h6>

                <!-- Featured Image -->
                <div class="mb-3">
                  <label class="form-label">Featured Image</label>
                  <input type="file" class="form-control" (change)="onImageSelect($event)"
                         accept="image/*">
                  <div class="small text-muted">Upload featured image (JPG, PNG, WEBP)</div>

                  <!-- Image Preview -->
                  <div class="mt-2" *ngIf="selectedImage">
                    <div class="position-relative">
                      <img [src]="selectedImage.preview" class="img-fluid rounded"
                           style="max-height: 200px; width: 100%; object-fit: cover;">
                      <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0"
                              (click)="removeImage()">
                        <i class="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Category</label>
                  <select class="form-select" formControlName="category">
                    <option value="">Select Category</option>
                    <option value="design">Design</option>
                    <option value="furniture">Furniture</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="tips">Tips & Guides</option>
                    <option value="news">News</option>
                    <option value="trends">Trends</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" formControlName="status">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="featured">
                    <label class="form-check-label">Featured Post</label>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" formControlName="allowComments">
                    <label class="form-check-label">Allow Comments</label>
                  </div>
                </div>

                <!-- SEO Settings -->
                <hr>
                <h6 class="text-secondary mb-3">SEO Settings</h6>

                <div class="mb-3">
                  <label class="form-label">Meta Title</label>
                  <input type="text" class="form-control" formControlName="metaTitle"
                         placeholder="SEO title">
                </div>

                <div class="mb-3">
                  <label class="form-label">Meta Description</label>
                  <textarea class="form-control" formControlName="metaDescription" rows="3"
                            placeholder="SEO description"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">URL Slug</label>
                  <input type="text" class="form-control" formControlName="slug"
                         placeholder="blog-post-url-slug">
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
                  <button type="submit" class="btn btn-primary" [disabled]="blogForm.invalid || isLoading">
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ editingBlog ? 'Update Post' : 'Create Post' }}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Blog Posts List -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Blog Posts</h5>
          <div class="d-flex gap-2">
            <input type="text" class="form-control form-control-sm" [(ngModel)]="searchTerm"
                   placeholder="Search posts..." style="width: 200px;">
            <select class="form-select form-select-sm" [(ngModel)]="filterCategory" style="width: 150px;">
              <option value="">All Categories</option>
              <option value="design">Design</option>
              <option value="furniture">Furniture</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="tips">Tips & Guides</option>
              <option value="news">News</option>
              <option value="trends">Trends</option>
            </select>
            <select class="form-select form-select-sm" [(ngModel)]="filterStatus" style="width: 120px;">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div *ngIf="isLoading" class="text-center py-4">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div *ngIf="!isLoading && blogs.length === 0" class="text-center py-4">
            <i class="bi bi-journal-text fs-1 text-muted"></i>
            <p class="text-muted mt-2">No blog posts found</p>
          </div>

          <div *ngIf="!isLoading && blogs.length > 0" class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let blog of filteredBlogs">
                  <td>
                    <img [src]="getBlogImage(blog)" class="rounded"
                         style="width: 60px; height: 40px; object-fit: cover;"
                         [alt]="blog.title">
                  </td>
                  <td>
                    <div>
                      <h6 class="mb-1">{{ blog.title }}</h6>
                      <small class="text-muted">{{ truncateText(blog.excerpt, 80) }}</small>
                      <div class="mt-1" *ngIf="blog.featured">
                        <span class="badge bg-primary">Featured</span>
                      </div>
                    </div>
                  </td>
                  <td>{{ blog.author || 'Anonymous' }}</td>
                  <td>
                    <span class="badge bg-light text-dark" *ngIf="blog.category">
                      {{ blog.category }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(blog.status)">
                      {{ blog.status }}
                    </span>
                  </td>
                  <td>
                    <div>
                      <small>{{ formatDate(blog.createdAt) }}</small>
                      <div class="small text-muted" *ngIf="blog.updatedAt && blog.updatedAt !== blog.createdAt">
                        Updated: {{ formatDate(blog.updatedAt) }}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-primary" (click)="editBlog(blog)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-success" (click)="viewBlog(blog)" title="Preview">
                        <i class="bi bi-eye"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteBlog(blog._id!)">
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
    .blog-management {
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

    textarea {
      resize: vertical;
    }
  `]
})
export class BlogManagementComponent implements OnInit {
  blogForm: FormGroup;
  showCreateForm = false;
  editingBlog: any = null;
  isLoading = false;

  blogs: any[] = [];
  selectedImage: { file: File; preview: string } | null = null;

  searchTerm = '';
  filterCategory = '';
  filterStatus = '';

  constructor(
    private fb: FormBuilder,
    private adminApiService: AdminApiService
  ) {
    this.blogForm = this.createBlogForm();
  }

  ngOnInit(): void {
    this.loadBlogs();
  }

  createBlogForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      excerpt: [''],
      content: ['', [Validators.required, Validators.minLength(10)]],
      author: ['Admin'],
      category: ['design'],
      status: ['draft'],
      featured: [false],
      allowComments: [true],
      tagsInput: [''],
      metaTitle: [''],
      metaDescription: [''],
      slug: ['']
    });
  }

  get filteredBlogs() {
    return this.blogs.filter(blog => {
      const matchesSearch = !this.searchTerm ||
        blog.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.filterCategory || blog.category === this.filterCategory;
      const matchesStatus = !this.filterStatus || blog.status === this.filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  loadBlogs(): void {
    this.isLoading = true;
    this.adminApiService.getAllBlogs().subscribe({
      next: (response) => {
        this.blogs = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
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
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
  }

  onSubmit(): void {
    if (this.blogForm.valid) {
      const formData = this.blogForm.value;

      // Process tags
      const tags = formData.tagsInput ? formData.tagsInput.split(',').map((tag: string) => tag.trim()) : [];

      const blogData: AdminBlog = {
        title: formData.title,
        excerpt: formData.excerpt || formData.title.substring(0, 100) + '...', // Auto-generate excerpt from title if empty
        content: formData.content,
        author: {
          name: formData.author || 'Admin',
          email: 'admin@example.com'
        },
        category: formData.category,
        status: formData.status,
        featured: formData.featured,
        tags: tags,
        seo: {
          metaTitle: formData.metaTitle || formData.title,
          metaDescription: formData.metaDescription || formData.excerpt || formData.title,
          slug: formData.slug || (formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now())
        },
        image: this.selectedImage?.file || ''
      };

      this.isLoading = true;

      const apiCall = this.editingBlog
        ? this.adminApiService.updateBlog(this.editingBlog._id, blogData)
        : this.adminApiService.createBlog(blogData);

      apiCall.subscribe({
        next: (response) => {
          console.log('Blog saved successfully:', response);
          alert(this.editingBlog ? 'Blog post updated successfully!' : 'Blog post created successfully!');
          this.isLoading = false;
          this.cancelForm();
          this.loadBlogs();
        },
        error: (error) => {
          console.error('Error saving blog:', error);
          alert('Error saving blog post: ' + (error.error?.message || error.message));
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form is invalid:', this.blogForm.errors);
      alert('Please fill in all required fields.');
    }
  }

  editBlog(blog: any): void {
    this.editingBlog = blog;
    this.showCreateForm = true;

    // Populate form with blog data
    this.blogForm.patchValue({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author?.name || blog.author || 'Admin',
      category: blog.category,
      status: blog.status,
      featured: blog.featured,
      allowComments: blog.allowComments,
      tagsInput: blog.tags ? blog.tags.join(', ') : '',
      metaTitle: blog.seo?.metaTitle || blog.metaTitle,
      metaDescription: blog.seo?.metaDescription || blog.metaDescription,
      slug: blog.seo?.slug || blog.slug
    });

    // Set existing image if available
    if (blog.image) {
      let imageUrl = '';
      if (typeof blog.image === 'string') {
        imageUrl = blog.image.startsWith('http') ? blog.image : `http://localhost:3000${blog.image}`;
      } else if (blog.image.url) {
        imageUrl = blog.image.url.startsWith('http') ? blog.image.url : `http://localhost:3000${blog.image.url}`;
      }

      if (imageUrl) {
        this.selectedImage = {
          file: null as any,
          preview: imageUrl
        };
      }
    }
  }

  deleteBlog(id: string): void {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.adminApiService.deleteBlog(id).subscribe({
        next: () => {
          alert('Blog post deleted successfully!');
          this.loadBlogs();
        },
        error: (error) => {
          console.error('Error deleting blog:', error);
          alert('Error deleting blog post: ' + (error.error?.message || error.message));
        }
      });
    }
  }

  viewBlog(blog: any): void {
    // This would typically open a preview or navigate to the blog post
    console.log('Preview blog:', blog);
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingBlog = null;
    this.blogForm.reset();
    this.selectedImage = null;
  }

  getBlogImage(blog: any): string {
    // Handle different image URL formats from the backend
    if (blog.image) {
      if (typeof blog.image === 'string') {
        // If it's already a full URL, return as is
        if (blog.image.startsWith('http')) {
          return blog.image;
        }
        // If it's a relative path, construct full URL
        return `http://localhost:3000${blog.image}`;
      } else if (blog.image.url) {
        // If it's an object with url property
        if (blog.image.url.startsWith('http')) {
          return blog.image.url;
        }
        return `http://localhost:3000${blog.image.url}`;
      }
    }

    // Fallback to placeholder
    return 'assets/placeholder-blog.jpg';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'draft': 'bg-warning',
      'published': 'bg-success',
      'archived': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  truncateText(text: string, length: number): string {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
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
