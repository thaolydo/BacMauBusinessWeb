import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavBarService {

  private navBarEventSubject = new Subject();

  constructor() { }

  getNavBarEventSubject() {
    return this.navBarEventSubject;
  }

}

export enum NavBarEventType {
  SHOW_NAV_BAR = 'SHOW_NAV_BAR',
  HIDE_NAV_BAR = 'HIDE_NAV_BAR',
}
