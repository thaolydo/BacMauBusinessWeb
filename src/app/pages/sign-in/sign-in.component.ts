import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { Role } from '@model/role.model';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  form: FormGroup;
  isSubmitting = false;
  landingPage: string | undefined = undefined;
  resetPasswordLink = this.authService.buildHostedUiForgotPasswordPage();

  constructor(
    private _fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ) {
    this.form = this._fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async ngOnInit() {
    // this.dialog.open(ResetPasswordComponent);
    const curUser = await this.authService.getCurUser();
    if (curUser) {
      console.log('Already signed in. Navigating to page /customers');
      const role = await this.authService.getCurUserRole();
      const landingPage = role == Role.CHECK_IN ? 'customer-check-in' : 'customers';
      await this.router.navigate([`/${landingPage}`]);
    }
    const queryParams = this.route.snapshot.queryParams;
    this.landingPage = queryParams['landing_page'] ? queryParams['landing_page'] : this.landingPage;
    console.log('landing page:', this.landingPage);
  }

  get username() {
    return this.form.get('username')?.value as string;
  }

  get password() {
    return this.form.get('password')?.value as string;
  }

  async onSubmit() {
    this.isSubmitting = true;
    try {
      const res = await this.authService.signIn(this.username.toLowerCase(), this.password);
      const role = await this.authService.getCurUserRole();
      const landingPage = this.landingPage ? this.landingPage :
        role == Role.CHECK_IN ? 'customer-check-in' : 'customers';

      console.log('res =', res);
      await this.router.navigate([`/${landingPage}`]);
    } catch (e: any) {
      if (e.name == 'NotAuthorizedException') {
        alert('Incorrect username or password');
      }
      if (e.name == 'UserNotFoundException') {
        alert(`User doesn't exist. Please try again`);
      }
    } finally {
      this.isSubmitting = false;
    }
  }

}
