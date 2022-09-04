import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { AuthEventType } from 'src/app/model/auth-event-types.enum';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  curUser: CognitoUser | undefined;
  authEventSubscription: Subscription | undefined;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) {
    // this.authEventSubscription = this.authService.getAuthEventUpdates().subscribe(async event => {
    //   console.log('NavBarComponent: auth event =', event);
    //   if (event == AuthEventType.SIGNED_IN || event == AuthEventType.ATTRIBUTE_UPDATED) {
    //     this.curUser = await this.authService.getCurUser();
    //   } else if (event == AuthEventType.SIGNED_OUT) {
    //     this.curUser = undefined;
    //   }
    // });
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
    // await this.authService.signOut();
    console.log('current route =', this.router.url);
    this.router.navigate(['/customer-check-in']);
    this.snackBar.open('Successfully logged out', 'close', { duration: 3000 });
  }

}
