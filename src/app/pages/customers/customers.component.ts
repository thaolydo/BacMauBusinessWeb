import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  @ViewChild('tabGroup') tabGroup: MatTabGroup | undefined;
  selectedIndex: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const tab = this.route.snapshot.queryParams['tab'];
    const tabToIndex = {
      'check-in': 0,
      'customer-list': 1,
    } as any;
    this.selectedIndex = tab ? tabToIndex[tab] : 0;
    console.log('selectedIndex =', this.selectedIndex);
  }

  async ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    const tab = queryParams['tab'];
    const defaultTab = 'check-in';
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: tab ? tab : defaultTab,
      },
      queryParamsHandling: 'merge',
    });
  }

  async onSelectedTabChange(event: MatTabChangeEvent) {
    const selectedIndex = event.index;
    const indexToTab = {
      0: 'check-in',
      1: 'customer-list',
    } as any;

    // Clear out all the query params
    await this.router.navigate([], {
      relativeTo: this.route,
    });

    // Append the corresponding tab to the query params
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: indexToTab[selectedIndex],
      },
      queryParamsHandling: 'merge',
    });
  }

}
