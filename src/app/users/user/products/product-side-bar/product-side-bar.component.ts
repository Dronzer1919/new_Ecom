import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'product-side-bar',
  standalone: true,
  imports:[ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './product-side-bar.component.html',
  styleUrls: ['./product-side-bar.component.scss']
})
export class ProductSideBarComponent implements OnInit {
  @Output() filterValuesChange = new EventEmitter<{
    minPrice: string,
    maxPrice: string,
    featured: boolean,
    topRated: boolean,
    badge: string,
    sortBy: string
  }>();

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  public filterItem!: FormGroup;

  ngOnInit(): void {
    this.buildfilterItemForm();
    this.filterItem.valueChanges.subscribe(() => {
      this.emitFilterValues();
    });
  }

  public buildfilterItemForm() {
    this.filterItem = this.formBuilder.group({
      minPrice: [''],
      maxPrice: [''],
      featured: [false],
      topRated: [false],
      badge: [''],
      sortBy: ['default']
    })
  }

  public emitFilterValues() {
    const filterValues = this.filterItem.value;
    console.log('filterValues', filterValues);
    this.filterValuesChange.emit(filterValues);
  }

  public clearFilters() {
    this.filterItem.reset({
      minPrice: '',
      maxPrice: '',
      featured: false,
      topRated: false,
      badge: '',
      sortBy: 'default'
    });
  }
}
