import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Dimensions, ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-preview-img',
  imports: [CommonModule,ImageCropperComponent],
  standalone: true,
  templateUrl: './preview-img.component.html',
  styleUrl: './preview-img.component.scss'
})
export class PreviewImgComponent implements OnInit {
  @Input() imageChangedEvent: any ;
  public selectedFiles: string = ''
  imagePreviewUrls: string[] = [];
  currentImageIndex: number = 0;
  imageURL?: string = '';
  @Input() selectedIMG: any = ''
  loading!: boolean;
  croppedImage: any;
  showCropper!: boolean;
  canvasRotation: any;
  transform: any;
  translateH: any;
  translateV: any;
  scale!: number;
  rotation!: number;
  containWithinAspectRatio!: boolean;
  allowMoveImage = false;
  hidden = false;
  aspectRatio: number = 1;



  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.previewImage(this.selectedIMG,0)
  }

  public prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.imagePreviewUrls.length) % this.imagePreviewUrls.length;
  }

  public nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.imagePreviewUrls.length;
  }

  public delete(index:number) {
    this.imagePreviewUrls.splice(index, 1);
    
    // this.addProduct.controls['img'].reset();

  }
  private previewImage(selectedImage:any,index:number) {
    // debugger
    if (selectedImage ) {
      this.selectedFiles = selectedImage.target.files[index]
      const files = selectedImage.target.files;
      this.selectedFiles = files;
      this.imageURL = this.selectedFiles;
      this.imageChangedEvent = selectedImage
  
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
          // this.selectedFiles.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }






  // image edit methods

  // public fileChangeEvent(event: any): void {
  //   this.loading = true;
  // }

  public imageCropped(event: ImageCroppedEvent) {
    if (isPlatformBrowser(this.platformId)) {
        const imageUrl = event.objectUrl || event.base64 || '';
        if (!imageUrl) {
            console.warn('No image data available in the event.');
            return;
        }

        try {
            this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
            console.log(event);
            console.log(this.croppedImage);
        } catch (error) {
            console.error('Error sanitizing the image URL:', error);
        }
    } else {
        console.warn('imageCropped called on the server; skipping processing.');
    }
}

  public imageLoaded() {
    this.showCropper = true;
    console.log('Image loaded');
  }

  public cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
    this.loading = false;
  }

  public loadImageFailed() {
    console.error('Load image failed');
  }

  public rotateLeft() {
    this.loading = true;
    setTimeout(() => {
      this.canvasRotation--;
      this.flipAfterRotate();
    });
  }

  public rotateRight() {
    this.loading = true;
    setTimeout(() => {
      this.canvasRotation++;
      this.flipAfterRotate();
    });
  }

  public moveLeft() {
    this.transform = {
      ...this.transform,
      translateH: ++this.translateH
    };
  }

  public moveRight() {
    this.transform = {
      ...this.transform,
      translateH: --this.translateH
    };
  }

  public moveTop() {
    this.transform = {
      ...this.transform,
      translateV: ++this.translateV
    };
  }

  public moveBottom() {
    this.transform = {
      ...this.transform,
      translateV: --this.translateV
    };
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
    this.translateH = 0;
    this.translateV = 0;
  }

  public flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  public flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  public resetImage() {
    this.scale = 1;
    this.rotation = 0;
    this.canvasRotation = 0;
    this.transform = {
      translateUnit: 'px'
    };
  }

  public zoomOut() {
    this.scale -= .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  public zoomIn() {
    this.scale += .1;
    this.transform = {
      ...this.transform,
      scale: this.scale
    };
  }

  public toggleContainWithinAspectRatio() {
    this.containWithinAspectRatio = !this.containWithinAspectRatio;
  }

  public toggleAspectRatio() {
    this.aspectRatio = this.aspectRatio === 4 / 3 ? 16 / 5 : 4 / 3;
  }

  public onclickEdit(selectedImage:any,index:number) {
    console.log(selectedImage);
    // if()
    this.previewImage(selectedImage,index)
  }
}
