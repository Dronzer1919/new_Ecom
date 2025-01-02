import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'product-side-bar',
  standalone: true,
  imports:[ReactiveFormsModule,FormsModule],
  templateUrl: './product-side-bar.component.html',
  styleUrls: ['./product-side-bar.component.scss']
})
export class ProductSideBarComponent implements OnInit {
  @Output() filterValuesChange = new EventEmitter<{ minPrice: string, maxPrice: string }>();
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
      minPrice: ['', ],
      maxPrice: ['', ],
      // confirmPassword: ['', Validators.required]
    })
  }

  public emitFilterValues() {
    const filterValues = this.filterItem.value;
    console.log('filterValues', filterValues);
    if ((filterValues.minPrice && filterValues.minPrice !== '') && (filterValues.maxPrice && filterValues.maxPrice !== '')) { 
      // debugger
    this.filterValuesChange.emit(filterValues);

    }
  }

}
