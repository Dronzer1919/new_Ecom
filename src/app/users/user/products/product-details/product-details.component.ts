import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./product-details.component.scss']
})
  
export class ProductDetailsComponent implements OnInit, OnDestroy {
  timeLeft: number = 300;
  key1: any;
  device: any;
  photos: any[] = [];
  timeLeftString: string | undefined;
  data: any;
  intervalId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inject PLATFORM_ID to check platform
  ) {}

  ngOnInit(): void {
    // Check if we're in the browser (avoid SSR issues)
    if (isPlatformBrowser(this.platformId)) {
      // Safely access localStorage only in the browser
      const value = JSON.parse(localStorage.getItem('details') || '{}');
      console.log(value);
      this.data = value;

      // Start the countdown timer
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startTimer(): void {
    this.intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeLeftString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
    }, 1000);
  }

  gotoCart(value: any) {
    this.router.navigate(['/addToCart/', value.im]);
  }
}
