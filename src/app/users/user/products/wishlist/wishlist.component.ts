import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { WishlistService, WishlistItem } from '../../../../services/wishlist.service';
import { normalizeImagePath } from '../../../../services/image.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, NgxDatatableModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public data: WishlistItem[] = [];
  // Control when the ngx-datatable is attached to the DOM
  public tableVisible = false;
  public totalAmount: number = 0;
  public discount = 0;
  public deliveryCharges = 0;
  public finalAmount: number = 0;

  constructor(
    private wishlistService: WishlistService,
    private toastr: ToastrService
  ) {}


  ngOnInit(): void {
    this.loadWishlistData();
  }

  ngAfterViewInit(): void {
    // Ensure the datatable is only rendered after the view is initialized
    // This prevents ngx-datatable from attempting measurements on non-DOM values
    Promise.resolve().then(() => this.tableVisible = true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWishlistData(): void {
    this.wishlistService.wishlistItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
  // Defer assignment so ngx-datatable initializes its element first
  // avoiding measurements on a non-DOM object (getBoundingClientRect error).
  Promise.resolve().then(() => this.data = data);
        this.totalAmoount();
      });
  }

  public removeFromWishList(id: string): void {
    this.wishlistService.removeFromWishlist(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastr.success(response.message);
          this.totalAmoount();
        }
      }
    });
  }

  private totalAmoount() {
    this.totalAmount = this.data.reduce((acc, item) => {
      return acc + item.price;
    }, 0);
    this.finalAmountCal();
  }

  private finalAmountCal() {
    if (this.data && this.data.length) {
      this.discount = 20;
      this.deliveryCharges = 50;
    } else {
      this.discount = 0;
      this.deliveryCharges = 0;
    }
    this.finalAmount = this.totalAmount + this.discount + this.deliveryCharges;
  }

  public formatDate(date: Date): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  public getImage(row: WishlistItem): string {
    const img = row?.images && row.images.length ? row.images[0] : undefined;
    return normalizeImagePath(img);
  }

  public formatPrice(price: number): string {
    if (price == null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  }
}









// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
// @Component({
//   selector: 'app-wish-list',
//   templateUrl: './wish-list.component.html',
//   styleUrls: ['./wish-list.component.scss']
// })
// export class WishListComponent {
//   form!: FormGroup;

//   items = [
//     { id: 1, name: 'Item 1', favorite: true },
//     { id: 2, name: 'Item 2', favorite: false },
//     { id: 3, name: 'Item 3', favorite: true }
//   ];

//   constructor(private fb: FormBuilder) {}

//   ngOnInit() {
//     this.form = this.fb.group({
//       items: this.fb.array([])
//     });

//     this.setItems();
//   }

//   private setItems() {
//     const itemsArray = this.form.controls['items'] as FormArray;
//     this.items.forEach(item => {
//       itemsArray.push(this.fb.group({
//         id: item.id,
//         name: item.name,
//         favorite: item.favorite
//       }));
//     });
//   }

//   toggleFavorite(index: number) {
//     const item = (this.form.controls['items'] as FormArray).at(index).value;
//     item.favorite = !item.favorite;
//   }
// }

