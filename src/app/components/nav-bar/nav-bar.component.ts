import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  @Input() businessName: string = 'Venus'; // TODO: get it from query params in the current url

  curUser: CognitoUser | undefined;
  authEventSubscription: Subscription | undefined;
  showNavBar: boolean = true;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // this.authEventSubscription = this.authService.getAuthEventUpdates().subscribe(async event => {
    //   console.log('NavBarComponent: auth event =', event);
    //   if (event == AuthEventType.SIGNED_IN || event == AuthEventType.ATTRIBUTE_UPDATED) {
    //     this.curUser = await this.authService.getCurUser();
    //   } else if (event == AuthEventType.SIGNED_OUT) {
    //     this.curUser = undefined;
    //   }
    // });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('url =', event.url);
        if (event.url == '/' || event.url.startsWith('/customer-check-in')) {
          this.showNavBar = false;
        }
      }
    });
  }

  async ngOnInit() {
    try {
      this.curUser = await this.authService.getCurUser();
    } catch (err) {
      console.log('nav-bar onInit: User not logged in');

      // TODO: Remove this line below
      // this.curUser = {} as CognitoUser;
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
