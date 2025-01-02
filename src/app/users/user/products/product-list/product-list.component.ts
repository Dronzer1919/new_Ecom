import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductService } from '../product.service';
import { ProductSideBarComponent } from '../product-side-bar/product-side-bar.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
  
@Component({
  selector: 'app-product-list',
  imports: [ProductSideBarComponent,CommonModule,FormsModule,ReactiveFormsModule],
  standalone:true,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  public productList!: any;
  public productId!:string ;
  filterList: any;
  allProductList: any;
  searchTerm: string = '';
  private searchTermChanged: Subject<string> = new Subject<string>();
  private searchTermSubscription: Subscription;
  displayedProducts:any

  constructor(
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
  ) {
    this.getallProducts();
    this.searchTermSubscription = this.searchTermChanged.pipe(
      debounceTime(1000), // Wait for 2 seconds after user stops typing
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(() => {
      this.filterProducts();
    });
   }

  ngOnInit(): void {
  }
  

  public getallProducts() {
    this.productService.getAllProduct().subscribe((data: any) => {
      this.allProductList = data
      if (this.allProductList.length) {
        this.getProductId()
        
      }
    })
  }


  public getProductId() {
    this.activatedRoute.params.subscribe(params => {
      this.productId = params['id'];
      this.filterList = this.allProductList.filter((i: { _id: string; }) => i._id === this.productId)[0].productTypes;
      this.displayedProducts = this.filterList;
    });
  }


  public gotoDetails(value: any) {
    
    this.router.navigate(['/productDetails/', value.categoryName]);
    localStorage.setItem('details', JSON.stringify(value))

  }

//   public filterProducts(): void {
//     debugger
//     this.filterList = this.filterList.filter((product: {
//       categoryName: any; name: string; 
// }) =>
//       product.categoryName.toLowerCase().includes(this.searchTerm.toLowerCase())
//     );
//   }
  
// onSearchTermChange(): void {
//   this.searchTermChanged.next(this.searchTerm);
// }

// filterProducts(): void {
//   if (this.searchTerm.trim() === '') {
//     this.filterList = this.filterList;
//   } else {
//     debugger
//     this.filterList = this.filterList.filter((product: {
//       productName: any; name: string; 
// }) =>
//       product.productName.toLowerCase().includes(this.searchTerm.toLowerCase())
//     );
//   }
// }
  
  
  onSearchTermChange(): void {
  this.searchTermChanged.next(this.searchTerm);
  // If search term is empty, show all products immediately
  if (!this.searchTerm) {
    this.filterList = this.displayedProducts;
  }
}

  filterProducts(): void {
  if (this.searchTerm.trim() === '') {
    this.filterList = this.filterList;
  } else {
    // debugger
    this.filterList = this.filterList.filter((product: {
      productName: any; name: string;
    }) =>
      product.productName.toLowerCase().includes(this.searchTerm.toLowerCase()
      
      )
    
    );
  }
  }
  

//   filterValuesChange(filterValues: { minPrice: string, maxPrice: string }) {
//     console.log(filterValues)
//     debugger
//     this.filterList = this.filterList.filter((product: {
//       productPrice: string; price: string; 
// }) => {
//       if (filterValues.minPrice && filterValues.maxPrice) {
//         return product.productPrice >= filterValues.minPrice && product.productPrice <= filterValues.maxPrice;
//       } else if (filterValues.minPrice) {
//         return product.productPrice >= filterValues.minPrice;
//       } else if (filterValues.maxPrice && filterValues.maxPrice == '') {
//         return product.productPrice <= filterValues.maxPrice;
//       }
//       return true; // If no filter applied, return all products
//     });

//   }
  
filterValuesChange(filterValues: { minPrice: string, maxPrice: string }) {
  if ((filterValues.minPrice == '' && !filterValues.minPrice) || (filterValues.maxPrice == '' && !filterValues.maxPrice)) {
   this.filterList == this.displayedProducts;
  }

  this.filterList = this.filterList.filter((product: { productPrice: string; }) => {
    if (parseInt(filterValues.minPrice) && parseInt(filterValues.maxPrice)) {
      return parseInt(product.productPrice) >= parseInt(filterValues.minPrice) && parseInt(product.productPrice) <= parseInt(filterValues.maxPrice);
    } else if (filterValues.minPrice) {
      return parseInt(product.productPrice) >= parseInt(filterValues.minPrice);
    } else if (parseInt(filterValues.maxPrice)) {
      return parseInt(product.productPrice) <= parseInt(filterValues.maxPrice);
    }
    return true; // If no filter applied, return all products
  });
}
  
}
