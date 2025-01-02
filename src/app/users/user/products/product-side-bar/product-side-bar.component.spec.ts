import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSideBarComponent } from './product-side-bar.component';

describe('ProductSideBarComponent', () => {
  let component: ProductSideBarComponent;
  let fixture: ComponentFixture<ProductSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductSideBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
