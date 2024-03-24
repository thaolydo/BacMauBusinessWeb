import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@service/auth.service';

@Component({
  selector: 'app-email-verification-dialog',
  templateUrl: './email-verification-dialog.component.html',
  styleUrls: ['./email-verification-dialog.component.scss']
})
export class EmailVerificationDialogComponent {

  isSubmitting: boolean = false;
  codeMismatch = false;
  codeMatch = false;
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<EmailVerificationDialogComponent>,
    private authService: AuthService,
    private router: Router,
    private _fb: FormBuilder,
  ) {
    this.form = this._fb.group({
      verificationCode: ['', Validators.required],
    });
  }

  async onVerify() {
    try {
      const res = await this.authService.verifyEmail(this.form.get('verificationCode')?.value);
      this.codeMatch = true;
      this.codeMismatch = false;
      await new Promise(resolve => setTimeout(resolve, 100));
      alert('Email has been verified successfully. Please sign-in again.');
      await this.authService.signOut();
      this.router.navigate(['/sign-in'], {
        queryParams: {
          landing_page: 'settings'
        }
      });
      this.dialogRef.close();
    } catch (err: any) {
      console.log('err =', err.name);
      if (err.name === 'CodeMismatchException') {
        this.codeMismatch = true;
        console.log('incorrect code');
        return;
      }
      throw err;
    }
  }

}
