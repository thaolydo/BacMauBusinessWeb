import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { AuthService } from 'src/app/services/auth.service';

// Deprecated in favor of using Cognito hosted UI for the web app client
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private _fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.form = this._fb.group({
      newPassword: ['', Validators.required],
      verificationCode: ['', Validators.required],
      // asOwner: true
    });
  }

  async ngOnInit() {
    window.open(
      'https://pham-sms.auth.us-east-1.amazoncognito.com/forgotPassword?client_id=1pi94tnfo5aasrpmb8tb498baa&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fcustomers',
      '_blank');
    // await this.authService.forgotPassword();
    // if (await this.authService.getCurUser()) {
    //   this.router.navigate(['/customers']);
    // }
  }

  get newPassword() {
    return this.form.get('newPassword')?.value as string;
  }

  get verificationCode() {
    return this.form.get('verificationCode')?.value as string;
  }

  // Deprecated
  // get asOwner() {
  //   return this.form.get('asOwner')?.value as boolean;
  // }

  async onSendCode() {

  }

  async onResetPassword() {
    this.isSubmitting = true;
    try {
      const res = this.authService.confirmPassword(this.newPassword, this.verificationCode);
      console.log('res =', res);
      this.router.navigate(['/customers']);
    } catch (e: any) {
      if (e.name == 'NotAuthorizedException') {
        alert('Incorrect username or password');
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
