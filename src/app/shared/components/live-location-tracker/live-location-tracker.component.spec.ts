import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveLocationTrackerComponent } from './live-location-tracker.component';

describe('LiveLocationTrackerComponent', () => {
  let component: LiveLocationTrackerComponent;
  let fixture: ComponentFixture<LiveLocationTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveLocationTrackerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveLocationTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
