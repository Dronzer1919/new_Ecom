import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { EcommerceApiService, Product } from '../../services/ecommerce-api.service';
import { ProductVariantService, ProductVariant, ProductAttribute } from '../../services/product-variant.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastrService } from 'ngx-toastr';
import { normalizeImagePath } from '../../services/image.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  product: Product | null = null;
  variants: ProductVariant[] = [];
  productAttributes: ProductAttribute[] = [];
  selectedVariant: ProductVariant | null = null;
  selectedAttributes: { [key: string]: string } = {};

  loading = true;
  variantsLoading = false;
  addingToCart = false;
  addingToWishlist = false;

  currentImageIndex = 0;
  selectedImageIndex = 0;
  quantity = 1;

  activeTab = 'description';
  showImageModal = false;
  showSpecificationsModal = false;

  // Math reference for template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ecommerceApi: EcommerceApiService,
    private variantService: ProductVariantService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.loadProduct(params['id']);
      } else if (params['slug']) {
        this.loadProductBySlug(params['slug']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProduct(id: string) {
    this.loading = true;
    this.ecommerceApi.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        if (product.hasVariants) {
          this.loadProductVariants();
        } else {
          this.initializeSingleProduct();
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
        this.toastr.error('Product not found');
        this.router.navigate(['/products']);
      }
    });
  }

  loadProductBySlug(slug: string) {
    this.loading = true;
    this.ecommerceApi.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        if (product.hasVariants) {
          this.loadProductVariants();
        } else {
          this.initializeSingleProduct();
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
        this.toastr.error('Product not found');
        this.router.navigate(['/products']);
      }
    });
  }

  loadProductVariants() {
    if (!this.product) return;

    this.variantsLoading = true;

    combineLatest([
      this.variantService.getProductVariants(this.product._id),
      this.variantService.getProductAttributes(this.product._id)
    ]).subscribe({
      next: ([variantsResponse, attributesResponse]) => {
        if (variantsResponse.success) {
          this.variants = variantsResponse.variants;
          this.selectedVariant = this.variantService.getDefaultVariant(this.variants);
        }

        if (attributesResponse.success) {
          this.productAttributes = attributesResponse.attributes;
          this.initializeSelectedAttributes();
        }

        this.variantsLoading = false;
      },
      error: (error) => {
        console.error('Error loading variants:', error);
        this.variantsLoading = false;
      }
    });
  }

  initializeSingleProduct() {
    // For products without variants, set up basic product info
    this.selectedVariant = null;
    this.productAttributes = [];
    this.selectedAttributes = {};
  }

  initializeSelectedAttributes() {
    if (this.selectedVariant) {
      this.selectedAttributes = this.variantService.getVariantAttributes(this.selectedVariant);
    }
  }

  onAttributeChange(attributeName: string, value: string) {
    this.selectedAttributes[attributeName] = value;

    // Find variant that matches selected attributes
    const matchingVariant = this.variantService.findVariantByAttributes(this.variants, this.selectedAttributes);

    if (matchingVariant) {
      this.selectedVariant = matchingVariant;
      this.selectedImageIndex = 0; // Reset to first image of new variant
    }
  }

  getAvailableAttributeValues(attributeName: string): string[] {
    return this.variantService.getAvailableAttributeValues(
      this.variants,
      attributeName,
      this.selectedAttributes
    );
  }

  isAttributeValueAvailable(attributeName: string, value: string): boolean {
    const availableValues = this.getAvailableAttributeValues(attributeName);
    return availableValues.includes(value);
  }

  getCurrentImages(): any[] {
    if (this.selectedVariant && this.selectedVariant.images.length > 0) {
      return this.selectedVariant.images;
    }
    return this.product?.images || [];
  }

  getCurrentPrice(): number {
    if (this.selectedVariant) {
      return this.selectedVariant.price;
    }
    return this.product?.price || 0;
  }

  getCurrentOriginalPrice(): number | null {
    if (this.selectedVariant) {
      return this.selectedVariant.originalPrice || null;
    }
    return this.product?.originalPrice || null;
  }

  hasDiscount(): boolean {
    const originalPrice = this.getCurrentOriginalPrice();
    const currentPrice = this.getCurrentPrice();
    return originalPrice ? originalPrice > currentPrice : false;
  }

  getDiscountPercentage(): number {
    const originalPrice = this.getCurrentOriginalPrice();
    const currentPrice = this.getCurrentPrice();
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  isInStock(): boolean {
    if (this.selectedVariant) {
      return this.selectedVariant.inventory.quantity > 0;
    }
    return this.product ? this.product.inventory.quantity > 0 : false;
  }

  getStockQuantity(): number {
    if (this.selectedVariant) {
      return this.selectedVariant.inventory.quantity;
    }
    return this.product?.inventory.quantity || 0;
  }

  isLowStock(): boolean {
    if (this.selectedVariant) {
      return this.variantService.isLowStock(this.selectedVariant);
    }
    return this.product ? this.product.inventory.quantity <= 5 : false;
  }

  onImageSelect(index: number) {
    this.selectedImageIndex = index;
  }

  nextImage() {
    const images = this.getCurrentImages();
    this.selectedImageIndex = (this.selectedImageIndex + 1) % images.length;
  }

  previousImage() {
    const images = this.getCurrentImages();
    this.selectedImageIndex = this.selectedImageIndex === 0 ? images.length - 1 : this.selectedImageIndex - 1;
  }

  onQuantityChange(newQuantity: number) {
    const maxQuantity = Math.min(this.getStockQuantity(), 10);
    this.quantity = Math.max(1, Math.min(newQuantity, maxQuantity));
  }

  addToCart() {
    if (!this.product || !this.isInStock()) {
      this.toastr.error('Product is out of stock');
      return;
    }

    this.addingToCart = true;

    const cartItem = {
      _id: this.product._id,
      productName: this.product.title,
      price: this.getCurrentPrice(),
      originalPrice: this.getCurrentOriginalPrice(),
      images: this.getCurrentImages().map(img => img.url),
      category: this.product.category?.name || '',
      description: this.product.shortDescription || this.product.description,
      inStock: this.isInStock(),
      variantId: this.selectedVariant?._id,
      attributes: this.selectedVariant ? this.selectedVariant.attributes : [],
      sku: this.selectedVariant?.sku || this.product.inventory.sku
    };

    try {
      this.cartService.addToCart(cartItem, this.quantity);
      this.toastr.success('Added to cart successfully!');
      this.addingToCart = false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.toastr.error('Failed to add to cart');
      this.addingToCart = false;
    }
  }

  addToWishlist() {
    if (!this.product) return;

    this.addingToWishlist = true;

    const wishlistItem = {
      productId: this.product._id,
      variantId: this.selectedVariant?._id,
      productName: this.product.title,
      price: this.getCurrentPrice(),
      images: this.getCurrentImages()
    };

    this.wishlistService.addToWishlist(wishlistItem).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success('Added to wishlist!');
        }
        this.addingToWishlist = false;
      },
      error: (error) => {
        console.error('Error adding to wishlist:', error);
        this.toastr.error('Failed to add to wishlist');
        this.addingToWishlist = false;
      }
    });
  }

  buyNow() {
    this.addToCart();
    // Navigate to checkout after a short delay
    setTimeout(() => {
      this.router.navigate(['/checkout']);
    }, 1000);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  openSpecificationsModal() {
    this.showSpecificationsModal = true;
  }

  closeSpecificationsModal() {
    this.showSpecificationsModal = false;
  }

  getImageUrl(image: any): string {
    return normalizeImagePath(image?.url || image);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  formatRating(rating: any): string {
    if (!rating || !rating.average) return '0.0';
    return rating.average.toFixed(1);
  }

  getBreadcrumb(): string[] {
    if (!this.product) return [];

    const breadcrumb = ['Home', 'Products'];

    if (this.product.category) {
      breadcrumb.push(this.product.category.name);
    }

    if (this.product.subcategory) {
      breadcrumb.push(this.product.subcategory.name);
    }

    breadcrumb.push(this.product.title);

    return breadcrumb;
  }

  onRelatedProductClick(productId: string) {
    this.router.navigate(['/products', productId]);
  }

  shareProduct() {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.title,
        text: this.product.shortDescription || this.product.description,
        url: window.location.href
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      this.toastr.success('Product link copied to clipboard!');
    }
  }
}
