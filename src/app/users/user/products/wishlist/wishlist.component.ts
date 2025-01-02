import { Component, OnInit } from '@angular/core';
import { wishList } from '../../../../shared/constant/common-constant';
import { DataSharingService } from '../../../../shared/services/data-sharing.service';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule,NgxDatatableModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss'
})
export class WishlistComponent implements OnInit {
  public Price: any;
  public wishlish: boolean = false;
  public data: wishList[] = [];
  public totalAmount: number = 0;
  public discount = 0;
  public deliveryCharges = 0;
  public finalAmount: number = 0;
  
  constructor(
    private dataService : DataSharingService
  ) {}


  ngOnInit(): void {
    this.dataService.wishListArray.subscribe(data => {
      this.data = data;
    });
    this.totalAmoount();
    this.removeDuplicate();
  }

  public removeFromWishList(id: number) {
    this.data = this.data.filter(i => i.id !== id);
    this.totalAmoount()
  }

  private totalAmoount() {
    this.totalAmount = this.data.reduce((acc, item) => {
      return acc + item.price;
    }, 0)
    this.finalAmountCal()
  }

  private finalAmountCal() {
    if ( this.data && this.data.length) {
      this.discount = 20;
      this.deliveryCharges = 50;
    }
    this.finalAmount = this.totalAmount + this.discount + this.deliveryCharges
  }

  private removeDuplicate() {
    this.data = this.data.filter((obj, index, self) =>
        index === self.findIndex((t) => (
          t.id === obj.id
        ))
    );
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

