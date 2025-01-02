import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true,
  imports: [NgOptimizedImage]
})
export class HeaderComponent {
  constructor(
    private router: Router
  ) { }
  public redirectTo(route: string) {
    this.router.navigate([  '/'+ route])
  }

}
