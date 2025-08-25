import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

declare var L: any;

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  latitude: number;
  longitude: number;
  store: string;
  availability: 'available' | 'low-stock' | 'out-of-stock';
}

@Component({
  selector: 'app-product-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-map.component.html',
  styleUrl: './product-map.component.scss'
})
export class ProductMapComponent implements OnInit, AfterViewInit {
  private map: any;
  private isBrowser: boolean;

  products: Product[] = [
    {
      id: '1',
      name: 'Premium Chicken Wings',
      price: 299,
      category: 'Chicken',
      description: 'Fresh, juicy chicken wings marinated in special spices',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZWFhNyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMyZDM0MzYiPvCfkZcgQ2hpY2tlbiBXaW5nczwvdGV4dD48L3N2Zz4=',
      latitude: 28.6139,
      longitude: 77.2090,
      store: 'Delhi Central Store',
      availability: 'available'
    },
    {
      id: '2',
      name: 'Grilled Chicken Breast',
      price: 450,
      category: 'Chicken',
      description: 'Tender grilled chicken breast, perfect for health-conscious customers',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZkY2I2ZSIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMyZDM0MzYiPvCfkZcgQ2hpY2tlbiBCcmVhc3Q8L3RleHQ+PC9zdmc+',
      latitude: 28.7041,
      longitude: 77.1025,
      store: 'North Delhi Branch',
      availability: 'available'
    },
    {
      id: '3',
      name: 'Chicken Biryani Special',
      price: 350,
      category: 'Ready-to-eat',
      description: 'Aromatic basmati rice with tender chicken pieces',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2U3NGMzYyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIj7wn42ZIEJpcnlhbmkgU3BlY2lhbDwvdGV4dD48L3N2Zz4=',
      latitude: 28.5355,
      longitude: 77.3910,
      store: 'Noida Branch',
      availability: 'low-stock'
    },
    {
      id: '4',
      name: 'Chicken Seekh Kebab',
      price: 280,
      category: 'Kebabs',
      description: 'Spiced minced chicken shaped into delicious kebabs',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwYjg5NCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIj7wn4ytIFNlZWtoIEtlYmFiPC90ZXh0Pjwvc3ZnPg==',
      latitude: 28.4595,
      longitude: 77.0266,
      store: 'Gurgaon Store',
      availability: 'available'
    },
    {
      id: '5',
      name: 'Chicken Curry Ready Mix',
      price: 180,
      category: 'Ready-to-cook',
      description: 'Pre-marinated chicken pieces ready for curry preparation',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1OWUwYiIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIj7wn42ZIEN1cnJ5IE1peDwvdGV4dD48L3N2Zz4=',
      latitude: 28.6692,
      longitude: 77.4538,
      store: 'Ghaziabad Branch',
      availability: 'out-of-stock'
    },
    {
      id: '6',
      name: 'Tandoori Chicken',
      price: 520,
      category: 'Tandoori',
      description: 'Clay oven roasted chicken with authentic tandoori spices',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VmNDQ0NCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIj7wn5KlIFRhbmRvb3JpPC90ZXh0Pjwvc3ZnPg==',
      latitude: 28.6304,
      longitude: 77.2177,
      store: 'Connaught Place',
      availability: 'available'
    }
  ];

  selectedProduct: Product | null = null;
  filteredProducts: Product[] = [];
  selectedCategory: string = 'all';
  selectedAvailability: string = 'all';

  categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Chicken', label: 'Fresh Chicken' },
    { value: 'Ready-to-eat', label: 'Ready to Eat' },
    { value: 'Kebabs', label: 'Kebabs' },
    { value: 'Ready-to-cook', label: 'Ready to Cook' },
    { value: 'Tandoori', label: 'Tandoori' }
  ];

  availabilityOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'available', label: 'Available' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'out-of-stock', label: 'Out of Stock' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeMap();
    }
  }

  private async initializeMap(): Promise<void> {
    try {
      // Initialize map centered on Delhi NCR
      this.map = L.map('map').setView([28.6139, 77.2090], 10);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(this.map);

      // Add product markers
      this.addProductMarkers();

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private addProductMarkers(): void {
    this.filteredProducts.forEach(product => {
      const icon = this.getMarkerIcon(product.availability);

      const marker = L.marker([product.latitude, product.longitude], { icon })
        .addTo(this.map);

      const popupContent = `
        <div class="product-popup">
          <h6>${product.name}</h6>
          <p class="mb-1"><strong>₹${product.price}</strong></p>
          <p class="mb-1">${product.store}</p>
          <p class="mb-2">${product.description}</p>
          <span class="badge bg-${this.getAvailabilityColor(product.availability)}">
            ${product.availability.replace('-', ' ')}
          </span>
          <br>
          <button class="btn btn-sm btn-primary mt-2" onclick="window.selectProduct('${product.id}')">
            View Details
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
    });

    // Make selectProduct function available globally
    (window as any).selectProduct = (id: string) => {
      this.selectProduct(id);
    };
  }

  private getMarkerIcon(availability: string): any {
    const colors = {
      'available': '#10b981',
      'low-stock': '#f59e0b',
      'out-of-stock': '#ef4444'
    };

    const color = colors[availability as keyof typeof colors] || '#6b7280';

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
      className: 'custom-marker'
    });
  }

  getAvailabilityColor(availability: string): string {
    const colors = {
      'available': 'success',
      'low-stock': 'warning',
      'out-of-stock': 'danger'
    };
    return colors[availability as keyof typeof colors] || 'secondary';
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const categoryMatch = this.selectedCategory === 'all' || product.category === this.selectedCategory;
      const availabilityMatch = this.selectedAvailability === 'all' || product.availability === this.selectedAvailability;
      return categoryMatch && availabilityMatch;
    });

    // Update map markers if map is initialized
    if (this.map) {
      // Clear existing markers
      this.map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });

      // Add filtered markers
      this.addProductMarkers();
    }
  }

  selectProduct(id: string): void {
    this.selectedProduct = this.products.find(p => p.id === id) || null;

    if (this.selectedProduct && this.map) {
      // Center map on selected product
      this.map.setView([this.selectedProduct.latitude, this.selectedProduct.longitude], 15);
    }
  }

  onCategoryChange(event: any): void {
    this.selectedCategory = event.target.value;
    this.applyFilters();
  }

  onAvailabilityChange(event: any): void {
    this.selectedAvailability = event.target.value;
    this.applyFilters();
  }

  closeProductDetails(): void {
    this.selectedProduct = null;
  }

  addToCart(product: Product): void {
    // Implement add to cart functionality
    console.log('Adding to cart:', product);
    // You can integrate this with your existing cart service
  }

  getProductsByAvailability(availability: string): number {
    return this.products.filter(p => p.availability === availability).length;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIgc3Ryb2tlPSIjZGVlMmU2IiBzdHJva2Utd2lkdGg9IjIiLz48dGV4dCB4PSIxNTAiIHk9IjEwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmM3NTdkIj7wn42ZIFByb2R1Y3QgSW1hZ2U8L3RleHQ+PC9zdmc+';
    }
  }
}
