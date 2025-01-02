import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Dimensions, ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import { ProductManagementService } from '../product-management.service';
import { DataSharingService } from '../../../../shared/services/data-sharing.service';
import { PreviewImgComponent } from '../../../../shared/components/preview-img/preview-img.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,PreviewImgComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit {
  public Files: File[] = [];
  private formData = new FormData();
  public addProduct!: FormGroup;
  public addType!: FormGroup;
  public selectedFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  public isloaded = false;
  // image edit variables;
  imageChangedEvent!: any ;
  croppedImage: any = '';
  canvasRotation = 0;
  rotation?: number;
  translateH = 0;
  translateV = 0;
  scale = 1;
  aspectRatio = 4 / 3;
  showCropper = false;
  containWithinAspectRatio = false;
  transform: ImageTransform = {
    translateUnit: 'px'
  };
  imageURL?: string = '';
  loading = false;
  allowMoveImage = false;
  hidden = false;
  allProductList: any;
  addProductCategory: boolean = true;
  addProductTypes: boolean = false;

  currentImageIndex: number = 0;

  @ViewChild(PreviewImgComponent) PreviewImgComponent: PreviewImgComponent | undefined
  

  completeStep() {
    this.progressService.updateProgress(25);
  }

  constructor(
    private formBuilder: FormBuilder,
    private productManagementService: ProductManagementService,
    private sanitizer: DomSanitizer,
    // private homeService: HomeService,
    private progressService: DataSharingService,
    private readonly changeDetectorRef: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.addProductForm();
    this.addProductTypeForm();
    this.getallProducts();
    this.completeStep();

  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.PreviewImgComponent?.delete(0);
    
  }

  // ngAfterViewChecked(): void {
  //   this.changeDetectorRef.detectChanges();
  //   this.PreviewImgComponent?.delete(0);
  //   this.addProduct.controls['img'].reset();
  // }

  public addProductForm() {
    this.addProduct = this.formBuilder.group({
      categoryName: [''],
      description: [''],
      discount: [''],
      productWeight: [''],
      img : []
    })
  }

  public addProductTypeForm() {
    this.addType = this.formBuilder.group({
      categoryName:[''],
      productName: [''],
      productType: [''],
      productPrice: [''],
      productQuantity: [''],
      productWeight: [''],
      img : []
    }
    )
  }

  public submitForm() {
    this.formData = new FormData();

      this.formData.append('categoryName', this.addProduct?.controls['categoryName'].value),
      this.formData.append('description', this.addProduct?.controls['description'].value),
      this.formData.append('discount', this.addProduct?.controls['discount'].value),
      this.selectedFiles.forEach((image, index) => {
        this.formData.append(`image${index}`, image, image.name);
      });
    
    
    this.productManagementService.addNewProduct(this.formData).subscribe(data => {
      console.log(data);
      this.addProductCategory = false;
      this.addProductTypes = true;
    })
  }

 

  public getallProducts() {
    this.productManagementService.getAllProduct().subscribe((data: any) => {
      console.log(data);
      this.allProductList = data
    })
  }

 

  public addProductType() {

    const formData = new FormData();

    formData.append('categoryName', this.addType?.controls['categoryName'].value),
    formData.append('productName', this.addType?.controls['productName'].value),
    formData.append('productType', this.addType?.controls['productType'].value),
    formData.append('productPrice', this.addType?.controls['productPrice'].value),
    formData.append('productQuantity', this.addType?.controls['productQuantity'].value),
    formData.append('productWeight', this.addType?.controls['productWeight'].value),
    this.Files.forEach((image, index) => {
      formData.append(`image${index}`, image, image.name);
    });
      
    
    
    // formData.append('image', this.selectedFiles);
    // console.log(this.selectedFiles);
    
    // if (this.imagePreviewUrls.length > 0) {
    //   debugger
    //   Array.from(this.imagePreviewUrls).forEach((file, index) => {
    //     this.formData.append("img[0].file[" + index + "]", file);
    //   });
    // }
    this.productManagementService.addType(formData).subscribe((data: any) => {
          console.log(data);
    })

  }

  public onFileChange(event: any) {
    this.imageChangedEvent = event;
    if (event.target.files && event.target.files.length > 0) {
      const files = event.target.files;
      for (let i = 0; i < files.length; i++) {
        this.selectedFiles.push(files.item(i)!);
      }

      // this.selectedFiles = files;
      this.isloaded = true;
    }
  }

  onFileSelected(event: any) {
    // debugger
    this.Files = [];
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.Files.push(files.item(i)!);
    }
  }







  // updateRotation() {
  //   this.transform = {
  //     ...this.transform,
  //     rotate: this.rotation
  //   };
  // }

}

