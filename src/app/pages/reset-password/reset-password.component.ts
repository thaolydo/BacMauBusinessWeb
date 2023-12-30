import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { AuthService } from 'src/app/services/auth.service';

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
    await this.authService.forgotPassword();
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
