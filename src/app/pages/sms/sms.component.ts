import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '@model/role.model';
import { AuthService } from '@service/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent implements OnInit {

  @ViewChild('tabGroup') tabGroup: MatTabGroup | undefined;
  selectedIndex: number;
  Role = Role;

  showSendSmsTab: boolean = false;

  constructor(
    protected authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const tab = this.route.snapshot.queryParams['tab'];
    const tabToIndex = {
      'sms-history': 0,
      'send-sms': 1,
    } as any;
    this.selectedIndex = tab ? tabToIndex[tab] : 0;
  }

  async ngOnInit() {
    const queryParams = this.route.snapshot.queryParams;
    const tab = queryParams['tab'];
    const defaultTab = 'sms-history';
    const curRole = await this.authService.getCurUserRole();
    this.showSendSmsTab = curRole == Role.OWNER;
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
      0: 'sms-history',
      1: 'send-sms',
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
