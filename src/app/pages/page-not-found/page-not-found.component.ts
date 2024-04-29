import { Component } from '@angular/core';
import { NavBarEventType, NavBarService } from '@service/nav-bar.service';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {

  constructor(private navBarService: NavBarService) {
  }

  ngOnInit() {
    this.navBarService.getNavBarEventSubject().next(NavBarEventType.HIDE_NAV_BAR);
  }

}
