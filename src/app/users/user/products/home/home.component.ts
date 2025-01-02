import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http'
import { ProductService } from '../product.service';
import { DataSharingService } from '../../../../shared/services/data-sharing.service';
import { wishList } from '../../../../shared/constant/common-constant';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';



@Component({
  selector: 'app-home',
  standalone:true,
  imports: [NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent  {
  
  public wisharray: wishList[] = [];
  public data: wishList[] = [];
  allProductList: any;
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
    private dataService: DataSharingService,
    private productService: ProductService,
 
  ) {
    // localStorage.setItem('name', 'Obaseki Nosa');
    // sessionStorage.setItem('value', 'rushi bro')
  }

  public smartphones = [
    { id: 1, im: 'one', n: 'Leg Piece', fav: false, price: 240, text: 'The Vivo V23 5G runs Funtouch OS 12 is based on Android 12 and packs 128GB, 256GB of inbuilt storage. The Vivo V23 5G is a dual-SIM (GSM and GSM) mobile that accepts Nano-SIM and Nano-SIM cards. The Vivo V23 5G measures 157.20 x 72.42 x 7.39mm (height x width x thickness) and weighs 179.00 grams. ' },
    { id: 2, im: 'two', n: 'Roasted chiken', fav: false, price: 240, text: 'Vivo Y75 is an amazing smartphone for hardcore gamers and multitaskers out there. It comes with an Ultra Game Mode 2.0 through which users can switch between Power Saving, Performance and Balanced modes in real-time. It also includes 4D Game Vibration and Game Picture-in-Picture feature to send text messages without minimising the gaming apps.' },
    { id: 3, im: 'three', n: 'Piece', fav: false, price: 300, text: 'The Vivo X80 runs OriginOS Ocean is based on Android 12 and packs 128GB, 256GB of inbuilt storage. The Vivo X80 is a dual-SIM (GSM and GSM) mobile that accepts Nano-SIM and Nano-SIM cards. The Vivo X80 measures 164.95 x 75.23 x 8.30mm (height x width x thickness) and weighs 203.00 grams. It was launched in Cosmic Black and Urban Blue colours.' },
    { id: 4, im: 'four', n: 'Full Chiken', fav: false, price: 300, text: 'The Vivo T1 Pro 5G is built to deliver consistent performance for a long period of time through its Flagship Level 8 Layer Liquid Cooling Technology. The camera quality of the smartphone is also brilliant which empowers users to capture their moments in a magical way. Further, Ultra Game Mode, Flash Charging and fingerprint sensor are useful features.' },
    { id: 5, im: 'five', n: 'Gadaknath', fav: false, price: 260, text: 'The newly launched Vivo Y01A runs on Android 11 (Go Edition) with a layer of Funtouch OS 11.1 on top, out of the box. The OS on the smartphone, therefore, is fairly old compared to others in the same segment. Even the processor on the latest Y-series model from Vivo is comparatively old with the device housing a MediaTek Helio P35 SoC under the hood.' },
    { id: 6, im: 'six', n: 'small Piece', fav: false, price: 280, text: 'Boasts an advanced dual-camera system that allows you to click mesmerising pictures with immaculate clarity. Furthermore, the lightning-fast A15 Bionic chip allows for seamless multitasking, elevating your performance to a new dimension. A big leap in battery life, a durable design, and a bright Super Retina XDR display facilitate boosting your user experience.' },
  ]

  
  ngOnInit(): void {
    // this.testCompoenent();
    // this.fetchData();
    this.dataService.wishListArray.subscribe(data => {
      this.wisharray = data;
      console.log(this.wisharray);
    })
    this.dataService.wishListArray.next(this.wisharray);
    this.getallProducts();
    // this.buildForm();
    
  }

  public wishlist(value: wishList) {
    if (this.wisharray.length == 0) {
      this.wisharray.push(value);
    }
    else {
      this.wisharray.forEach((item) => {
        if (item.id !== value.id) {
          this.wisharray.push(value);
        }
      });
    }
    // localStorage.setItem('array', JSON.stringify(this.wisharray));
    value.fav = true;
    this.dataService.wishListArray.next(this.wisharray);
  }

  public unwishlist(value: wishList) {
    this.wisharray.splice(value.id, 1) 
    value.fav = false
  }

  public gotoCart(value: any) {
    this.router.navigate(['/addToCart/', value.im]);
    // localStorage.setItem('details', JSON.stringify(value))
  }

  public gotoDetails(value:any) {
    this.router.navigate(['/productCategory/', value._id]);
    // localStorage.setItem('details', JSON.stringify(value))
  }

  public items: any[] = [
    { name: 'Item 1', checked: false },
    { name: 'Item 2', checked: true },
    { name: 'Item 3', checked: false }
  ];

  public checkAll(event: any) {
    const isChecked = event.target.checked;
    this.items.forEach(item => {
      item.checked = isChecked;
    });
  }

  public toggleItem(item: any) {
    item.checked = !item.checked;

  }


  public testCompoenent() {
    const array1 = ['a', 'b', 'c'];
    const array2 = ['d', 'e', 'f'];
    // const array3 = array1.concat(array2);
    console.log(this.smartphones.filter(i => i.id == 1));
    console.log(this.smartphones.map(i => { i.fav == false }));
    console.log(this.smartphones.find(i => i.fav == true))  // it return only first value which is present in db
    // const object2 = this.smartphones.fromEntries(
    //   Object.entries(this.smartphones).map(([key, val]) => [key, val.id1 * 2]),
    // );
    this.smartphones.flatMap
  }

  public fetchData() {
    this.http.get('https://jsonplaceholder.typicode.com/pos').subscribe((data: any) => {
      console.log(data); // Do something with the data }); }
    })
  }

  public getallProducts() {
    this.productService.getAllProduct().subscribe((data: any) => {
      this.allProductList = data
      this.dataService.ProductList$.next(this.allProductList);
    })
  }

  // public buildForm() {
  //   this.form
  // }
}