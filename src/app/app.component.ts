import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  browserWidth: number | undefined = window.innerWidth || document.documentElement.clientWidth;
  browserHeight: number | undefined = window.innerHeight || document.documentElement.clientHeight;

  constructor() {
  }
}
