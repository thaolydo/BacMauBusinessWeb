import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthEventType } from '@model/auth-event-types.enum';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  @Input() businessName: string = 'Life Reflexology'; // TODO: get it from query params in the current url

  curUser: CognitoUser | null = null;
  userPoolId = undefined;
  authEventSubscription: Subscription | undefined;
  showNavBar: boolean = true;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.authEventSubscription = this.authService.getAuthEventUpdates().subscribe(async event => {
      console.log('NavBarComponent: auth event =', event);
      if (event == AuthEventType.SIGNED_IN || event == AuthEventType.ATTRIBUTE_UPDATED) {
        this.curUser = await this.authService.getCurUser();
        this.userPoolId = (this.curUser as any).pool.userPoolId;
      } else if (event == AuthEventType.SIGNED_OUT) {
        this.curUser = null;
        this.userPoolId = undefined;
      }
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('current url =', event.url);
        if (event.url == '/' || event.url.startsWith('/customer-check-in') || event.url.startsWith('/sign-in')) {
          this.showNavBar = false;
        } else {
          this.showNavBar = true;
        }
      }
    });
  }

  get ownerUserPoolId() {
    return environment.ownerUserPoolId;
  }

  async ngOnInit() {
    try {
      this.curUser = await this.authService.getCurUser();
      this.userPoolId = (this.curUser as any).pool.userPoolId;
    } catch (err) {
      console.log('nav-bar onInit: User not logged in');
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
