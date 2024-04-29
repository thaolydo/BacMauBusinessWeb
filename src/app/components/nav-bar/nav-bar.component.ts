import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthEventType } from '@model/auth-event-types.enum';
import { Role } from '@model/role.model';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  curUser: CognitoUser | null = null;
  authEventSubscription: Subscription | undefined;
  showNavBar: boolean = true;
  Role = Role;
  curRole: Role | undefined = undefined;
  curBusinessName: string | undefined = undefined;

  constructor(
    protected authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
  ) {
    this.authEventSubscription = this.authService.getAuthEventUpdates().subscribe(async event => {
      console.log('NavBarComponent: auth event =', event);
      if (event == AuthEventType.SIGNED_IN || event == AuthEventType.ATTRIBUTE_UPDATED) {
        this.curUser = await this.authService.getCurUser();
        this.curRole = await this.authService.getCurUserRole(true);
        this.curBusinessName = await this.authService.getDefaultBusinessName();
        this.titleService.setTitle(this.curBusinessName);
      } else if (event == AuthEventType.SIGNED_OUT) {
        this.curUser = null;
        this.curRole = undefined;
        this.curBusinessName = undefined;
        this.titleService.setTitle('TicTex');
      }
    });
    this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        console.log('nav bar: current url =', event.url);
        const saveClickThroughCountLinkRegex = /^\/c\?id=.*/;
        // if (event.url == '/' || event.url.startsWith('/customer-check-in') || event.url.startsWith('/sign-in') || saveClickThroughCountLinkRegex.test(event.url)) {
        if (event.url == '/' || event.url.startsWith('/sign-in') || event.url.startsWith('/claimed-promotion') || saveClickThroughCountLinkRegex.test(event.url)) {
          this.showNavBar = false;
        } else {
          this.showNavBar = true;
        }
      }
    });
  }

  async ngOnInit() {
    try {
      this.curUser = await this.authService.getCurUser();
      this.curRole = await this.authService.getCurUserRole(true);
      this.curBusinessName = await this.authService.getDefaultBusinessName();
      this.titleService.setTitle(this.curBusinessName);
    } catch (err) {
      console.log('nav-bar onInit: User not logged in', err);
    }
  }

  ngOnDestroy() {
    this.authEventSubscription?.unsubscribe();
  }

  async onLogout() {
    console.log('Logging out');
    await this.authService.signOut();
    console.log('current route =', this.router.url);
    this.router.navigate(['/sign-in']);
    this.snackBar.open('Successfully logged out', 'close', { duration: 3000 });
  }

}
