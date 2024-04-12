import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {

  form: FormGroup;
  isSubmitting = false;
  matcher = new MyErrorStateMatcher();

  constructor(
    private _fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.form = this._fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(7)]],
      // verificationCode: ['', Validators.required],
      // asOwner: true
    });
  }

  async ngOnInit() {
  }

  get newPassword() {
    return this.form.get('newPassword')?.value as string;
  }

  // get verificationCode() {
  //   return this.form.get('verificationCode')?.value as string;
  // }

  // Deprecated
  // get asOwner() {
  //   return this.form.get('asOwner')?.value as boolean;
  // }

  async onSendCode() {

  }

  // async onResetPassword() {
  //   this.isSubmitting = true;
  //   try {
  //     this.authService.
  //     const res = this.authService.confirmPassword(this.newPassword, this.verificationCode);
  //     console.log('res =', res);
  //     this.router.navigate(['/customers']);
  //   } catch (e: any) {
  //     if (e.name == 'NotAuthorizedException') {
  //       alert('Incorrect username or password');
  //     }
  //   } finally {
  //     this.isSubmitting = false;
  //   }
  // }

}
