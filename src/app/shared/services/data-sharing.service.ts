import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { wishList } from '../constant/common-constant';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  public wishListArray = new BehaviorSubject<wishList[]>([]);
  public ProductList$ = new Subject();
  
  constructor() { }

  public setWishList(data: wishList[]) {
    this.wishListArray.next(data);
    console.log(data);
  }

  private progressSubject = new BehaviorSubject<number>(0);
  progress$ = this.progressSubject.asObservable();

  updateProgress(progress: number) {
    this.progressSubject.next(progress);
  }
  
}