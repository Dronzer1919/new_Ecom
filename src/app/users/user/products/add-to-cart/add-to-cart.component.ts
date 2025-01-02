import { Component, OnInit } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-add-to-cart',
  imports: [NgxDatatableModule],
  templateUrl: './add-to-cart.component.html',
  styleUrl: './add-to-cart.component.scss'
})
export class AddToCartComponent implements OnInit  {
  data: any;
  rows: any;

  constructor(
  ) { }

  ngOnInit(): void {
    let value = JSON.parse(localStorage.getItem('details') || '{}');
    console.log(value);
    this.data = value
    this.rows = [value]
  }
}
