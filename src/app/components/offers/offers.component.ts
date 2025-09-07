import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent {
  offers = [
    {
      id: 1,
      title: 'Living Room Sets',
      discount: '25% OFF',
      description: 'On premium living room furniture',
      code: 'LIVING25',
      validTill: '2024-12-31',
      image: '/assets/images/living-room-offer.jpg'
    },
    {
      id: 2,
      title: 'Bedroom Collection',
      discount: '20% OFF',
      description: 'On beds, wardrobes, and nightstands',
      code: 'BEDROOM20',
      validTill: '2024-12-31',
      image: '/assets/images/bedroom-offer.jpg'
    },
    {
      id: 3,
      title: 'Free Assembly',
      discount: 'FREE',
      description: 'On orders above ₹25,000',
      code: 'FREEASSEMBLY',
      validTill: '2024-12-31',
      image: '/assets/images/assembly-offer.jpg'
    }
  ];
}
