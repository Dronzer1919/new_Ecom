import { ToastrService } from 'ngx-toastr';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ProductManagementService } from '../product-management.service';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-edit-product',
  imports: [ReactiveFormsModule,CommonModule,NgxDatatableModule,NgOptimizedImage],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.scss'
})
export class EditProductComponent {
  public allProductList: any;
  public selectedFiles: string = '';
  public editProductForm!: FormGroup;
  public selectedRow: any;
  public modalOpen: boolean = false;
  private productManagementService=  inject(ProductManagementService)
  private formBuilder = inject(FormBuilder)
  private toastrService = inject(ToastrService)
  @ViewChild('staticBackdrop') offensiveModal: ElementRef | undefined;


  ngOnInit(): void {
    this.getallProducts();
    this.buildForm();
  }

  public getallProducts() {
    this.productManagementService.getAllProduct().subscribe((data: any) => {
      this.allProductList = data
    })
  }

  public deleteProduct(id:any) {
    this.productManagementService.deleteStudent(id).subscribe((response: any) => {
      if (response && response.status) {
        this.toastrService.success(response.msg);
        this.getallProducts();
      }
    })
  }

  public editProduct(selectedRow: any) {
    this.setFormvalue(selectedRow);
    this.selectedRow = selectedRow
  }

  public onFileChange(event:any) {
    if (event.target.files && event.target.files.length > 0) {
      const files = event.target.files;
      this.selectedFiles=event.target.files[0]
    }
  }

  public buildForm() {
    this.editProductForm = this.formBuilder.group({
      categoryName: [''],
      description: [''],
      discount: [''],
      img: []
    })
  }

  public setFormvalue(selectedRow: any) {
    this.editProductForm.controls['categoryName'].setValue(selectedRow.categoryName);
    this.editProductForm.controls['description'].setValue(selectedRow.description);
    this.editProductForm.controls['discount'].setValue(selectedRow.discount);
    this.editProductForm.controls['img'].setValue(selectedRow.img);
  }

  public submitForm() {
    const formData = new FormData();
    formData.append('categoryName', this.editProductForm?.controls['categoryName'].value),
    formData.append('description', this.editProductForm?.controls['description'].value),
    formData.append('discount', this.editProductForm?.controls['discount'].value),
    formData.append('image', this.selectedFiles);
    this.productManagementService.editForm(formData, this.selectedRow._id).subscribe((response: any ) => {

      if (response && response.status) {
        this.toastrService.success(response.msg);
        // this.modalOpen = false;
        this.getallProducts();
        debugger
        this.closeModal()
      }
    })
  }

  public closeModal() {
    // if (this.isBrowser) {
      // Access the modal element and close it using Bootstrap Modal
      // const modalElement = document.getElementById('staticBackdrop');
      // if (modalElement) {
      //   const bootstrapModal = (window as any).bootstrap.Modal;
      //   const modal = new bootstrapModal(modalElement);
      //   // modal._dialog.onclose()
      //   modal.hide();
    // }
    
    // var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('staticBackdrop'));
    // myModal.hide();

    const truck_modal = document.querySelector('#staticBackdrop');

// Check if the modal element exists
if (truck_modal) {
  // Try to get the existing modal instance
  let modal = bootstrap.Modal.getInstance(truck_modal);

  // If there's no instance, initialize it
  if (!modal) {
    modal = new bootstrap.Modal(truck_modal);
  }

  // Hide the modal
  modal.hide();

  // Manually remove the backdrop
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.remove();
  }
} else {
  console.error('Modal element not found');
}

    
  
    // }
  }
}
