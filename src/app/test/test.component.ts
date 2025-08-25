import { Component, OnInit } from '@angular/core';
import { OpenMode } from 'node:fs';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent implements OnInit {
  ngOnInit(): void {
    console.log('TestComponent initialized');
    // Initialization logic here
  }

}
